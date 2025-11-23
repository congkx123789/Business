"""Natural Language Understanding (NLU) for parsing user input and goals."""
from __future__ import annotations

import re
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class ParsedIntent:
    """Parsed user intent from natural language input."""
    intent_type: str  # 'click', 'type', 'navigate', 'scroll', 'wait', 'complex'
    action_kind: Optional[str] = None
    target_description: Optional[str] = None
    coordinates: Optional[Tuple[int, int]] = None
    text_to_type: Optional[str] = None
    url: Optional[str] = None
    scroll_direction: Optional[str] = None
    wait_duration: Optional[float] = None
    confidence: float = 0.0
    entities: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.entities is None:
            self.entities = {}


class InputParser:
    """Parse and understand natural language user input."""
    
    def __init__(self):
        """Initialize the input parser."""
        # Patterns for different intents
        self.patterns = {
            'click': [
                r'click\s+(?:on\s+)?(.+)',
                r'press\s+(?:on\s+)?(.+)',
                r'select\s+(.+)',
                r'choose\s+(.+)',
                r'点击\s*(.+)',
            ],
            'type': [
                r'type\s+(?:text\s+)?["\']?([^"\']+)["\']?',
                r'enter\s+(?:text\s+)?["\']?([^"\']+)["\']?',
                r'input\s+(?:text\s+)?["\']?([^"\']+)["\']?',
                r'write\s+(?:text\s+)?["\']?([^"\']+)["\']?',
                r'输入\s*(.+)',
            ],
            'navigate': [
                r'(?:go\s+to|open|navigate\s+to|visit)\s+(.+)',
                r'打开\s*(.+)',
            ],
            'scroll': [
                r'scroll\s+(up|down|left|right)',
                r'滚动\s*(向上|向下|向左|向右)',
            ],
            'move': [
                r'move\s+(?:to|mouse\s+to)\s*\(?(\d+)\s*,\s*(\d+)\)?',
                r'移动\s*到\s*\(?(\d+)\s*,\s*(\d+)\)?',
            ],
            'wait': [
                r'wait\s+(?:for\s+)?(\d+(?:\.\d+)?)\s*(?:seconds?|sec|s)?',
                r'等待\s*(\d+(?:\.\d+)?)\s*(?:秒|s)?',
            ],
            'hotkey': [
                r'press\s+(?:key\s+)?(.+)',
                r'按\s*(.+)',
            ],
        }
    
    def parse(self, user_input: str) -> ParsedIntent:
        """Parse user input and extract intent.
        
        Args:
            user_input: Natural language input from user
            
        Returns:
            ParsedIntent with extracted information
        """
        user_input = user_input.strip()
        if not user_input:
            return ParsedIntent(intent_type='complex', confidence=0.0)
        
        # Try to match patterns
        best_match = None
        best_confidence = 0.0
        
        # Check click intent
        for pattern in self.patterns['click']:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                target = match.group(1).strip()
                confidence = 0.8
                if 'button' in target.lower() or 'link' in target.lower():
                    confidence = 0.9
                if confidence > best_confidence:
                    best_match = ParsedIntent(
                        intent_type='click',
                        action_kind='CLICK',
                        target_description=target,
                        confidence=confidence
                    )
                    best_confidence = confidence
        
        # Check type intent
        for pattern in self.patterns['type']:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                text = match.group(1).strip()
                confidence = 0.85
                if confidence > best_confidence:
                    best_match = ParsedIntent(
                        intent_type='type',
                        action_kind='TYPE',
                        text_to_type=text,
                        confidence=confidence
                    )
                    best_confidence = confidence
        
        # Check navigate intent
        for pattern in self.patterns['navigate']:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                url = match.group(1).strip()
                confidence = 0.8
                if 'http' in url.lower():
                    confidence = 0.95
                if confidence > best_confidence:
                    best_match = ParsedIntent(
                        intent_type='navigate',
                        action_kind='NAVIGATE',
                        url=url,
                        confidence=confidence
                    )
                    best_confidence = confidence
        
        # Check scroll intent
        for pattern in self.patterns['scroll']:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                direction = match.group(1).lower()
                # Map Chinese directions
                direction_map = {'向上': 'up', '向下': 'down', '向左': 'left', '向右': 'right'}
                direction = direction_map.get(direction, direction)
                confidence = 0.9
                if confidence > best_confidence:
                    best_match = ParsedIntent(
                        intent_type='scroll',
                        action_kind='SCROLL',
                        scroll_direction=direction,
                        confidence=confidence
                    )
                    best_confidence = confidence
        
        # Check move intent
        for pattern in self.patterns['move']:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                x, y = int(match.group(1)), int(match.group(2))
                confidence = 0.95
                if confidence > best_confidence:
                    best_match = ParsedIntent(
                        intent_type='move',
                        action_kind='CLICK',
                        coordinates=(x, y),
                        confidence=confidence,
                        entities={'move_only': True}
                    )
                    best_confidence = confidence
        
        # Check wait intent
        for pattern in self.patterns['wait']:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                duration = float(match.group(1))
                confidence = 0.9
                if confidence > best_confidence:
                    best_match = ParsedIntent(
                        intent_type='wait',
                        action_kind='WAIT_FOR',
                        wait_duration=duration,
                        confidence=confidence
                    )
                    best_confidence = confidence
        
        # Check hotkey intent
        for pattern in self.patterns['hotkey']:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                keys = match.group(1).strip()
                confidence = 0.85
                if confidence > best_confidence:
                    best_match = ParsedIntent(
                        intent_type='hotkey',
                        action_kind='HOTKEY',
                        text_to_type=keys,
                        confidence=confidence
                    )
                    best_confidence = confidence
        
        # If no pattern matched, treat as complex goal
        if not best_match:
            best_match = ParsedIntent(
                intent_type='complex',
                confidence=0.5,
                entities={'raw_input': user_input}
            )
        
        return best_match
    
    def extract_entities(self, user_input: str) -> Dict[str, Any]:
        """Extract named entities from user input.
        
        Args:
            user_input: Natural language input
            
        Returns:
            Dictionary of extracted entities
        """
        entities = {}
        
        # Extract URLs
        url_pattern = r'https?://[^\s]+'
        urls = re.findall(url_pattern, user_input)
        if urls:
            entities['urls'] = urls
        
        # Extract coordinates
        coord_pattern = r'\((\d+)\s*,\s*(\d+)\)'
        coords = re.findall(coord_pattern, user_input)
        if coords:
            entities['coordinates'] = [(int(x), int(y)) for x, y in coords]
        
        # Extract numbers
        number_pattern = r'\d+(?:\.\d+)?'
        numbers = re.findall(number_pattern, user_input)
        if numbers:
            entities['numbers'] = [float(n) for n in numbers]
        
        # Extract quoted strings
        quoted_pattern = r'["\']([^"\']+)["\']'
        quoted = re.findall(quoted_pattern, user_input)
        if quoted:
            entities['quoted_strings'] = quoted
        
        return entities


__all__ = ["InputParser", "ParsedIntent"]

