"""
API endpoints for notification management.
This provides a simple REST-like interface for the notification system.
"""
from typing import Dict, Any, List
from models import Customer, NotificationPreferences
from notification_service import NotificationService


class NotificationAPI:
    """API interface for notification management."""
    
    def __init__(self, notification_service: NotificationService):
        self.notification_service = notification_service
        self.customers: Dict[str, Customer] = {}
    
    def add_customer(self, customer: Customer) -> Dict[str, Any]:
        """Add a new customer to the system."""
        self.customers[customer.id] = customer
        return {
            "status": "success",
            "customer_id": customer.id,
            "tier": customer.tier.value
        }
    
    def add_points(self, customer_id: str, points: int) -> Dict[str, Any]:
        """
        Add points to a customer's account and trigger notifications.
        This is the main entry point for triggering tier and milestone notifications.
        """
        if customer_id not in self.customers:
            return {"status": "error", "message": "Customer not found"}
        
        customer = self.customers[customer_id]
        old_points = customer.points
        customer.points += points
        
        # Process notifications
        notifications = self.notification_service.process_points_update(customer, old_points)
        
        return {
            "status": "success",
            "customer_id": customer_id,
            "old_points": old_points,
            "new_points": customer.points,
            "tier": customer.tier.value,
            "notifications_created": len(notifications),
            "notifications": [
                {
                    "id": n.id,
                    "type": n.type.value,
                    "channel": n.channel.value,
                    "title": n.title,
                    "message": n.message
                }
                for n in notifications
            ]
        }
    
    def get_notifications(self, customer_id: str, unread_only: bool = False) -> Dict[str, Any]:
        """Get notifications for a customer."""
        if customer_id not in self.customers:
            return {"status": "error", "message": "Customer not found"}
        
        notifications = self.notification_service.get_notifications(customer_id, unread_only)
        
        return {
            "status": "success",
            "customer_id": customer_id,
            "count": len(notifications),
            "notifications": [
                {
                    "id": n.id,
                    "type": n.type.value,
                    "channel": n.channel.value,
                    "title": n.title,
                    "message": n.message,
                    "read": n.read,
                    "created_at": n.created_at.isoformat(),
                    "metadata": n.metadata
                }
                for n in notifications
            ]
        }
    
    def mark_notification_read(self, customer_id: str, notification_id: str) -> Dict[str, Any]:
        """Mark a specific notification as read."""
        if customer_id not in self.customers:
            return {"status": "error", "message": "Customer not found"}
        
        success = self.notification_service.mark_as_read(customer_id, notification_id)
        
        if success:
            return {"status": "success", "message": "Notification marked as read"}
        return {"status": "error", "message": "Notification not found"}
    
    def mark_all_notifications_read(self, customer_id: str) -> Dict[str, Any]:
        """Mark all notifications as read for a customer."""
        if customer_id not in self.customers:
            return {"status": "error", "message": "Customer not found"}
        
        count = self.notification_service.mark_all_as_read(customer_id)
        
        return {
            "status": "success",
            "message": f"Marked {count} notifications as read"
        }
    
    def get_notification_preferences(self, customer_id: str) -> Dict[str, Any]:
        """Get notification preferences for a customer."""
        if customer_id not in self.customers:
            return {"status": "error", "message": "Customer not found"}
        
        prefs = self.notification_service.get_preferences(customer_id)
        
        return {
            "status": "success",
            "customer_id": customer_id,
            "preferences": {
                "tier_upgrades_in_app": prefs.tier_upgrades_in_app,
                "tier_upgrades_email": prefs.tier_upgrades_email,
                "milestones_in_app": prefs.milestones_in_app,
                "milestones_email": prefs.milestones_email,
                "updated_at": prefs.updated_at.isoformat()
            }
        }
    
    def update_notification_preferences(
        self, 
        customer_id: str, 
        tier_upgrades_in_app: bool = None,
        tier_upgrades_email: bool = None,
        milestones_in_app: bool = None,
        milestones_email: bool = None
    ) -> Dict[str, Any]:
        """Update notification preferences for a customer."""
        if customer_id not in self.customers:
            return {"status": "error", "message": "Customer not found"}
        
        prefs = self.notification_service.get_preferences(customer_id)
        
        if tier_upgrades_in_app is not None:
            prefs.tier_upgrades_in_app = tier_upgrades_in_app
        if tier_upgrades_email is not None:
            prefs.tier_upgrades_email = tier_upgrades_email
        if milestones_in_app is not None:
            prefs.milestones_in_app = milestones_in_app
        if milestones_email is not None:
            prefs.milestones_email = milestones_email
        
        self.notification_service.update_preferences(customer_id, prefs)
        
        return {
            "status": "success",
            "message": "Preferences updated successfully",
            "preferences": {
                "tier_upgrades_in_app": prefs.tier_upgrades_in_app,
                "tier_upgrades_email": prefs.tier_upgrades_email,
                "milestones_in_app": prefs.milestones_in_app,
                "milestones_email": prefs.milestones_email
            }
        }
    
    def get_customer_info(self, customer_id: str) -> Dict[str, Any]:
        """Get customer information including points and tier."""
        if customer_id not in self.customers:
            return {"status": "error", "message": "Customer not found"}
        
        customer = self.customers[customer_id]
        unread_count = len([n for n in self.notification_service.get_notifications(customer_id) if not n.read])
        
        return {
            "status": "success",
            "customer": {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "points": customer.points,
                "tier": customer.tier.value,
                "unread_notifications": unread_count
            }
        }
