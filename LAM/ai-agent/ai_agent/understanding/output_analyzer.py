"""Output understanding and analysis for AI agent execution results."""
from __future__ import annotations

import time
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
    HAS_IMAGE_PROCESSING = True
except ImportError:
    HAS_IMAGE_PROCESSING = False


@dataclass
class ExecutionResult:
    """Analyzed execution result."""
    success: bool
    status: str  # 'ok', 'error', 'partial', 'unknown'
    confidence: float  # 0.0 to 1.0
    changes_detected: bool
    screen_changes: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    evidence: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.evidence is None:
            self.evidence = {}


class OutputAnalyzer:
    """Analyze and understand execution outputs and screen changes."""
    
    def __init__(self):
        """Initialize the output analyzer."""
        self.last_screenshot: Optional[Image.Image] = None
        self.last_screenshot_path: Optional[Path] = None
    
    def analyze_execution(
        self,
        observation: Dict[str, Any],
        before_screenshot: Optional[Path] = None,
        after_screenshot: Optional[Path] = None
    ) -> ExecutionResult:
        """Analyze execution result and understand what happened.
        
        Args:
            observation: Execution observation from executor
            before_screenshot: Screenshot before action
            after_screenshot: Screenshot after action
            
        Returns:
            ExecutionResult with analysis
        """
        status = observation.get("status", "unknown")
        evidence = observation.get("evidence", {})
        
        # Basic success determination
        success = status == "ok"
        confidence = 0.7 if success else 0.5
        
        # Detect screen changes
        changes_detected = False
        screen_changes = None
        
        if before_screenshot and after_screenshot:
            changes = self._detect_screen_changes(before_screenshot, after_screenshot)
            if changes:
                changes_detected = True
                screen_changes = changes
                # If screen changed, action likely succeeded
                if success:
                    confidence = 0.9
                else:
                    confidence = 0.6  # Screen changed but status says error
        
        # Extract error information
        error_message = None
        if not success:
            error_message = evidence.get("error", "Unknown error")
            if error_message:
                confidence = 0.8  # We have specific error info
        
        # Analyze evidence for success indicators
        if evidence:
            # Check for positive indicators
            if "clicked_at" in evidence or "typed" in evidence:
                confidence = min(1.0, confidence + 0.1)
            
            # Check for negative indicators
            if "error" in evidence:
                confidence = max(0.3, confidence - 0.2)
        
        return ExecutionResult(
            success=success,
            status=status,
            confidence=confidence,
            changes_detected=changes_detected,
            screen_changes=screen_changes,
            error_message=error_message,
            evidence=evidence
        )
    
    def _detect_screen_changes(
        self,
        before_path: Path,
        after_path: Path
    ) -> Optional[Dict[str, Any]]:
        """Detect changes between two screenshots.
        
        Args:
            before_path: Path to screenshot before action
            after_path: Path to screenshot after action
            
        Returns:
            Dictionary with change information or None
        """
        if not HAS_IMAGE_PROCESSING:
            return None
        
        try:
            if not before_path.exists() or not after_path.exists():
                return None
            
            before_img = Image.open(before_path)
            after_img = Image.open(after_path)
            
            # Resize if different sizes
            if before_img.size != after_img.size:
                after_img = after_img.resize(before_img.size, Image.Resampling.LANCZOS)
            
            # Convert to numpy arrays
            before_arr = np.array(before_img)
            after_arr = np.array(after_img)
            
            # Calculate difference
            diff = np.abs(before_arr.astype(np.int16) - after_arr.astype(np.int16))
            total_diff = np.sum(diff)
            max_diff = diff.max()
            mean_diff = diff.mean()
            
            # Threshold for "significant change"
            threshold = before_img.size[0] * before_img.size[1] * 10  # Adjustable
            
            if total_diff > threshold:
                # Find regions with significant changes
                diff_mask = diff.sum(axis=2) > 30  # Pixels that changed significantly
                changed_pixels = np.sum(diff_mask)
                change_percentage = (changed_pixels / diff_mask.size) * 100
                
                return {
                    "changed": True,
                    "change_percentage": float(change_percentage),
                    "total_diff": int(total_diff),
                    "max_diff": int(max_diff),
                    "mean_diff": float(mean_diff),
                    "changed_pixels": int(changed_pixels),
                }
            else:
                return {
                    "changed": False,
                    "change_percentage": 0.0,
                    "total_diff": int(total_diff),
                }
        
        except Exception as e:
            return {"error": str(e)}
    
    def understand_goal_achievement(
        self,
        goal: str,
        execution_results: List[ExecutionResult],
        current_state: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Understand if the goal has been achieved.
        
        Args:
            goal: Original user goal
            execution_results: List of execution results
            current_state: Current UI state
            
        Returns:
            Dictionary with achievement analysis
        """
        if not execution_results:
            return {
                "achieved": False,
                "confidence": 0.0,
                "reason": "No execution results"
            }
        
        # Count successful steps
        successful_steps = sum(1 for r in execution_results if r.success)
        total_steps = len(execution_results)
        success_rate = successful_steps / total_steps if total_steps > 0 else 0.0
        
        # Check if last step was successful
        last_success = execution_results[-1].success if execution_results else False
        
        # Analyze goal keywords
        goal_lower = goal.lower()
        
        # Simple heuristics for goal achievement
        achieved = False
        confidence = 0.5
        reason = ""
        
        if success_rate >= 0.8 and last_success:
            achieved = True
            confidence = 0.8
            reason = f"High success rate ({success_rate:.0%}) and last step succeeded"
        
        # Check for specific goal completion indicators
        if "click" in goal_lower:
            # Check if any click action succeeded
            clicks = [r for r in execution_results if r.evidence.get("clicked_at")]
            if clicks:
                achieved = True
                confidence = 0.9
                reason = "Click action completed successfully"
        
        if "type" in goal_lower or "enter" in goal_lower:
            # Check if typing succeeded
            types = [r for r in execution_results if r.evidence.get("typed")]
            if types:
                achieved = True
                confidence = 0.9
                reason = "Text input completed successfully"
        
        if "navigate" in goal_lower or "go to" in goal_lower:
            # Check if navigation succeeded
            if current_state and current_state.get("url"):
                achieved = True
                confidence = 0.85
                reason = "Navigation completed"
        
        return {
            "achieved": achieved,
            "confidence": confidence,
            "reason": reason,
            "success_rate": success_rate,
            "successful_steps": successful_steps,
            "total_steps": total_steps
        }
    
    def summarize_execution(
        self,
        execution_results: List[ExecutionResult]
    ) -> str:
        """Generate a human-readable summary of execution.
        
        Args:
            execution_results: List of execution results
            
        Returns:
            Summary string
        """
        if not execution_results:
            return "No execution results"
        
        successful = sum(1 for r in execution_results if r.success)
        total = len(execution_results)
        
        summary_parts = [
            f"Executed {total} step(s)",
            f"Success: {successful}/{total}",
        ]
        
        if successful < total:
            errors = [r.error_message for r in execution_results if r.error_message]
            if errors:
                summary_parts.append(f"Errors: {len(errors)}")
        
        return ". ".join(summary_parts)


__all__ = ["OutputAnalyzer", "ExecutionResult"]

