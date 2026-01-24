"""
Data models for the loyalty rewards system.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, List
import uuid


class TierLevel(Enum):
    """Customer reward tier levels."""
    BRONZE = "Bronze"
    SILVER = "Silver"
    GOLD = "Gold"
    PLATINUM = "Platinum"


class NotificationType(Enum):
    """Types of notifications that can be sent to customers."""
    TIER_UPGRADE = "tier_upgrade"
    MILESTONE_REACHED = "milestone_reached"


class NotificationChannel(Enum):
    """Channels through which notifications can be delivered."""
    IN_APP = "in_app"
    EMAIL = "email"


@dataclass
class Customer:
    """Represents a customer in the loyalty program."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    email: str = ""
    points: int = 0
    tier: TierLevel = TierLevel.BRONZE
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class NotificationPreferences:
    """User preferences for receiving notifications."""
    customer_id: str = ""
    tier_upgrades_in_app: bool = True
    tier_upgrades_email: bool = True
    milestones_in_app: bool = True
    milestones_email: bool = True
    updated_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Notification:
    """Represents a notification to be delivered to a customer."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str = ""
    type: NotificationType = NotificationType.TIER_UPGRADE
    channel: NotificationChannel = NotificationChannel.IN_APP
    title: str = ""
    message: str = ""
    read: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    metadata: dict = field(default_factory=dict)


@dataclass
class MilestoneConfig:
    """Configuration for reward milestones."""
    points: int
    description: str
    reward: Optional[str] = None


# Tier thresholds in points
TIER_THRESHOLDS = {
    TierLevel.BRONZE: 0,
    TierLevel.SILVER: 1000,
    TierLevel.GOLD: 5000,
    TierLevel.PLATINUM: 10000,
}

# Milestone configurations
MILESTONES = [
    MilestoneConfig(points=500, description="First 500 points!", reward="5% discount"),
    MilestoneConfig(points=1000, description="Reached 1000 points!", reward="10% discount"),
    MilestoneConfig(points=2500, description="Reached 2500 points!", reward="Free product"),
    MilestoneConfig(points=5000, description="Reached 5000 points!", reward="20% discount"),
    MilestoneConfig(points=10000, description="Reached 10000 points!", reward="VIP status"),
]
