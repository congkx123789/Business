# Large Action Model (LAM) - Architecture Overview

This project implements a **Large Action Model (LAM)** - an AI agent that can control computers like humans by combining:

1. **Hierarchical Planning** (LLM-based goal decomposition)
2. **Vision + DOM Fusion** (Multi-modal UI understanding)
3. **Action Tokenization** (Structured action representation)
4. **ReAct Loop** (Reasoning → Acting → Observing)
5. **Imitation Learning** (Learning from human trajectories)

## Key Components

### 1. LAM Planner (`ai_agent/control/lam_planner.py`)
- Uses LLM to decompose high-level goals into actionable steps
- Supports ReAct-style reasoning loop
- Fallback to heuristic planning when LLM unavailable

### 2. Vision Grounding (`ai_agent/perception/vision.py`)
- Uses Vision Language Models (VLM) to detect UI elements
- Returns bounding boxes for interactive elements
- Supports element search by description

### 3. UI Graph Builder (`ai_agent/perception/fusion.py`)
- Fuses DOM + Vision data into unified UI Graph
- Represents spatial/hierarchical relationships
- Enables robust element targeting

### 4. Action Tokenizer (`ai_agent/action/tokenizer.py`)
- Converts actions to/from token sequences
- Enables training on action sequences
- Supports action vocabulary

### 5. State-Action Representation (`ai_agent/training/state_action.py`)
- Stores trajectories (state-action pairs)
- Serializes for training data
- Supports imitation learning pipeline

### 6. Imitation Learning (`ai_agent/training/il_pipeline.py`)
- Collects trajectories from execution
- Prepares training data (state → action pairs)
- Ready for fine-tuning LLM/VLM

### 7. LAM Agent (`ai_agent/lam_agent.py`)
- Orchestrates full Perceive → Think → Act loop
- Integrates all components
- Saves trajectories automatically

## Usage

### Basic LAM Mode (with LLM)

```powershell
# Set API key
$env:OPENAI_API_KEY = "sk-..."

# Run with LAM
python -m ai_agent.apps.cli run --goal "Search for Python tutorials" --mode lam
```

### LAM Features

- **Automatic Planning**: LLM decomposes your goal into steps
- **Vision Understanding**: Detects UI elements using screenshots
- **Learning**: Saves trajectories in `trajectories/` for future training
- **Robust Grounding**: Combines DOM + Vision for reliable targeting

## Training Your Own LAM

1. **Collect Trajectories**: Run agent on various tasks
   ```python
   from ai_agent.lam_agent import LAMAgent
   agent = LAMAgent(mode="desktop")
   agent.run("Complete task", save_trajectory=True)
   ```

2. **Prepare Training Data**:
   ```python
   from ai_agent.training.il_pipeline import train_il
   from ai_agent.training.state_action import TrajectoryStore
   
   store = TrajectoryStore("trajectories")
   trajectories = [store.load(f) for f in store.list_all()]
   
   train_il(trajectories, output_dir="models/lam")
   ```

3. **Fine-tune Model**: (Requires ML framework)
   - Use PyTorch/TensorFlow to fine-tune LLM on state-action pairs
   - Train on action token sequences
   - Deploy fine-tuned model

## Architecture Principles

Based on your knowledge documents:

- **World Model (Planner)**: High-level reasoning and goal decomposition
- **Action Engine (Executor)**: Low-level action execution
- **Dual Grounding**: DOM-first with vision fallback for robustness
- **Hierarchical Actions**: Fine-grained actions guided by strategic plans
- **Continuous Learning**: Collect trajectories → Train → Improve

## Next Steps

1. **Add Dataset Loaders**: Mind2Web, WebArena, WaveUI-25K
2. **Implement RL Pipeline**: Reinforcement learning for robustness
3. **Add Web Executor**: Playwright integration for browser automation
4. **Vision Model Integration**: Connect to local/open-source VLM
5. **Model Training**: Fine-tune base LLM on collected trajectories

