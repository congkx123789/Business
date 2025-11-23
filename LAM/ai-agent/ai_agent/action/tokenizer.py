"""Action tokenization for LAM - converts actions to/from token sequences."""
from typing import List, Dict, Any
from ai_agent.action.dsl import ActionKind, Action


class ActionTokenizer:
    """Tokenizes actions for LAM training/inference."""
    
    # Action vocabulary
    ACTION_TOKENS = {
        "NAVIGATE": "<NAV>",
        "CLICK": "<CLK>",
        "TYPE": "<TYP>",
        "SELECT": "<SEL>",
        "SCROLL": "<SCR>",
        "HOTKEY": "<HOT>",
        "WAIT_FOR": "<WAIT>",
        "DRAG": "<DRG>",
    }
    
    TOKEN_TO_ACTION = {v: k for k, v in ACTION_TOKENS.items()}
    
    def tokenize(self, action: Dict[str, Any]) -> List[str]:
        """Convert action to token sequence.
        
        Args:
            action: Action dictionary
        
        Returns:
            List of tokens
        """
        tokens = []
        
        # Action kind token
        kind = action.get("kind")
        if kind in self.ACTION_TOKENS:
            tokens.append(self.ACTION_TOKENS[kind])
        else:
            tokens.append("<UNK>")
        
        # Target tokens
        target = action.get("target", {})
        if target.get("bbox"):
            bbox = target["bbox"]
            tokens.extend([f"<X:{bbox[0]}>", f"<Y:{bbox[1]}>"])
        
        if target.get("name"):
            tokens.append(f"<NAME:{target['name']}>")
        
        # Input text tokens
        if action.get("input_text"):
            text = action["input_text"]
            # Simple tokenization (in real LAM, use proper tokenizer)
            tokens.append(f"<TXT:{text[:50]}>")
        
        tokens.append("<END>")
        return tokens
    
    def detokenize(self, tokens: List[str]) -> Dict[str, Any]:
        """Convert token sequence back to action.
        
        Args:
            tokens: List of tokens
        
        Returns:
            Action dictionary
        """
        action = {}
        
        # Parse action kind
        if tokens and tokens[0] in self.TOKEN_TO_ACTION:
            action["kind"] = self.TOKEN_TO_ACTION[tokens[0]]
        
        # Parse target
        target = {}
        bbox = []
        
        for token in tokens[1:]:
            if token == "<END>":
                break
            
            if token.startswith("<X:"):
                x = float(token[3:-1])
                if len(bbox) == 0:
                    bbox = [x, 0, 10, 10]
                else:
                    bbox[0] = x
            elif token.startswith("<Y:"):
                y = float(token[3:-1])
                if len(bbox) > 0:
                    bbox[1] = y
            elif token.startswith("<NAME:"):
                target["name"] = token[6:-1]
            elif token.startswith("<TXT:"):
                action["input_text"] = token[5:-1]
        
        if bbox:
            target["bbox"] = bbox
        
        if target:
            action["target"] = target
        
        return action
    
    def encode_trajectory(self, actions: List[Dict[str, Any]]) -> List[List[str]]:
        """Encode a sequence of actions (trajectory).
        
        Args:
            actions: List of actions
        
        Returns:
            List of token sequences
        """
        return [self.tokenize(action) for action in actions]
    
    def decode_trajectory(self, token_sequences: List[List[str]]) -> List[Dict[str, Any]]:
        """Decode token sequences back to actions.
        
        Args:
            token_sequences: List of token sequences
        
        Returns:
            List of actions
        """
        return [self.detokenize(tokens) for tokens in token_sequences]

