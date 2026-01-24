# Customer Notification System - Quick Start

This is the implementation for the customer notification system that alerts users about tier upgrades and reward milestones.

## Quick Demo

### 1. Run Tests (Verify Everything Works)
```bash
python test_notifications.py
```
Expected: All 25 tests pass ✅

### 2. Run Command-Line Demo
```bash
python example_usage.py
```
This shows a complete workflow including tier upgrades and milestone notifications.

### 3. View Interactive UI Demo
```bash
python -m http.server 8080
```
Then open http://localhost:8080/demo_ui.html in your browser.

The UI demo shows:
- Customer profile with current tier and points
- List of notifications (tier upgrades and milestones)
- Unread notification tracking
- Interactive notification preferences modal

## Key Files

- **`models.py`**: Core data structures
- **`notification_service.py`**: Business logic for notifications
- **`api.py`**: API interface for applications
- **`test_notifications.py`**: Comprehensive test suite
- **`example_usage.py`**: Command-line demonstration
- **`demo_ui.html`**: Interactive browser UI
- **`NOTIFICATIONS.md`**: Complete documentation

## System Overview

### Tier System
- **Bronze**: 0+ points (starting tier)
- **Silver**: 1,000+ points
- **Gold**: 5,000+ points
- **Platinum**: 10,000+ points

### Milestones
- **500 points**: 5% discount
- **1,000 points**: 10% discount
- **2,500 points**: Free product
- **5,000 points**: 20% discount
- **10,000 points**: VIP status

### Notification Types
- **Tier Upgrades**: When crossing tier thresholds
- **Milestones**: When reaching point milestones

### Channels
- **In-App**: Displayed in the application UI
- **Email**: Sent to customer email (when configured)

### User Preferences
Customers can enable/disable:
- Tier upgrade notifications (in-app)
- Tier upgrade notifications (email)
- Milestone notifications (in-app)
- Milestone notifications (email)

## Integration Example

```python
from models import Customer
from notification_service import NotificationService
from api import NotificationAPI

# Initialize
service = NotificationService()
api = NotificationAPI(service)

# Create customer
customer = Customer(name="John Doe", email="john@example.com", points=0)
api.add_customer(customer)

# Add points (triggers notifications automatically)
result = api.add_points(customer.id, 1000)
print(f"Created {result['notifications_created']} notifications")
print(f"New tier: {result['tier']}")

# Get notifications
notifications = api.get_notifications(customer.id, unread_only=True)
for notif in notifications['notifications']:
    print(f"- {notif['title']}")
```

## Documentation

See **NOTIFICATIONS.md** for complete documentation including:
- Architecture details
- API reference
- Usage examples
- Extension points

## Test Coverage

✅ 25 tests covering:
- Tier calculation and upgrades
- Milestone detection
- Notification creation
- Preference management
- API endpoints
- Edge cases

## Security

✅ CodeQL scan passed with 0 vulnerabilities
✅ No secrets or sensitive data in code
✅ Logging module used for error handling
✅ Input validation on all API methods
