"""LLM-based planner for Large Action Model (LAM)."""
import os
import json
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


@dataclass
class PlanStep:
    """Represents a single step in the plan."""
    id: str
    goal: str
    action_kind: Optional[str] = None
    target: Optional[Dict[str, Any]] = None
    input_text: Optional[str] = None
    preconditions: List[str] = None
    postconditions: List[str] = None
    success_criteria: List[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.preconditions is None:
            self.preconditions = []
        if self.postconditions is None:
            self.postconditions = []
        if self.success_criteria is None:
            self.success_criteria = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "goal": self.goal,
            "kind": self.action_kind,
            "target": self.target,
            "input_text": self.input_text,
            "pre": self.preconditions,
            "post": self.postconditions,
            "successCriteria": self.success_criteria,
        }


class LAMPlanner:
    """Large Action Model Planner - hierarchical goal decomposition with LLM."""
    
    def __init__(self, model: Optional[str] = None, api_key: Optional[str] = None):
        """Initialize planner with optional LLM backend."""
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        
        if self.api_key and OpenAI:
            self.client = OpenAI(api_key=self.api_key)
    
    def plan(self, goal: str, current_state: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Generate hierarchical plan from high-level goal.
        
        Args:
            goal: High-level user goal
            current_state: Current UI state (screenshot, DOM, etc.)
        
        Returns:
            List of plan steps with hierarchical decomposition
        """
        if self.client:
            return self._llm_plan(goal, current_state)
        else:
            return self._heuristic_plan(goal)
    
    def _llm_plan(self, goal: str, current_state: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Use LLM to decompose goal into actionable steps."""
        system_prompt = """You are a Large Action Model (LAM) planner. Your job is to decompose high-level goals into a sequence of concrete, executable actions.

Available action types:
- NAVIGATE: Navigate to URL
- CLICK: Click on UI element
- TYPE: Type text into input field
- SELECT: Select option from dropdown
- SCROLL: Scroll page
- HOTKEY: Press keyboard shortcut
- WAIT_FOR: Wait for condition

For each step, provide:
1. Action kind (CLICK, TYPE, etc.)
2. Target description (what to interact with)
3. Input text (if applicable)
4. Success criteria (how to verify completion)

Return a JSON array of steps."""
        
        user_prompt = f"Goal: {goal}\n\n"
        if current_state:
            user_prompt += f"Current state: {current_state.get('url', 'unknown')}\n"
        
        user_prompt += "\nGenerate a step-by-step plan to achieve this goal."
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"} if "o1" not in self.model else None,
            )
            
            import json
            content = response.choices[0].message.content
            plan_data = json.loads(content)
            
            # Parse LLM response into plan steps
            steps = plan_data.get("steps", [])
            plan_steps = []
            for i, step in enumerate(steps):
                plan_steps.append({
                    "id": f"step-{i+1}",
                    "goal": step.get("description", step.get("goal", "")),
                    "kind": step.get("action_kind", step.get("kind")),
                    "target": step.get("target", {}),
                    "input_text": step.get("input_text", ""),
                    "pre": step.get("preconditions", []),
                    "post": step.get("postconditions", []),
                    "successCriteria": step.get("success_criteria", []),
                })
            
            return plan_steps
        
        except Exception as e:
            # Fallback to heuristic if LLM fails
            return self._heuristic_plan(goal)
    
    def _heuristic_plan(self, goal: str) -> List[Dict[str, Any]]:
        """Fallback heuristic planning when LLM unavailable."""
        # Simple keyword-based decomposition
        goal_lower = goal.lower()
        
        steps = []
        step_id = 1
        
        # Detect navigation intent
        if any(word in goal_lower for word in ["go to", "open", "navigate", "visit"]):
            steps.append({
                "id": f"step-{step_id}",
                "goal": "Navigate to target URL",
                "kind": "NAVIGATE",
                "target": {},
                "pre": [],
                "post": [],
                "successCriteria": [{"url_contains": ""}],
            })
            step_id += 1
        
        # Detect typing intent
        if any(word in goal_lower for word in ["type", "enter", "input", "write"]):
            # Extract text to type
            text_to_type = goal
            for prefix in ["type", "enter", "input", "write"]:
                if prefix in goal_lower:
                    parts = goal.split(prefix, 1)
                    if len(parts) > 1:
                        text_to_type = parts[1].strip().strip('"').strip("'")
                        break
            
            steps.append({
                "id": f"step-{step_id}",
                "goal": f"Type: {text_to_type[:50]}",
                "kind": "TYPE",
                "input_text": text_to_type,
                "pre": [],
                "post": [],
                "successCriteria": [],
            })
            step_id += 1
        
        # Detect click intent
        if any(word in goal_lower for word in ["click", "press", "select", "choose"]):
            steps.append({
                "id": f"step-{step_id}",
                "goal": "Click on target element",
                "kind": "CLICK",
                "target": {},
                "pre": [],
                "post": [],
                "successCriteria": [],
            })
            step_id += 1
        
        # Default: high-level goal
        if not steps:
            steps.append({
                "id": f"step-{step_id}",
                "goal": goal,
                "pre": [],
                "post": [],
                "successCriteria": [],
            })
        
        return steps
    
    def react_loop(
        self,
        goal: str,
        executor,
        max_steps: int = 10,
        current_state: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """ReAct-style reasoning loop: Think → Act → Observe → Reflect.
        
        Args:
            goal: High-level goal
            executor: Action executor instance
            max_steps: Maximum steps before stopping
            current_state: Initial state
        
        Returns:
            List of (thought, action, observation) tuples
        """
        trajectory = []
        remaining_goal = goal
        
        for step_num in range(max_steps):
            # Think: Generate next action
            plan = self.plan(remaining_goal, current_state)
            if not plan:
                break
            
            next_step = plan[0]
            thought = f"Step {step_num + 1}: {next_step.get('goal', 'Unknown')}"
            
            # Act: Execute action
            if next_step.get("kind"):
                action = {
                    "action_id": next_step.get("id", f"action-{step_num}"),
                    "kind": next_step["kind"],
                    "target": next_step.get("target", {}),
                    "input_text": next_step.get("input_text", ""),
                    "meta": {},
                }
                
                observation = executor.execute(action)
                
                trajectory.append({
                    "step": step_num + 1,
                    "thought": thought,
                    "action": action,
                    "observation": observation,
                })
                
                # Stop if fatal error or goal achieved
                if observation.get("status") == "fatal":
                    break
                
                # Update state from observation
                if "evidence" in observation:
                    current_state = observation["evidence"]
            else:
                # No action to execute, just planning step
                trajectory.append({
                    "step": step_num + 1,
                    "thought": thought,
                    "action": None,
                    "observation": {"status": "plan_only"},
                })
            
            # Check if goal achieved (simplified)
            if next_step.get("successCriteria"):
                # In real implementation, verify success criteria
                break
        
        return trajectory

