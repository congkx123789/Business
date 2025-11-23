"""Resource footprint monitoring for AI agent."""
from __future__ import annotations

import time
import threading
from dataclasses import dataclass, field, asdict
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path
import json

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
    print("Warning: psutil not available. Resource monitoring disabled.")


@dataclass
class ResourceSnapshot:
    """Single snapshot of resource usage."""
    timestamp: float
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_available_mb: float
    disk_usage_percent: Optional[float] = None
    disk_used_gb: Optional[float] = None
    network_sent_mb: Optional[float] = None
    network_recv_mb: Optional[float] = None
    process_count: Optional[int] = None
    active_connections: Optional[int] = None


@dataclass
class ResourceFootprint:
    """Complete resource footprint for a session."""
    session_id: str
    start_time: float
    end_time: Optional[float] = None
    goal: Optional[str] = None
    mode: Optional[str] = None
    snapshots: List[ResourceSnapshot] = field(default_factory=list)
    
    # Summary statistics
    avg_cpu_percent: float = 0.0
    max_cpu_percent: float = 0.0
    avg_memory_percent: float = 0.0
    max_memory_percent: float = 0.0
    peak_memory_mb: float = 0.0
    total_duration: float = 0.0
    total_network_sent_mb: float = 0.0
    total_network_recv_mb: float = 0.0
    
    def calculate_summary(self) -> None:
        """Calculate summary statistics from snapshots."""
        if not self.snapshots:
            return
        
        cpu_values = [s.cpu_percent for s in self.snapshots]
        memory_values = [s.memory_percent for s in self.snapshots]
        memory_mb_values = [s.memory_used_mb for s in self.snapshots]
        
        self.avg_cpu_percent = sum(cpu_values) / len(cpu_values)
        self.max_cpu_percent = max(cpu_values)
        self.avg_memory_percent = sum(memory_values) / len(memory_values)
        self.max_memory_percent = max(memory_values)
        self.peak_memory_mb = max(memory_mb_values)
        
        if self.end_time and self.start_time:
            self.total_duration = self.end_time - self.start_time
        
        # Network totals
        if self.snapshots:
            first = self.snapshots[0]
            last = self.snapshots[-1]
            if first.network_sent_mb is not None and last.network_sent_mb is not None:
                self.total_network_sent_mb = last.network_sent_mb - first.network_sent_mb
            if first.network_recv_mb is not None and last.network_recv_mb is not None:
                self.total_network_recv_mb = last.network_recv_mb - first.network_recv_mb
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ResourceFootprint":
        """Create from dictionary."""
        snapshots = [ResourceSnapshot(**s) for s in data.get("snapshots", [])]
        footprint = cls(
            session_id=data["session_id"],
            start_time=data["start_time"],
            end_time=data.get("end_time"),
            goal=data.get("goal"),
            mode=data.get("mode"),
            snapshots=snapshots
        )
        footprint.calculate_summary()
        return footprint


class ResourceMonitor:
    """Monitors resource usage during AI agent execution."""
    
    def __init__(
        self,
        enabled: bool = True,
        interval: float = 1.0,  # Sample every second
        output_dir: Optional[Path] = None
    ):
        """Initialize resource monitor.
        
        Args:
            enabled: Whether monitoring is enabled
            interval: Sampling interval in seconds
            output_dir: Directory to save footprint reports
        """
        self.enabled = enabled and HAS_PSUTIL
        self.interval = interval
        self.output_dir = output_dir or Path("footprints")
        if self.output_dir:
            self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.is_monitoring = False
        self.monitor_thread: Optional[threading.Thread] = None
        self.stop_event = threading.Event()
        self.current_footprint: Optional[ResourceFootprint] = None
        
        # Network baseline
        self.network_baseline_sent = 0.0
        self.network_baseline_recv = 0.0
    
    def start_monitoring(self, goal: Optional[str] = None, mode: Optional[str] = None) -> str:
        """Start monitoring resource usage.
        
        Args:
            goal: Current goal being executed
            mode: Agent mode
            
        Returns:
            Session ID
        """
        if not self.enabled:
            return ""
        
        if self.is_monitoring:
            self.stop_monitoring()
        
        import uuid
        session_id = str(uuid.uuid4())
        
        self.current_footprint = ResourceFootprint(
            session_id=session_id,
            start_time=time.time(),
            goal=goal,
            mode=mode
        )
        
        # Get network baseline
        if HAS_PSUTIL:
            net_io = psutil.net_io_counters()
            self.network_baseline_sent = net_io.bytes_sent / (1024 * 1024)  # MB
            self.network_baseline_recv = net_io.bytes_recv / (1024 * 1024)  # MB
        
        self.is_monitoring = True
        self.stop_event.clear()
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        return session_id
    
    def stop_monitoring(self) -> Optional[ResourceFootprint]:
        """Stop monitoring and return footprint.
        
        Returns:
            Resource footprint or None
        """
        if not self.is_monitoring or not self.current_footprint:
            return None
        
        self.is_monitoring = False
        self.stop_event.set()
        
        if self.monitor_thread:
            self.monitor_thread.join(timeout=2.0)
        
        if self.current_footprint:
            self.current_footprint.end_time = time.time()
            self.current_footprint.calculate_summary()
            
            # Save footprint
            if self.output_dir:
                self._save_footprint(self.current_footprint)
            
            footprint = self.current_footprint
            self.current_footprint = None
            return footprint
        
        return None
    
    def _monitor_loop(self) -> None:
        """Background thread that samples resource usage."""
        while not self.stop_event.is_set() and self.is_monitoring:
            if HAS_PSUTIL:
                snapshot = self._capture_snapshot()
                if snapshot and self.current_footprint:
                    self.current_footprint.snapshots.append(snapshot)
            
            self.stop_event.wait(self.interval)
    
    def _capture_snapshot(self) -> Optional[ResourceSnapshot]:
        """Capture current resource snapshot.
        
        Returns:
            Resource snapshot or None
        """
        if not HAS_PSUTIL:
            return None
        
        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=0.1)
            
            # Memory
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_used_mb = memory.used / (1024 * 1024)
            memory_available_mb = memory.available / (1024 * 1024)
            
            # Disk
            disk = psutil.disk_usage('/')
            disk_usage_percent = disk.percent
            disk_used_gb = disk.used / (1024 * 1024 * 1024)
            
            # Network
            net_io = psutil.net_io_counters()
            network_sent_mb = net_io.bytes_sent / (1024 * 1024) - self.network_baseline_sent
            network_recv_mb = net_io.bytes_recv / (1024 * 1024) - self.network_baseline_recv
            
            # Process count
            process_count = len(psutil.pids())
            
            # Active connections
            try:
                connections = psutil.net_connections()
                active_connections = len([c for c in connections if c.status == 'ESTABLISHED'])
            except:
                active_connections = None
            
            return ResourceSnapshot(
                timestamp=time.time(),
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                memory_used_mb=memory_used_mb,
                memory_available_mb=memory_available_mb,
                disk_usage_percent=disk_usage_percent,
                disk_used_gb=disk_used_gb,
                network_sent_mb=network_sent_mb,
                network_recv_mb=network_recv_mb,
                process_count=process_count,
                active_connections=active_connections
            )
        except Exception as e:
            print(f"Error capturing resource snapshot: {e}")
            return None
    
    def _save_footprint(self, footprint: ResourceFootprint) -> Path:
        """Save footprint to disk.
        
        Args:
            footprint: Resource footprint to save
            
        Returns:
            Path to saved file
        """
        filename = f"footprint_{footprint.session_id}.json"
        file_path = self.output_dir / filename
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(footprint.to_dict(), f, indent=2, default=str)
        
        return file_path
    
    def get_current_stats(self) -> Optional[Dict[str, Any]]:
        """Get current resource statistics.
        
        Returns:
            Current stats dictionary or None
        """
        if not self.current_footprint or not self.current_footprint.snapshots:
            return None
        
        latest = self.current_footprint.snapshots[-1]
        return {
            "cpu_percent": latest.cpu_percent,
            "memory_percent": latest.memory_percent,
            "memory_used_mb": latest.memory_used_mb,
            "disk_usage_percent": latest.disk_usage_percent,
        }
    
    def print_summary(self, footprint: ResourceFootprint) -> None:
        """Print footprint summary.
        
        Args:
            footprint: Resource footprint to summarize
        """
        print("\n" + "=" * 60)
        print("Resource Footprint Summary")
        print("=" * 60)
        print(f"Session ID: {footprint.session_id}")
        print(f"Goal: {footprint.goal or 'N/A'}")
        print(f"Mode: {footprint.mode or 'N/A'}")
        print(f"Duration: {footprint.total_duration:.2f} seconds")
        print(f"Snapshots: {len(footprint.snapshots)}")
        print("\nCPU Usage:")
        print(f"  Average: {footprint.avg_cpu_percent:.1f}%")
        print(f"  Peak: {footprint.max_cpu_percent:.1f}%")
        print("\nMemory Usage:")
        print(f"  Average: {footprint.avg_memory_percent:.1f}%")
        print(f"  Peak: {footprint.max_memory_percent:.1f}%")
        print(f"  Peak Memory: {footprint.peak_memory_mb:.1f} MB")
        if footprint.total_network_sent_mb > 0 or footprint.total_network_recv_mb > 0:
            print("\nNetwork:")
            print(f"  Sent: {footprint.total_network_sent_mb:.2f} MB")
            print(f"  Received: {footprint.total_network_recv_mb:.2f} MB")
        print("=" * 60)

