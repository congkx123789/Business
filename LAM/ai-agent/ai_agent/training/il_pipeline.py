"""Imitation Learning pipeline for LAM."""
from typing import List, Dict, Any, Optional
from pathlib import Path
from ai_agent.training.state_action import Trajectory, StateActionPair, TrajectoryStore
from ai_agent.action.tokenizer import ActionTokenizer


def train_il(
    trajectories: List[Trajectory],
    output_dir: Path,
    model_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Train LAM using Imitation Learning from human trajectories.
    
    Args:
        trajectories: List of human demonstration trajectories
        output_dir: Directory to save model and training artifacts
        model_name: Optional model name/type
    
    Returns:
        Training metrics and model info
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    tokenizer = ActionTokenizer()
    
    # Convert trajectories to token sequences
    all_token_sequences = []
    for traj in trajectories:
        actions = [step.action for step in traj.steps]
        token_seqs = tokenizer.encode_trajectory(actions)
        all_token_sequences.extend(token_seqs)
    
    # Save training data
    training_data_path = output_dir / "training_data.json"
    training_data = {
        "num_trajectories": len(trajectories),
        "total_actions": len(all_token_sequences),
        "token_sequences": all_token_sequences,
    }
    
    import json
    training_data_path.write_text(json.dumps(training_data, indent=2))
    
    # In real implementation, this would:
    # 1. Fine-tune a base LLM/VLM on state-action pairs
    # 2. Use transformer architecture with action tokens
    # 3. Train on (state, action) → next_action prediction
    # 4. Save model checkpoint
    
    return {
        "status": "prepared",
        "num_trajectories": len(trajectories),
        "total_actions": len(all_token_sequences),
        "training_data_path": str(training_data_path),
        "note": "Full training requires ML framework integration (PyTorch/TensorFlow)",
    }


def collect_trajectory(
    goal: str,
    steps: List[Dict[str, Any]],
    success: bool,
    store: TrajectoryStore,
) -> Trajectory:
    """Collect and save a trajectory from execution.
    
    Args:
        goal: Goal that was attempted
        steps: List of (state, action, observation) tuples
        success: Whether goal was achieved
        store: Trajectory store
    
    Returns:
        Saved trajectory
    """
    trajectory_steps = []
    
    for i, step_data in enumerate(steps):
        state = step_data.get("state", {})
        action = step_data.get("action", {})
        observation = step_data.get("observation", {})
        
        # Extract next state from observation
        next_state = observation.get("evidence", {}) if observation else None
        
        # Calculate reward (simplified)
        reward = 1.0 if observation.get("status") == "ok" else -0.1
        
        pair = StateActionPair(
            state=state,
            action=action,
            next_state=next_state,
            reward=reward,
            metadata={"step": i},
        )
        trajectory_steps.append(pair)
    
    trajectory = Trajectory(
        goal=goal,
        steps=trajectory_steps,
        success=success,
    )
    
    store.save(trajectory)
    
    return trajectory


