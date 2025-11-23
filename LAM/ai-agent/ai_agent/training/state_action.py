"""State-action representation for LAM training."""
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from pathlib import Path
import json


@dataclass
class StateActionPair:
    """Represents a state-action pair for imitation learning."""
    state: Dict[str, Any]  # Screenshot, DOM, UI Graph
    action: Dict[str, Any]  # Action taken
    next_state: Optional[Dict[str, Any]] = None  # Resulting state
    reward: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Trajectory:
    """Represents a complete trajectory (episode)."""
    goal: str
    steps: list[StateActionPair]
    success: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "goal": self.goal,
            "steps": [
                {
                    "state": step.state,
                    "action": step.action,
                    "next_state": step.next_state,
                    "reward": step.reward,
                    "metadata": step.metadata,
                }
                for step in self.steps
            ],
            "success": self.success,
            "metadata": self.metadata,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Trajectory":
        """Create from dictionary."""
        steps = [
            StateActionPair(
                state=s["state"],
                action=s["action"],
                next_state=s.get("next_state"),
                reward=s.get("reward", 0.0),
                metadata=s.get("metadata", {}),
            )
            for s in data.get("steps", [])
        ]
        return cls(
            goal=data["goal"],
            steps=steps,
            success=data.get("success", False),
            metadata=data.get("metadata", {}),
        )


class TrajectoryStore:
    """Stores and manages trajectories for training."""
    
    def __init__(self, store_path: Path):
        """Initialize trajectory store."""
        self.store_path = Path(store_path)
        self.store_path.mkdir(parents=True, exist_ok=True)
    
    def save(self, trajectory: Trajectory, filename: Optional[str] = None) -> Path:
        """Save trajectory to disk.
        
        Args:
            trajectory: Trajectory to save
            filename: Optional filename (auto-generated if None)
        
        Returns:
            Path to saved file
        """
        if filename is None:
            import uuid
            filename = f"trajectory-{uuid.uuid4()}.json"
        
        file_path = self.store_path / filename
        file_path.write_text(json.dumps(trajectory.to_dict(), indent=2))
        
        return file_path
    
    def load(self, filename: str) -> Trajectory:
        """Load trajectory from disk.
        
        Args:
            filename: Filename to load
        
        Returns:
            Trajectory object
        """
        file_path = self.store_path / filename
        data = json.loads(file_path.read_text())
        return Trajectory.from_dict(data)
    
    def list_all(self) -> List[str]:
        """List all trajectory filenames.
        
        Returns:
            List of filenames
        """
        return [f.name for f in self.store_path.glob("trajectory-*.json")]

