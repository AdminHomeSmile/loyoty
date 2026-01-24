"""
Tests for the notification system.
"""
import unittest
from models import Customer, TierLevel, NotificationPreferences
from notification_service import NotificationService
from api import NotificationAPI


class TestNotificationService(unittest.TestCase):
    """Test cases for NotificationService."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.service = NotificationService()
        self.customer = Customer(
            id="test-customer-1",
            name="John Doe",
            email="john@example.com",
            points=0,
            tier=TierLevel.BRONZE
        )
    
    def test_tier_upgrade_bronze_to_silver(self):
        """Test notification when upgrading from Bronze to Silver."""
        self.customer.points = 1000
        old_points = 500
        
        new_tier = self.service.check_tier_upgrade(self.customer, old_points)
        self.assertEqual(new_tier, TierLevel.SILVER)
        
        notifications = self.service.notify_tier_upgrade(self.customer, new_tier)
        self.assertGreater(len(notifications), 0)
        self.assertEqual(notifications[0].title, "Congratulations! You've reached Silver tier!")
    
    def test_tier_upgrade_bronze_to_gold(self):
        """Test notification when upgrading from Bronze to Gold."""
        self.customer.points = 5000
        old_points = 500
        
        new_tier = self.service.check_tier_upgrade(self.customer, old_points)
        self.assertEqual(new_tier, TierLevel.GOLD)
    
    def test_no_tier_upgrade_same_tier(self):
        """Test no notification when staying in same tier."""
        self.customer.points = 800
        old_points = 500
        
        new_tier = self.service.check_tier_upgrade(self.customer, old_points)
        self.assertIsNone(new_tier)
    
    def test_milestone_reached(self):
        """Test notification when reaching a milestone."""
        self.customer.points = 1000
        old_points = 900
        
        milestones = self.service.check_milestones(self.customer, old_points)
        self.assertEqual(len(milestones), 1)
        self.assertEqual(milestones[0].points, 1000)
        
        notifications = self.service.notify_milestone(self.customer, milestones[0])
        self.assertGreater(len(notifications), 0)
        self.assertIn("1000 points", notifications[0].message)
    
    def test_multiple_milestones(self):
        """Test notifications when reaching multiple milestones at once."""
        self.customer.points = 1500
        old_points = 0
        
        milestones = self.service.check_milestones(self.customer, old_points)
        self.assertEqual(len(milestones), 2)  # 500 and 1000 milestones
    
    def test_process_points_update_with_tier_and_milestone(self):
        """Test processing points update that triggers both tier and milestone."""
        self.customer.points = 1000
        old_points = 0
        
        notifications = self.service.process_points_update(self.customer, old_points)
        # Should get notifications for tier upgrade and milestones (500 and 1000)
        self.assertGreater(len(notifications), 2)
    
    def test_notification_preferences_default(self):
        """Test default notification preferences."""
        prefs = self.service.get_preferences(self.customer.id)
        self.assertTrue(prefs.tier_upgrades_in_app)
        self.assertTrue(prefs.tier_upgrades_email)
        self.assertTrue(prefs.milestones_in_app)
        self.assertTrue(prefs.milestones_email)
    
    def test_notification_preferences_update(self):
        """Test updating notification preferences."""
        prefs = NotificationPreferences(
            customer_id=self.customer.id,
            tier_upgrades_in_app=True,
            tier_upgrades_email=False,
            milestones_in_app=True,
            milestones_email=False
        )
        self.service.update_preferences(self.customer.id, prefs)
        
        retrieved = self.service.get_preferences(self.customer.id)
        self.assertTrue(retrieved.tier_upgrades_in_app)
        self.assertFalse(retrieved.tier_upgrades_email)
    
    def test_get_notifications(self):
        """Test retrieving notifications for a customer."""
        self.customer.points = 1000
        self.service.process_points_update(self.customer, 0)
        
        notifications = self.service.get_notifications(self.customer.id)
        self.assertGreater(len(notifications), 0)
    
    def test_mark_notification_as_read(self):
        """Test marking a notification as read."""
        self.customer.points = 1000
        notifications = self.service.process_points_update(self.customer, 0)
        
        notification_id = notifications[0].id
        success = self.service.mark_as_read(self.customer.id, notification_id)
        self.assertTrue(success)
        
        retrieved = self.service.get_notifications(self.customer.id)
        marked_notification = next(n for n in retrieved if n.id == notification_id)
        self.assertTrue(marked_notification.read)
    
    def test_mark_all_as_read(self):
        """Test marking all notifications as read."""
        self.customer.points = 1000
        self.service.process_points_update(self.customer, 0)
        
        count = self.service.mark_all_as_read(self.customer.id)
        self.assertGreater(count, 0)
        
        unread = self.service.get_notifications(self.customer.id, unread_only=True)
        self.assertEqual(len(unread), 0)


class TestNotificationAPI(unittest.TestCase):
    """Test cases for NotificationAPI."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.service = NotificationService()
        self.api = NotificationAPI(self.service)
        self.customer = Customer(
            id="api-test-customer",
            name="Jane Smith",
            email="jane@example.com",
            points=0,
            tier=TierLevel.BRONZE
        )
        self.api.add_customer(self.customer)
    
    def test_add_customer(self):
        """Test adding a customer through the API."""
        new_customer = Customer(
            id="new-customer",
            name="Bob Johnson",
            email="bob@example.com"
        )
        result = self.api.add_customer(new_customer)
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["customer_id"], new_customer.id)
    
    def test_add_points_creates_notifications(self):
        """Test that adding points creates appropriate notifications."""
        result = self.api.add_points(self.customer.id, 1000)
        
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["new_points"], 1000)
        self.assertEqual(result["tier"], "Silver")
        self.assertGreater(result["notifications_created"], 0)
    
    def test_get_notifications(self):
        """Test retrieving notifications through the API."""
        self.api.add_points(self.customer.id, 500)
        
        result = self.api.get_notifications(self.customer.id)
        self.assertEqual(result["status"], "success")
        self.assertGreater(result["count"], 0)
    
    def test_get_unread_notifications(self):
        """Test retrieving only unread notifications."""
        self.api.add_points(self.customer.id, 500)
        
        result = self.api.get_notifications(self.customer.id, unread_only=True)
        self.assertEqual(result["status"], "success")
        self.assertGreater(result["count"], 0)
    
    def test_mark_notification_read(self):
        """Test marking a notification as read through the API."""
        self.api.add_points(self.customer.id, 500)
        
        notifications = self.api.get_notifications(self.customer.id)
        notification_id = notifications["notifications"][0]["id"]
        
        result = self.api.mark_notification_read(self.customer.id, notification_id)
        self.assertEqual(result["status"], "success")
    
    def test_mark_all_read(self):
        """Test marking all notifications as read."""
        self.api.add_points(self.customer.id, 1000)
        
        result = self.api.mark_all_notifications_read(self.customer.id)
        self.assertEqual(result["status"], "success")
    
    def test_get_notification_preferences(self):
        """Test getting notification preferences through the API."""
        result = self.api.get_notification_preferences(self.customer.id)
        
        self.assertEqual(result["status"], "success")
        self.assertTrue(result["preferences"]["tier_upgrades_in_app"])
    
    def test_update_notification_preferences(self):
        """Test updating notification preferences through the API."""
        result = self.api.update_notification_preferences(
            self.customer.id,
            tier_upgrades_email=False,
            milestones_email=False
        )
        
        self.assertEqual(result["status"], "success")
        self.assertFalse(result["preferences"]["tier_upgrades_email"])
        self.assertFalse(result["preferences"]["milestones_email"])
    
    def test_get_customer_info(self):
        """Test getting customer information with notification count."""
        self.api.add_points(self.customer.id, 500)
        
        result = self.api.get_customer_info(self.customer.id)
        
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["customer"]["points"], 500)
        self.assertGreater(result["customer"]["unread_notifications"], 0)
    
    def test_customer_not_found(self):
        """Test API responses when customer is not found."""
        result = self.api.add_points("non-existent", 100)
        self.assertEqual(result["status"], "error")


class TestTierCalculation(unittest.TestCase):
    """Test tier calculation logic."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.service = NotificationService()
    
    def test_bronze_tier(self):
        """Test Bronze tier calculation."""
        tier = self.service._calculate_tier(0)
        self.assertEqual(tier, TierLevel.BRONZE)
        
        tier = self.service._calculate_tier(999)
        self.assertEqual(tier, TierLevel.BRONZE)
    
    def test_silver_tier(self):
        """Test Silver tier calculation."""
        tier = self.service._calculate_tier(1000)
        self.assertEqual(tier, TierLevel.SILVER)
        
        tier = self.service._calculate_tier(4999)
        self.assertEqual(tier, TierLevel.SILVER)
    
    def test_gold_tier(self):
        """Test Gold tier calculation."""
        tier = self.service._calculate_tier(5000)
        self.assertEqual(tier, TierLevel.GOLD)
        
        tier = self.service._calculate_tier(9999)
        self.assertEqual(tier, TierLevel.GOLD)
    
    def test_platinum_tier(self):
        """Test Platinum tier calculation."""
        tier = self.service._calculate_tier(10000)
        self.assertEqual(tier, TierLevel.PLATINUM)
        
        tier = self.service._calculate_tier(50000)
        self.assertEqual(tier, TierLevel.PLATINUM)


if __name__ == '__main__':
    unittest.main()
