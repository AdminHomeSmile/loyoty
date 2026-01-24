"""
Example usage of the notification system.
This demonstrates the complete workflow for the customer notification system.
"""
from models import Customer, TierLevel
from notification_service import NotificationService
from api import NotificationAPI
import json


def print_section(title):
    """Print a formatted section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)


def print_json(data):
    """Pretty print JSON data."""
    print(json.dumps(data, indent=2))


def main():
    """Run example scenarios for the notification system."""
    
    print_section("Loyalty Rewards Notification System Demo")
    
    # Initialize the system
    notification_service = NotificationService()
    api = NotificationAPI(notification_service)
    
    # Create a new customer
    print_section("1. Creating New Customer")
    customer = Customer(
        name="Alice Johnson",
        email="alice@example.com",
        points=0
    )
    result = api.add_customer(customer)
    print_json(result)
    customer_id = customer.id
    
    # Check initial state
    print_section("2. Initial Customer Information")
    result = api.get_customer_info(customer_id)
    print_json(result)
    
    # Add points to trigger first milestone
    print_section("3. Adding 500 Points (First Milestone)")
    result = api.add_points(customer_id, 500)
    print_json(result)
    
    # View notifications
    print_section("4. Viewing Customer Notifications")
    result = api.get_notifications(customer_id)
    print_json(result)
    
    # Add more points to trigger tier upgrade
    print_section("5. Adding 500 More Points (Tier Upgrade to Silver)")
    result = api.add_points(customer_id, 500)
    print_json(result)
    
    # View all notifications including unread count
    print_section("6. Updated Customer Information")
    result = api.get_customer_info(customer_id)
    print_json(result)
    
    # View notification preferences
    print_section("7. Current Notification Preferences")
    result = api.get_notification_preferences(customer_id)
    print_json(result)
    
    # Update notification preferences
    print_section("8. Updating Notification Preferences (Disable Email)")
    result = api.update_notification_preferences(
        customer_id,
        tier_upgrades_email=False,
        milestones_email=False
    )
    print_json(result)
    
    # Add more points with email disabled
    print_section("9. Adding 4000 Points (Should Upgrade to Gold)")
    result = api.add_points(customer_id, 4000)
    print_json(result)
    
    # Check only unread notifications
    print_section("10. Viewing Only Unread Notifications")
    result = api.get_notifications(customer_id, unread_only=True)
    print_json(result)
    
    # Mark a notification as read
    if result["notifications"]:
        print_section("11. Marking First Notification as Read")
        notification_id = result["notifications"][0]["id"]
        mark_result = api.mark_notification_read(customer_id, notification_id)
        print_json(mark_result)
    
    # Mark all as read
    print_section("12. Marking All Notifications as Read")
    result = api.mark_all_notifications_read(customer_id)
    print_json(result)
    
    # Verify all are read
    print_section("13. Verifying All Notifications Are Read")
    result = api.get_notifications(customer_id, unread_only=True)
    print(f"Unread notifications: {result['count']}")
    
    # Final customer state
    print_section("14. Final Customer State")
    result = api.get_customer_info(customer_id)
    print_json(result)
    
    # Show all notifications history
    print_section("15. Complete Notification History")
    result = api.get_notifications(customer_id)
    print(f"Total notifications: {result['count']}")
    for i, notification in enumerate(result['notifications'], 1):
        print(f"\n{i}. {notification['title']}")
        print(f"   Type: {notification['type']}")
        print(f"   Channel: {notification['channel']}")
        print(f"   Read: {notification['read']}")
    
    print_section("Demo Complete!")
    print("\nKey Features Demonstrated:")
    print("✓ Customer tier upgrades (Bronze → Silver → Gold)")
    print("✓ Milestone notifications (500, 1000, 2500, 5000 points)")
    print("✓ In-app notification display")
    print("✓ Notification preference management")
    print("✓ Mark notifications as read")
    print("✓ Unread notification tracking")


if __name__ == "__main__":
    main()
