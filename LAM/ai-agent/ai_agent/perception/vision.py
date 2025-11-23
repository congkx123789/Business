"""Vision-based UI element detection using VLM (Vision Language Model)."""
import os
import base64
from typing import List, Dict, Any, Optional
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


class VisionGrounding:
    """Ground UI elements using vision models (VLM)."""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """Initialize vision grounding."""
        self.api_key = api_key
        self.model = model or os.getenv("OPENAI_VISION_MODEL", "gpt-4o")
        self.client = None
        
        if self.api_key and OpenAI:
            self.client = OpenAI(api_key=self.api_key)
    
    def detect_elements(
        self,
        screenshot_path: Path,
        query: str = "Find all interactive UI elements (buttons, links, inputs)",
    ) -> List[Dict[str, Any]]:
        """Detect UI elements in screenshot using VLM.
        
        Args:
            screenshot_path: Path to screenshot image
            query: What to look for
        
        Returns:
            List of detected elements with bounding boxes
        """
        if not self.client or not screenshot_path.exists():
            return []
        
        try:
            # Read image and encode
            image_data = screenshot_path.read_bytes()
            base64_image = base64.b64encode(image_data).decode("utf-8")
            
            # Call vision API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"{query}. Return JSON array with elements containing: role, name, bbox [x,y,w,h], confidence.",
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                },
                            },
                        ],
                    }
                ],
                max_tokens=1000,
            )
            
            import json
            content = response.choices[0].message.content
            
            # Try to extract JSON from response
            try:
                elements = json.loads(content)
                if isinstance(elements, list):
                    return elements
            except:
                # Try to extract JSON from markdown code block
                import re
                json_match = re.search(r'```json\s*(\[.*?\])\s*```', content, re.DOTALL)
                if json_match:
                    elements = json.loads(json_match.group(1))
                    return elements
            
            return []
        
        except Exception as e:
            print(f"Vision detection error: {e}")
            return []
    
    def find_element(
        self,
        screenshot_path: Path,
        element_description: str,
    ) -> Optional[Dict[str, Any]]:
        """Find specific element by description.
        
        Args:
            screenshot_path: Path to screenshot
            element_description: Description of element (e.g., "search button")
        
        Returns:
            Element with bbox or None
        """
        elements = self.detect_elements(
            screenshot_path,
            query=f"Find the element: {element_description}",
        )
        
        if elements:
            # Return highest confidence element
            return max(elements, key=lambda e: e.get("confidence", 0))
        
        return None

