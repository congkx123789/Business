"""Main LAM agent orchestrator - Perceive → Think → Act loop."""
from typing import Dict, Any, Optional, List
from pathlib import Path
import time
from ai_agent.control.lam_planner import LAMPlanner
from ai_agent.perception.screenshot import capture_screenshot
from ai_agent.perception.dom import snapshot as dom_snapshot
from ai_agent.perception.vision import VisionGrounding
from ai_agent.perception.fusion import UIGraphBuilder
from ai_agent.action.desktop_executor import DesktopExecutor
from ai_agent.action.web_executor import WebExecutor
from ai_agent.training.state_action import Trajectory, TrajectoryStore
from ai_agent.monitoring.notifications import AgentNotifier, print_status
from ai_agent.monitoring.footprint import ResourceMonitor
from ai_agent.understanding.input_parser import InputParser, ParsedIntent
from ai_agent.understanding.output_analyzer import OutputAnalyzer, ExecutionResult


class LAMAgent:
    """Large Action Model Agent - complete Perceive→Think→Act loop."""
    
    def __init__(
        self,
        mode: str = "desktop",  # desktop or web
        llm_api_key: Optional[str] = None,
        vision_api_key: Optional[str] = None,
        enable_notifications: bool = True,
        enable_monitoring: bool = True,
        monitoring_interval: float = 1.0,
        enable_footprint: bool = True,
        footprint_config: Optional[Dict[str, Any]] = None,
    ):
        """Initialize LAM Agent.
        
        Args:
            mode: Execution mode (desktop or web)
            llm_api_key: API key for LLM planner
            vision_api_key: API key for vision model
            enable_notifications: Enable desktop notifications
            enable_monitoring: Enable resource footprint monitoring
            monitoring_interval: Resource monitoring interval in seconds
            enable_footprint: Enable footprint overlay visualization
            footprint_config: Footprint overlay configuration
        """
        self.mode = mode
        
        # Initialize components
        self.planner = LAMPlanner(api_key=llm_api_key)
        self.vision = VisionGrounding(api_key=vision_api_key) if vision_api_key else None
        self.ui_graph_builder = UIGraphBuilder()
        
        # Input/Output understanding
        self.input_parser = InputParser()
        self.output_analyzer = OutputAnalyzer()
        
        # Executor based on mode
        if mode == "desktop":
            self.executor = DesktopExecutor(
                enable_footprint=enable_footprint,
                footprint_config=footprint_config,
            )
        else:
            self.executor = WebExecutor()
        
        # Trajectory store for learning
        self.trajectory_store = TrajectoryStore(Path("trajectories"))
        
        # Monitoring and notifications
        self.notifier = AgentNotifier(enabled=enable_notifications)
        self.monitor = ResourceMonitor(
            enabled=enable_monitoring,
            interval=monitoring_interval,
            output_dir=Path("footprints")
        )
        self.start_time: Optional[float] = None
    
    def run(
        self,
        goal: str,
        max_steps: int = 20,
        save_trajectory: bool = True,
    ) -> Dict[str, Any]:
        """Run agent on a goal.
        
        Args:
            goal: High-level user goal
            max_steps: Maximum steps before stopping
            save_trajectory: Whether to save trajectory for training
        
        Returns:
            Execution result with trajectory
        """
        # Parse and understand user input
        parsed_intent = self.input_parser.parse(goal)
        
        trajectory_steps = []
        current_state = None
        execution_results = []
        
        for step_num in range(max_steps):
            # Perceive: Capture current state
            screenshot_before = Path(f"temp_screenshot_{step_num}_before.png")
            capture_screenshot(screenshot_before)
            
            dom_state = dom_snapshot()
            
            # Build UI Graph
            vision_elements = []
            if self.vision:
                vision_elements = self.vision.detect_elements(screenshot_before)
            
            ui_graph = self.ui_graph_builder.build(
                dom_snapshot=dom_state,
                vision_elements=vision_elements,
                screenshot_path=screenshot_before,
            )
            
            current_state = {
                "screenshot": str(screenshot_before),
                "dom": dom_state,
                "ui_graph": ui_graph,
            }
            
            # Think: Plan next action
            plan = self.planner.plan(goal, current_state)
            
            if not plan:
                break
            
            next_step = plan[0]
            
            # Act: Execute action
            if next_step.get("kind"):
                action = {
                    "action_id": next_step.get("id", f"action-{step_num}"),
                    "kind": next_step["kind"],
                    "target": next_step.get("target", {}),
                    "input_text": next_step.get("input_text", ""),
                    "meta": {},
                }
                
                observation = self.executor.execute(action)
                
                # Capture screenshot after action
                screenshot_after = Path(f"temp_screenshot_{step_num}_after.png")
                capture_screenshot(screenshot_after)
                
                # Understand the output/result
                execution_result = self.output_analyzer.analyze_execution(
                    observation,
                    before_screenshot=screenshot_before,
                    after_screenshot=screenshot_after
                )
                execution_results.append(execution_result)
                
                trajectory_steps.append({
                    "step": step_num,
                    "state": current_state,
                    "action": action,
                    "observation": observation,
                    "execution_result": {
                        "success": execution_result.success,
                        "status": execution_result.status,
                        "confidence": execution_result.confidence,
                        "changes_detected": execution_result.changes_detected,
                    },
                })
                
                # Check if goal achieved
                if observation.get("status") == "fatal":
                    break
                
                # Update state from observation
                if "evidence" in observation:
                    current_state.update(observation["evidence"])
            else:
                # Planning step only
                trajectory_steps.append({
                    "step": step_num,
                    "state": current_state,
                    "action": None,
                    "observation": {"status": "plan_only"},
                })
        
        # Understand if goal was achieved
        goal_achievement = self.output_analyzer.understand_goal_achievement(
            goal,
            execution_results,
            current_state
        )
        
        # Save trajectory for training
        success = goal_achievement.get("achieved", False) or (
            len(trajectory_steps) > 0 and 
            trajectory_steps[-1].get("observation", {}).get("status") == "ok"
        )
        
        if save_trajectory:
            from ai_agent.training.il_pipeline import collect_trajectory
            trajectory = collect_trajectory(
                goal=goal,
                steps=trajectory_steps,
                success=success,
                store=self.trajectory_store,
            )
        else:
            trajectory = None
        
        # Generate execution summary
        summary = self.output_analyzer.summarize_execution(execution_results)
        
        return {
            "goal": goal,
            "parsed_intent": {
                "intent_type": parsed_intent.intent_type,
                "action_kind": parsed_intent.action_kind,
                "confidence": parsed_intent.confidence,
            },
            "success": success,
            "goal_achievement": goal_achievement,
            "steps": len(trajectory_steps),
            "summary": summary,
            "trajectory": trajectory,
            "trajectory_steps": trajectory_steps,
        }
    
    def stop(self) -> None:
        """Stop the agent."""
        if hasattr(self.executor, "stop"):
            self.executor.stop()

