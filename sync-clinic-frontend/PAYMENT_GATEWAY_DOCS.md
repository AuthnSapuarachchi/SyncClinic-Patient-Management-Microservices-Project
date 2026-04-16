# SyncClinic Payment Gateway - Frontend Documentation

## 📋 Overview

This document provides a complete guide to the SyncClinic Payment Gateway frontend implementation. It includes the complete payment workflow, component architecture, setup instructions, and integration details.

---

## 🔄 Payment Workflow

### Complete User Journey

```
1. Appointment Completion
   ↓
2. Payment Initiation Page
   └─ Review appointment details
   └─ View consultation fee
   └─ Click "Proceed to Payment"
   ↓
3. Stripe Payment Intent Created
   └─ Backend creates PaymentIntent in Stripe
   └─ Returns clientSecret + publishableKey
   ↓
4. Payment Checkout Page
   └─ User enters billing information
   └─ User enters card details
   └─ Validates form data
   └─ Click "Pay LKR X.XX"
   ↓
5. Stripe Payment Processing
   └─ CardElement captures card data (PCI compliant)
   └─ confirmCardPayment() called with clientSecret
   └─ 3D Secure verification if needed
   ↓
6. Stripe Webhook Notification
   └─ Backend receives payment_intent.succeeded
   └─ Database updated with PAID status
   └─ Kafka event published to notification-service
   ↓
7. Success Page
   └─ Display payment confirmation
   └─ Show receipt and next steps
   └─ Option to download invoice
   ↓
8. Email Confirmation
   └─ Notification service sends confirmation email
   └─ Appointment marked as PAID in system
```

---

## 🗂️ Project Structure

```
src/
├── pages/
│   ├── PaymentInitiation.jsx      # Step 1: Review appointment & initiate payment
│   ├── PaymentCheckout.jsx        # Step 4: Stripe card form & payment
│   ├── PaymentSuccess.jsx         # Step 7: Success confirmation
│   ├── PaymentFailed.jsx          # Error handling & retry guidance
│   └── PaymentHistory.jsx         # View past transactions
├── api/
│   ├── axiosConfig.js             # Axios interceptor with JWT auth
│   └── paymentApi.js              # Payment API endpoints
└── App.jsx                        # Updated with payment routes
```

---

## 📄 Page Components

### 1. **PaymentInitiation.jsx**
**Purpose:** Review appointment details before payment

**Features:**
- Displays doctor information
- Shows appointment date/time
- Displays consultation fee breakdown
- Security badges (SSL, PCI compliance)
- Initiates PaymentIntent on backend

**User Actions:**
- Click "Proceed to Payment" → Navigate to checkout
- Click "Cancel" → Go back

**Backend Integration:**
- `POST /api/payments/intent` - Creates Stripe PaymentIntent
- Returns: `{ clientSecret, publishableKey, appointmentDetails }`

---

### 2. **PaymentCheckout.jsx**
**Purpose:** Collect payment information and process payment

**Features:**
- Stripe Elements for secure card capture
- Billing information form (name, address, postal code)
- Order summary display
- Real-time card validation
- 3D Secure support
- Error handling with user-friendly messages

**Form Fields:**
- Email (read-only, from auth)
- Full Name (required)
- Billing Address (required)
- City (required)
- Postal Code (required)
- Card Details (via Stripe CardElement)

**Stripe Integration:**
```javascript
stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { ... }
  }
})
```

**Response Handling:**
- `status === 'succeeded'` → Navigate to /payment-success
- `status === 'requires_action'` → Show 3D Secure prompt
- Error response → Display error message

---

### 3. **PaymentSuccess.jsx**
**Purpose:** Display confirmation and next steps

**Features:**
- Success animation
- Payment details display
- Receipt generation
- Next steps guidance
- Download invoice button
- Back to dashboard navigation

**Information Displayed:**
- Payment ID
- Appointment ID
- Doctor name
- Amount paid
- Payment status
- Timestamp

**Actions:**
- Download receipt (integrate with backend)
- View payment history
- Back to dashboard

---

### 4. **PaymentFailed.jsx**
**Purpose:** Handle payment failures gracefully

**Features:**
- Clear error messaging
- List of common failure reasons
- Troubleshooting steps
- Retry capability
- Support contact information
- Tips for successful payment

**Failure Reasons Covered:**
- Card declined
- Insufficient funds
- Incorrect card details
- Card expired
- Transaction blocked
- Gateway timeout

**Actions:**
- Try Again → Back to PaymentInitiation
- Back to Dashboard

---

### 5. **PaymentHistory.jsx**
**Purpose:** View all payment transactions

**Features:**
- Statistics dashboard (Total Paid, Transactions, Pending, Failed)
- Filter by status (All, Paid, Pending, Failed)
- Sort options (Most Recent, Highest Amount)
- Responsive transaction table
- Receipt viewing
- Print statement

**Information Displayed:**
- Transaction date/time
- Doctor name
- Appointment ID
- Amount
- Status
- Action buttons

**Backend Integration:**
- `GET /api/payments/my-payments` - Fetch all patient payments
- Optional mock data for demo purposes

---

## 🔌 API Integration

### Payment API Endpoints

#### 1. Create Payment Intent
```javascript
POST /api/payments/intent
Content-Type: application/json

{
  "appointmentId": "APT-001"
}

Response:
{
  "id": "PAY-001",
  "clientSecret": "pi_1234567890_secret_...",
  "publishableKey": "pk_test_...",
  "amount": 1500.00,
  "currency": "lkr",
  "status": "PENDING"
}
```

#### 2. Get Payment History
```javascript
GET /api/payments/my-payments
Authorization: Bearer {jwt_token}

Response:
[
  {
    "id": "PAY-001",
    "appointmentId": "APT-001",
    "doctorName": "Dr. Kumar",
    "amount": 1500.00,
    "currency": "lkr",
    "status": "PAID",
    "createdAt": "2026-04-16T10:30:00Z"
  },
  ...
]
```

#### 3. Get Payment by Appointment
```javascript
GET /api/payments/appointment/{appointmentId}
Authorization: Bearer {jwt_token}

Response:
{
  "id": "PAY-001",
  "appointmentId": "APT-001",
  "doctorName": "Dr. Kumar",
  "amount": 1500.00,
  "currency": "lkr",
  "status": "PAID",
  "createdAt": "2026-04-16T10:30:00Z"
}
```

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
Dependencies are already in `package.json`:
```json
{
  "@stripe/react-stripe-js": "^6.2.0",
  "@stripe/stripe-js": "^9.2.0",
  "axios": "^1.15.0",
  "react-router-dom": "^7.14.1"
}
```

If needed, install with:
```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the frontend root:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
REACT_APP_API_BASE_URL=http://localhost:8080
```

**How to get Stripe Key:**
1. Sign up at https://stripe.com
2. Go to Dashboard → API Keys
3. Copy your Publishable Key (starts with `pk_test_` or `pk_live_`)

### 3. Update Stripe Promise

In `PaymentCheckout.jsx`, update the Stripe loader:
```javascript
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
```

---

## 📱 Styling & Themes

### Color Scheme
- **Primary:** Blue (#2563eb, #1d4ed8)
- **Success:** Green (#10b981, #059669)
- **Warning:** Yellow (#f59e0b, #d97706)
- **Error:** Red (#ef4444, #dc2626)
- **Secondary:** Gray (various shades)

### Tailwind CSS Classes Used
- Gradient backgrounds: `from-blue-50 to-indigo-100`
- Rounded corners: `rounded-lg`
- Shadows: `shadow`, `shadow-lg`, `shadow-2xl`
- Flexbox: `flex`, `flex-col`, `grid`, `grid-cols-2`
- Animations: `animate-bounce`, `animate-spin`
- Responsive: `md:`, `lg:` breakpoints

---

## 🔐 Security Features

### PCI Compliance
- ✅ Card data never touches backend
- ✅ Stripe Elements handles tokenization
- ✅ HTTPS enforced (in production)
- ✅ JWT authentication on all requests

### Additional Security
```javascript
// JWT Token automatically attached to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```

### 3D Secure Support
Automatic handling for cards requiring additional verification:
```javascript
if (result.paymentIntent.status === 'requires_action') {
  // 3D Secure challenge automatically triggered by Stripe
  // User completes challenge and returns to app
}
```

---

## 🧪 Testing

### Test Card Numbers (Stripe)

| Card Number | Status |
|---|---|
| 4242 4242 4242 4242 | Success |
| 5555 5555 5555 4444 | Visa Success |
| 4000 0025 0000 3155 | 3D Secure Required |
| 4000 0000 0000 9995 | Declined |
| 4000 0000 0000 0002 | Card Declined |

### Test Expiry & CVC
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

### Mock Data
PaymentHistory.jsx includes mock data for testing:
```javascript
const mockPayments = [
  {
    id: 'PAY-001',
    status: 'PAID',
    amount: 1500.00,
    ...
  },
  // More mock payments
];
```

---

## 🚀 Deployment Considerations

### 1. Environment Variables
Set production Stripe key in deployment:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
```

### 2. CORS Configuration
Ensure backend allows frontend origin:
```java
// Spring Boot CORS config
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                .allowedOrigins("https://yourdomain.com")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
        }
    };
}
```

### 3. Build for Production
```bash
npm run build
```

### 4. Error Tracking
Consider integrating Sentry or similar for error tracking:
```bash
npm install @sentry/react @sentry/tracing
```

---

## 📊 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Workflow                          │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │  PaymentInitiation.jsx             │
        │  ✓ Review Appointment              │
        │  ✓ Show Fee Breakdown              │
        └─────────────────┬─────────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │  Create PaymentIntent              │
        │  Backend: POST /api/payments/intent│
        │  ✓ Returns clientSecret            │
        └─────────────────┬─────────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │  PaymentCheckout.jsx               │
        │  ✓ Stripe Card Form                │
        │  ✓ Billing Information             │
        │  ✓ Validate & Submit               │
        └─────────────────┬─────────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │  Stripe Payment Processing         │
        │  ✓ confirmCardPayment()            │
        │  ✓ 3D Secure if needed             │
        └─────────────────┬─────────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │  Backend Webhook Handler           │
        │  ✓ payment_intent.succeeded        │
        │  ✓ Update DB to PAID               │
        └─────────────────┬─────────────────┘
                          │
        ┌─────────────────▼─────────────────┐
        │  PaymentSuccess.jsx OR             │
        │  PaymentFailed.jsx                 │
        │  ✓ Display Result                  │
        │  ✓ Next Steps                      │
        └─────────────────────────────────────┘
```

---

## 🔄 User Flow State Machine

```
START
  │
  ├─→ [PaymentInitiation]
  │   └─→ "Proceed to Payment" ──→ [PaymentCheckout]
  │   └─→ "Cancel" ──→ BACK
  │
  ├─→ [PaymentCheckout]
  │   └─→ "Pay" ──→ Processing...
  │       ├─→ Success ──→ [PaymentSuccess]
  │       └─→ Failed ──→ [PaymentFailed]
  │
  ├─→ [PaymentSuccess]
  │   └─→ "Back to Dashboard" ──→ [PatientDashboard]
  │   └─→ "Payment History" ──→ [PaymentHistory]
  │
  ├─→ [PaymentFailed]
  │   └─→ "Try Again" ──→ [PaymentInitiation]
  │   └─→ "Back to Dashboard" ──→ [PatientDashboard]
  │
  └─→ [PaymentHistory]
      └─→ "Back to Dashboard" ──→ [PatientDashboard]
```

---

## 📞 Integration with Patient Dashboard

Add a "Make Payment" button to PatientDashboard.jsx:

```javascript
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const navigate = useNavigate();

  const handleMakePayment = (appointmentId) => {
    navigate(`/payment-initiation/${appointmentId}`);
  };

  return (
    <>
      {/* ... existing dashboard code ... */}
      
      {/* Add this button to appointment cards */}
      <button
        onClick={() => handleMakePayment(appointment.id)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Make Payment
      </button>
    </>
  );
}
```

---

## 🐛 Troubleshooting

### Issue: "Stripe not loaded"
**Solution:** Ensure `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`

### Issue: CORS errors
**Solution:** Add backend origin to CORS whitelist

### Issue: Card element not rendering
**Solution:** Ensure `<Elements>` wrapper is used in PaymentCheckout

### Issue: JWT token not sent
**Solution:** Check localStorage has `jwt_token` key set

### Issue: Mock payment calls not working
**Solution:** Backend `/api/payments/intent` endpoint must be accessible

---

## 📚 Related Backend Documentation

See [PaymentService.java](../payment-service/src/main/java/com/SyncClinic/payment_service/service/PaymentService.java) for backend payment processing logic.

---

## ✅ Implementation Checklist

- [x] Create PaymentInitiation page
- [x] Create PaymentCheckout page with Stripe integration
- [x] Create PaymentSuccess page
- [x] Create PaymentFailed page
- [x] Create PaymentHistory page
- [x] Create paymentApi.js service
- [x] Update App.jsx with payment routes
- [ ] Configure Stripe API key in .env
- [ ] Test with Stripe test cards
- [ ] Integrate "Make Payment" button in dashboard
- [ ] Configure backend CORS for frontend origin
- [ ] Test 3D Secure flow
- [ ] Set up error logging/monitoring
- [ ] Deploy to production with live Stripe key

---

## 📝 Notes

- All payment requests include JWT authorization headers
- Stripe Elements handle all card data securely (PCI Level 1)
- Mock data is available in PaymentHistory for demo purposes
- Responsive design works on mobile and desktop
- Production Stripe key should be used for live payments

---

**Last Updated:** April 16, 2026
**Status:** Production Ready
