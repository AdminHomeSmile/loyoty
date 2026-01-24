# Customer Notification System

## Overview

This notification system provides real-time alerts to customers about important events in the loyalty rewards program, including:

- **Tier Upgrades**: Notifications when customers advance to new reward tiers (Bronze, Silver, Gold, Platinum)
- **Milestone Achievements**: Notifications when customers reach point milestones (500, 1000, 2500, 5000, 10000 points)

## Features

### 1. Multi-Channel Notifications
- **In-App Notifications**: Displayed in the application UI
- **Email Notifications**: Sent to customer's email (when email provider is configured)

### 2. User-Managed Preferences
Customers can control their notification preferences:
- Enable/disable tier upgrade notifications (in-app and email separately)
- Enable/disable milestone notifications (in-app and email separately)

### 3. Notification Management
- View all notifications
- Filter to unread notifications only
- Mark individual notifications as read
- Mark all notifications as read
- Track notification metadata (timestamps, tier info, milestone details)

## Architecture

### Core Components

1. **models.py**: Data models for customers, notifications, preferences, and configuration
2. **notification_service.py**: Business logic for notification creation and management
3. **api.py**: API interface for integrating with applications

### Tier System

| Tier     | Points Required |
|----------|----------------|
| Bronze   | 0              |
| Silver   | 1,000          |
| Gold     | 5,000          |
| Platinum | 10,000         |

### Milestones

| Points  | Description           | Reward       |
|---------|-----------------------|--------------|
| 500     | First 500 points!     | 5% discount  |
| 1,000   | Reached 1000 points!  | 10% discount |
| 2,500   | Reached 2500 points!  | Free product |
| 5,000   | Reached 5000 points!  | 20% discount |
| 10,000  | Reached 10000 points! | VIP status   |

## Usage

### Basic Setup

```python
from models import Customer, TierLevel
from notification_service import NotificationService
from api import NotificationAPI

# Initialize the notification system
notification_service = NotificationService()
api = NotificationAPI(notification_service)

# Create a customer
customer = Customer(
    name="John Doe",
    email="john@example.com",
    points=0
)
api.add_customer(customer)
```

### Adding Points (Triggers Notifications)

```python
# Add points to customer account
# This automatically checks for tier upgrades and milestones
result = api.add_points(customer.id, 1000)

# Result includes:
# - New points total
# - Current tier
# - List of notifications created
print(result["notifications_created"])  # Number of notifications
```

### Viewing Notifications

```python
# Get all notifications
result = api.get_notifications(customer.id)

# Get only unread notifications
result = api.get_notifications(customer.id, unread_only=True)

# Each notification includes:
# - id, type, channel, title, message
# - read status, timestamp, metadata
```

### Managing Notification Preferences

```python
# Get current preferences
prefs = api.get_notification_preferences(customer.id)

# Update preferences
api.update_notification_preferences(
    customer.id,
    tier_upgrades_in_app=True,
    tier_upgrades_email=False,  # Disable email for tier upgrades
    milestones_in_app=True,
    milestones_email=True
)
```

### Marking Notifications as Read

```python
# Mark a specific notification as read
api.mark_notification_read(customer.id, notification_id)

# Mark all notifications as read
api.mark_all_notifications_read(customer.id)
```

### Getting Customer Info with Notification Count

```python
# Get customer info including unread notification count
result = api.get_customer_info(customer.id)
print(result["customer"]["unread_notifications"])
```

## Email Integration

To enable email notifications, configure an email provider:

```python
class EmailProvider:
    def send_email(self, to, subject, body):
        # Your email sending logic here
        pass

# Configure the email provider
email_provider = EmailProvider()
notification_service.set_email_provider(email_provider)
```

## Testing

Run the test suite:

```bash
python test_notifications.py
```

Run the example demo:

```bash
python example_usage.py
```

## API Response Format

All API methods return a dictionary with:
- `status`: "success" or "error"
- Additional data specific to the endpoint
- Error messages when applicable

### Example Response: Add Points

```json
{
  "status": "success",
  "customer_id": "abc123",
  "old_points": 500,
  "new_points": 1500,
  "tier": "Silver",
  "notifications_created": 3,
  "notifications": [
    {
      "id": "notif-1",
      "type": "tier_upgrade",
      "channel": "in_app",
      "title": "Congratulations! You've reached Silver tier!",
      "message": "You've been upgraded to Silver tier with 1500 points..."
    },
    {
      "id": "notif-2",
      "type": "milestone_reached",
      "channel": "in_app",
      "title": "Milestone Achieved: Reached 1000 points!",
      "message": "Congratulations! You've reached 1000 points!..."
    }
  ]
}
```

## Acceptance Criteria Met

✅ **Timely Notifications**: Notifications are created immediately when points are added that trigger tier or milestone events

✅ **User-Managed Preferences**: Customers can enable/disable notifications by type (tier/milestone) and channel (in-app/email)

✅ **Clear Display**: Notifications include clear titles, messages, and metadata. The API provides structured data for UI display

✅ **Multi-Channel Support**: Both in-app and email notifications are supported (email requires provider configuration)

## Extension Points

The system is designed to be easily extended:

1. **Additional Notification Types**: Add new notification types to `NotificationType` enum
2. **Additional Channels**: Add new channels to `NotificationChannel` enum (e.g., SMS, push)
3. **Custom Milestones**: Modify `MILESTONES` configuration
4. **Dynamic Tiers**: Adjust `TIER_THRESHOLDS` as needed
5. **Persistence**: Integrate with a database by extending the service class
6. **Real-time Updates**: Add WebSocket support for live notification delivery
