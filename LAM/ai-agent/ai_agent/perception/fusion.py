"""UI Graph builder - fuses DOM + Vision into unified representation."""
from typing import List, Dict, Any, Optional
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class UINode:
    """Node in UI Graph representing an interactive element."""
    id: str
    role: str  # button, link, input, etc.
    name: str  # visible text or label
    selector: Optional[str] = None  # CSS/XPath selector
    bbox: Optional[List[float]] = None  # [x, y, w, h] from vision
    affordances: List[str] = field(default_factory=list)  # clickable, typeable, etc.
    dom_data: Optional[Dict[str, Any]] = None
    vision_data: Optional[Dict[str, Any]] = None


@dataclass
class UIEdge:
    """Edge in UI Graph representing spatial/hierarchical relationships."""
    type: str  # spatial, hierarchy, flow
    src: str  # source node ID
    dst: str  # destination node ID
    weight: float = 1.0


class UIGraphBuilder:
    """Builds UI Graph from DOM + Vision fusion."""
    
    def __init__(self):
        self.nodes: List[UINode] = []
        self.edges: List[UIEdge] = []
    
    def build(
        self,
        dom_snapshot: Dict[str, Any],
        vision_elements: List[Dict[str, Any]],
        screenshot_path: Optional[Path] = None,
    ) -> Dict[str, Any]:
        """Build UI Graph from DOM and vision data.
        
        Args:
            dom_snapshot: DOM/AXTree snapshot
            vision_elements: Elements detected by vision model
            screenshot_path: Optional screenshot path
        
        Returns:
            UI Graph as dictionary (matches schema)
        """
        self.nodes = []
        self.edges = []
        
        # Extract nodes from DOM
        dom_nodes = self._extract_dom_nodes(dom_snapshot)
        
        # Merge DOM + Vision nodes
        merged_nodes = self._merge_dom_vision(dom_nodes, vision_elements)
        
        # Build spatial edges
        self._build_spatial_edges(merged_nodes)
        
        # Convert to schema format
        return {
            "nodes": [self._node_to_dict(n) for n in merged_nodes],
            "edges": [self._edge_to_dict(e) for e in self.edges],
        }
    
    def _extract_dom_nodes(self, dom: Dict[str, Any]) -> List[UINode]:
        """Extract interactive nodes from DOM snapshot."""
        nodes = []
        
        # Simplified: extract from DOM structure
        # In real implementation, parse HTML/AXTree
        dom_html = dom.get("dom", "")
        
        # Placeholder: create nodes from common patterns
        # Real implementation would parse HTML and extract interactive elements
        
        return nodes
    
    def _merge_dom_vision(
        self,
        dom_nodes: List[UINode],
        vision_elements: List[Dict[str, Any]],
    ) -> List[UINode]:
        """Merge DOM nodes with vision-detected elements."""
        merged = []
        
        # Add vision elements as nodes
        for i, elem in enumerate(vision_elements):
            node = UINode(
                id=f"vision-{i}",
                role=elem.get("role", "unknown"),
                name=elem.get("name", ""),
                bbox=elem.get("bbox"),
                vision_data=elem,
            )
            merged.append(node)
        
        # Add DOM nodes (if not matched by vision)
        for dom_node in dom_nodes:
            # Check if already matched
            matched = any(
                self._bbox_overlap(dom_node.bbox, v.get("bbox"))
                for v in vision_elements
                if dom_node.bbox and v.get("bbox")
            )
            
            if not matched:
                merged.append(dom_node)
        
        return merged
    
    def _bbox_overlap(self, bbox1: Optional[List[float]], bbox2: Optional[List[float]]) -> bool:
        """Check if two bounding boxes overlap."""
        if not bbox1 or not bbox2 or len(bbox1) < 4 or len(bbox2) < 4:
            return False
        
        x1, y1, w1, h1 = bbox1[0], bbox1[1], bbox1[2], bbox1[3]
        x2, y2, w2, h2 = bbox2[0], bbox2[1], bbox2[2], bbox2[3]
        
        return not (x1 + w1 < x2 or x2 + w2 < x1 or y1 + h1 < y2 or y2 + h2 < y1)
    
    def _build_spatial_edges(self, nodes: List[UINode]) -> None:
        """Build spatial relationship edges."""
        # Create edges based on spatial proximity
        for i, node1 in enumerate(nodes):
            for j, node2 in enumerate(nodes[i+1:], i+1):
                if node1.bbox and node2.bbox:
                    # Calculate distance
                    x1, y1 = node1.bbox[0] + node1.bbox[2]/2, node1.bbox[1] + node1.bbox[3]/2
                    x2, y2 = node2.bbox[0] + node2.bbox[2]/2, node2.bbox[1] + node2.bbox[3]/2
                    distance = ((x2-x1)**2 + (y2-y1)**2)**0.5
                    
                    # Add edge if close enough
                    if distance < 200:  # threshold
                        edge = UIEdge(
                            type="spatial",
                            src=node1.id,
                            dst=node2.id,
                            weight=1.0 / (distance + 1),
                        )
                        self.edges.append(edge)
    
    def _node_to_dict(self, node: UINode) -> Dict[str, Any]:
        """Convert UINode to dictionary."""
        result = {
            "id": node.id,
            "role": node.role,
            "name": node.name,
        }
        
        if node.selector:
            result["selector"] = node.selector
        if node.bbox:
            result["bbox"] = node.bbox
        if node.affordances:
            result["affordances"] = node.affordances
        
        return result
    
    def _edge_to_dict(self, edge: UIEdge) -> Dict[str, Any]:
        """Convert UIEdge to dictionary."""
        return {
            "type": edge.type,
            "src": edge.src,
            "dst": edge.dst,
            "weight": edge.weight,
        }

