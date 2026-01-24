"""
Notification service for handling customer notifications.
"""
from typing import List, Optional, Dict
from models import (
    Customer, Notification, NotificationPreferences, MilestoneConfig,
    NotificationType, NotificationChannel, TierLevel, TIER_THRESHOLDS, MILESTONES
)


class NotificationService:
    """Service for managing customer notifications."""
    
    def __init__(self):
        self.notifications: Dict[str, List[Notification]] = {}
        self.preferences: Dict[str, NotificationPreferences] = {}
        self.email_provider = None  # Can be configured with actual email service
    
    def set_email_provider(self, provider):
        """Configure email provider for sending email notifications."""
        self.email_provider = provider
    
    def get_preferences(self, customer_id: str) -> NotificationPreferences:
        """Get notification preferences for a customer."""
        if customer_id not in self.preferences:
            # Create default preferences
            self.preferences[customer_id] = NotificationPreferences(customer_id=customer_id)
        return self.preferences[customer_id]
    
    def update_preferences(self, customer_id: str, preferences: NotificationPreferences) -> None:
        """Update notification preferences for a customer."""
        preferences.customer_id = customer_id
        self.preferences[customer_id] = preferences
    
    def check_tier_upgrade(self, customer: Customer, old_points: int) -> Optional[TierLevel]:
        """
        Check if customer has upgraded to a new tier.
        Returns the new tier if upgraded, None otherwise.
        """
        old_tier = self._calculate_tier(old_points)
        new_tier = self._calculate_tier(customer.points)
        
        if old_tier != new_tier and new_tier.value > old_tier.value:
            return new_tier
        return None
    
    def check_milestones(self, customer: Customer, old_points: int) -> List[MilestoneConfig]:
        """
        Check if customer has reached any new milestones.
        Returns list of newly reached milestones.
        """
        reached_milestones = []
        for milestone in MILESTONES:
            if old_points < milestone.points <= customer.points:
                reached_milestones.append(milestone)
        return reached_milestones
    
    def notify_tier_upgrade(self, customer: Customer, new_tier: TierLevel) -> List[Notification]:
        """
        Create notifications for tier upgrade.
        Returns list of created notifications.
        """
        prefs = self.get_preferences(customer.id)
        notifications = []
        
        title = f"Congratulations! You've reached {new_tier.value} tier!"
        message = f"You've been upgraded to {new_tier.value} tier with {customer.points} points. Enjoy your new benefits!"
        
        # In-app notification
        if prefs.tier_upgrades_in_app:
            notification = Notification(
                customer_id=customer.id,
                type=NotificationType.TIER_UPGRADE,
                channel=NotificationChannel.IN_APP,
                title=title,
                message=message,
                metadata={"tier": new_tier.value, "points": customer.points}
            )
            self._store_notification(notification)
            notifications.append(notification)
        
        # Email notification
        if prefs.tier_upgrades_email and self.email_provider:
            email_notification = Notification(
                customer_id=customer.id,
                type=NotificationType.TIER_UPGRADE,
                channel=NotificationChannel.EMAIL,
                title=title,
                message=message,
                metadata={"tier": new_tier.value, "points": customer.points}
            )
            self._send_email(customer, email_notification)
            notifications.append(email_notification)
        
        return notifications
    
    def notify_milestone(self, customer: Customer, milestone: MilestoneConfig) -> List[Notification]:
        """
        Create notifications for milestone achievement.
        Returns list of created notifications.
        """
        prefs = self.get_preferences(customer.id)
        notifications = []
        
        title = f"Milestone Achieved: {milestone.description}"
        message = f"Congratulations! You've reached {milestone.points} points!"
        if milestone.reward:
            message += f" You've earned: {milestone.reward}"
        
        # In-app notification
        if prefs.milestones_in_app:
            notification = Notification(
                customer_id=customer.id,
                type=NotificationType.MILESTONE_REACHED,
                channel=NotificationChannel.IN_APP,
                title=title,
                message=message,
                metadata={
                    "milestone_points": milestone.points,
                    "reward": milestone.reward,
                    "current_points": customer.points
                }
            )
            self._store_notification(notification)
            notifications.append(notification)
        
        # Email notification
        if prefs.milestones_email and self.email_provider:
            email_notification = Notification(
                customer_id=customer.id,
                type=NotificationType.MILESTONE_REACHED,
                channel=NotificationChannel.EMAIL,
                title=title,
                message=message,
                metadata={
                    "milestone_points": milestone.points,
                    "reward": milestone.reward,
                    "current_points": customer.points
                }
            )
            self._send_email(customer, email_notification)
            notifications.append(email_notification)
        
        return notifications
    
    def process_points_update(self, customer: Customer, old_points: int) -> List[Notification]:
        """
        Process a points update and create appropriate notifications.
        This should be called whenever a customer's points change.
        """
        all_notifications = []
        
        # Check for tier upgrade
        new_tier = self.check_tier_upgrade(customer, old_points)
        if new_tier:
            customer.tier = new_tier
            notifications = self.notify_tier_upgrade(customer, new_tier)
            all_notifications.extend(notifications)
        
        # Check for milestones
        milestones = self.check_milestones(customer, old_points)
        for milestone in milestones:
            notifications = self.notify_milestone(customer, milestone)
            all_notifications.extend(notifications)
        
        return all_notifications
    
    def get_notifications(self, customer_id: str, unread_only: bool = False) -> List[Notification]:
        """Get notifications for a customer."""
        if customer_id not in self.notifications:
            return []
        
        notifications = self.notifications[customer_id]
        if unread_only:
            return [n for n in notifications if not n.read]
        return notifications
    
    def mark_as_read(self, customer_id: str, notification_id: str) -> bool:
        """Mark a notification as read."""
        if customer_id not in self.notifications:
            return False
        
        for notification in self.notifications[customer_id]:
            if notification.id == notification_id:
                notification.read = True
                return True
        return False
    
    def mark_all_as_read(self, customer_id: str) -> int:
        """Mark all notifications as read for a customer. Returns count of marked notifications."""
        if customer_id not in self.notifications:
            return 0
        
        count = 0
        for notification in self.notifications[customer_id]:
            if not notification.read:
                notification.read = True
                count += 1
        return count
    
    def _calculate_tier(self, points: int) -> TierLevel:
        """Calculate the appropriate tier for given points."""
        tier = TierLevel.BRONZE
        for level, threshold in sorted(TIER_THRESHOLDS.items(), key=lambda x: x[1], reverse=True):
            if points >= threshold:
                tier = level
                break
        return tier
    
    def _store_notification(self, notification: Notification) -> None:
        """Store an in-app notification."""
        if notification.customer_id not in self.notifications:
            self.notifications[notification.customer_id] = []
        self.notifications[notification.customer_id].append(notification)
    
    def _send_email(self, customer: Customer, notification: Notification) -> bool:
        """Send email notification. Returns True if successful."""
        if not self.email_provider:
            # Email provider not configured, return False
            return False
        
        try:
            self.email_provider.send_email(
                to=customer.email,
                subject=notification.title,
                body=notification.message
            )
            return True
        except Exception as e:
            print(f"Failed to send email to {customer.email}: {e}")
            return False
