# Payment Gateway - Developer Quick Reference

## 🎯 Quick Navigation

| Page | Route | Purpose |
|------|-------|---------|
| PaymentInitiation | `/payment-initiation/:appointmentId` | Review & initiate payment |
| PaymentCheckout | `/payment-checkout/:appointmentId` | Stripe card form |
| PaymentSuccess | `/payment-success/:appointmentId` | Success confirmation |
| PaymentFailed | `/payment-failed/:appointmentId` | Error handling |
| PaymentHistory | `/payment-history` | View transactions |

---

## 🔄 Complete Workflow Sequence

```
USER JOURNEY:
│
├─ 1. User clicks "Make Payment" on appointment
│
├─ 2. ROUTE: /payment-initiation/:appointmentId
│    ├─ Component: PaymentInitiation.jsx
│    ├─ Action: Click "Proceed to Payment"
│    └─ API Call: None (state-based)
│
├─ 3. USER SEES: Appointment details & fee
│    ├─ Doctor name
│    ├─ Consultation fee (LKR)
│    ├─ Security badges
│    └─ Button: "Proceed to Payment"
│
├─ 4. BACKEND INTERACTION:
│    ├─ POST /api/payments/intent
│    ├─ Body: { appointmentId }
│    └─ Response: { clientSecret, publishableKey }
│
├─ 5. ROUTE: /payment-checkout/:appointmentId
│    ├─ Component: PaymentCheckout.jsx
│    ├─ State: { clientSecret, publishableKey }
│    └─ Stripe Elements: Load CardElement
│
├─ 6. USER ENTERS:
│    ├─ Email (read-only)
│    ├─ Full Name
│    ├─ Billing Address
│    ├─ City
│    ├─ Postal Code
│    └─ Card Details (via Stripe)
│
├─ 7. USER CLICKS: "Pay LKR X.XX"
│    ├─ Validate form
│    ├─ Call stripe.confirmCardPayment()
│    └─ Send to Stripe
│
├─ 8. STRIPE PROCESSING:
│    ├─ Validate card
│    ├─ Check 3D Secure
│    └─ Return: succeeded | failed | requires_action
│
├─ 9a. IF SUCCESS:
│    ├─ Stripe webhook sent to backend
│    ├─ Backend: payment_intent.succeeded
│    ├─ DB: Update payment to PAID
│    ├─ Kafka: Publish PaymentSuccessEvent
│    └─ ROUTE: /payment-success/:appointmentId
│
├─ 9b. IF FAILURE:
│    ├─ Show error message
│    └─ ROUTE: /payment-failed/:appointmentId
│
├─ 10. SUCCESS PAGE:
│    ├─ Display payment details
│    ├─ Show receipt
│    ├─ Options: Download | Payment History | Dashboard
│    └─ Email confirmation sent
│
└─ 11. FAIL PAGE:
     ├─ Show error reason
     ├─ Troubleshooting tips
     ├─ Options: Retry | Support | Dashboard
     └─ Contact information

PAYMENT HISTORY:
│
├─ ROUTE: /payment-history
├─ Component: PaymentHistory.jsx
├─ Action: GET /api/payments/my-payments
├─ Features:
│  ├─ Statistics (Total Paid, Transactions, Pending, Failed)
│  ├─ Filter by status
│  ├─ Sort options
│  ├─ View receipts
│  └─ Print statement
└─ End: Back to Dashboard
```

---

## 📦 Component Props & Data Flow

### PaymentInitiation.jsx
```javascript
// Props: None (uses React Router useParams)
// Uses:
// - appointmentId from URL
// - Mock appointment data (replace with API call)
// - createPaymentIntent() API

// Outputs:
// - Navigate to /payment-checkout with state:
//   { clientSecret, publishableKey, appointmentDetails }
```

### PaymentCheckout.jsx
```javascript
// Props: None (uses location.state)
// Receives via location.state:
// {
//   clientSecret: string,
//   publishableKey: string,
//   appointmentDetails: object
// }

// Requires:
// - Stripe Elements wrapper
// - CardElement for card input
// - FormData for billing info

// Outputs on Success:
// - Navigate to /payment-success/:appointmentId
// - state: { paymentIntentId: string }
```

### PaymentSuccess.jsx
```javascript
// Props: None
// Uses:
// - appointmentId from URL
// - getPaymentByAppointment() API

// Displays:
// - Payment confirmation
// - Receipt details
// - Next steps
// - Action buttons

// Endpoints:
// - GET /api/payments/appointment/{appointmentId}
```

### PaymentFailed.jsx
```javascript
// Props: None
// Uses:
// - appointmentId from URL
// - No API calls needed

// Displays:
// - Error message
// - Troubleshooting steps
// - Support contact
// - Action buttons
```

### PaymentHistory.jsx
```javascript
// Props: None
// Fetches:
// - GET /api/payments/my-payments

// Displays:
// - Statistics dashboard
// - Transaction table
// - Filters & sort options
// - Receipt viewing

// Features:
// - Mock data fallback
// - Print functionality
// - Status filtering
```

---

## 🔌 API Contract

### Payment API Service (paymentApi.js)

```javascript
// Create Payment Intent
createPaymentIntent(appointmentId: string)
  Returns: { clientSecret, publishableKey, ... }
  
// Get My Payments
getMyPayments()
  Returns: Payment[]
  
// Get Payment by Appointment
getPaymentByAppointment(appointmentId: string)
  Returns: Payment
  
// Check Payment Status
checkPaymentStatus(appointmentId: string)
  Returns: PaymentStatus | null
```

### Data Types

```typescript
interface Payment {
  id: string;                    // PAY-001
  appointmentId: string;         // APT-001
  doctorName: string;            // Dr. Kumar
  amount: number;                // 1500.00
  currency: string;              // "lkr"
  status: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: ISO8601DateTime;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  failureReason?: string;
}

interface CreatePaymentIntentResponse {
  clientSecret: string;          // pi_...
  publishableKey: string;        // pk_test_...
  id: string;
  amount: number;
  currency: string;
  status: string;
}
```

---

## 🎨 Styling Reference

### Color Classes
```javascript
// Success States
bg-green-100, text-green-800, bg-green-600
bg-gradient-to-r from-green-600 to-emerald-600

// Error States
bg-red-50, border-red-200, bg-red-100
bg-gradient-to-r from-red-600 to-orange-600

// Warning States
bg-yellow-50, border-yellow-200, text-yellow-800

// Primary (Blue)
bg-blue-600, text-blue-600, bg-blue-50

// Neutral
bg-gray-50, bg-gray-200, text-gray-800
```

### Common Classes
```javascript
// Layouts
grid grid-cols-1 md:grid-cols-2 gap-4
flex flex-col items-center justify-between
flex-1 flex-shrink-0

// Rounded
rounded-lg, rounded-full

// Shadows
shadow, shadow-lg, shadow-2xl

// Animations
animate-bounce, animate-spin

// Responsive
p-4 md:p-6 lg:p-8
text-sm md:text-base lg:text-lg
```

---

## 🧪 Testing Scenarios

### Happy Path (Successful Payment)
```
1. Use card: 4242 4242 4242 4242
2. Any future expiry (e.g., 12/25)
3. Any CVC (e.g., 123)
4. Fill all billing fields
5. Click Pay
✓ Should see PaymentSuccess page
✓ Email should be sent
✓ DB status should be PAID
```

### 3D Secure Flow
```
1. Use card: 4000 0025 0000 3155
2. Complete all fields
3. Click Pay
✓ Should trigger 3D Secure challenge
✓ Complete verification
✓ Should see PaymentSuccess page
```

### Card Declined
```
1. Use card: 4000 0000 0000 0002
2. Complete all fields
3. Click Pay
✓ Should see error message
✓ Should show PaymentFailed page
✓ Option to retry or contact support
```

---

## 🔍 Debugging Tips

### Check JWT Token
```javascript
// In browser console
localStorage.getItem('jwt_token')
localStorage.getItem('user_email')
localStorage.getItem('user_role')
```

### Verify Stripe Key Loaded
```javascript
// In browser console
window.Stripe  // Should be available

// Or check
typeof __stripe_
```

### Monitor API Calls
```javascript
// In DevTools Network tab
// Look for:
POST http://localhost:8080/api/payments/intent
GET http://localhost:8080/api/payments/my-payments
GET http://localhost:8080/api/payments/appointment/{id}
```

### Check Stripe Events
```javascript
// In Stripe Dashboard
// Go to Events section
// Look for payment_intent events
// Check webhook delivery logs
```

---

## 📋 State Management Overview

### PaymentInitiation
```javascript
const [appointmentDetails, setAppointmentDetails] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [paymentStatus, setPaymentStatus] = useState(null)
const [initiating, setInitiating] = useState(false)
```

### PaymentCheckout
```javascript
const [clientSecret, setClientSecret] = useState(null)
const [publishableKey, setPublishableKey] = useState(null)
const [appointmentDetails, setAppointmentDetails] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

// Form State
const [formData, setFormData] = useState({
  email: '',
  name: '',
  billingAddress: '',
  billingCity: '',
  billingZip: ''
})
const [processing, setProcessing] = useState(false)
const [cardError, setCardError] = useState('')
```

### PaymentHistory
```javascript
const [payments, setPayments] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [filter, setFilter] = useState('all')  // all, paid, pending, failed
const [sortBy, setSortBy] = useState('date')  // date, amount
```

---

## 🚀 Performance Optimizations

```javascript
// 1. Lazy Load Stripe
const stripePromise = loadStripe(publishableKey)

// 2. Memoize Callback Functions
const handlePayment = useCallback(() => { ... }, [appointmentId])

// 3. Conditional Rendering
{clientSecret && publishableKey && <Form ... />}

// 4. Debounce Form Changes
const debouncedChange = useCallback(
  debounce((value) => setFormData(value), 300),
  []
)

// 5. Use Fragments to Avoid Extra DOM Nodes
<>
  <Header />
  <Content />
  <Footer />
</>
```

---

## 📚 File Checklist

Essential files created:
```
✓ src/pages/PaymentInitiation.jsx
✓ src/pages/PaymentCheckout.jsx
✓ src/pages/PaymentSuccess.jsx
✓ src/pages/PaymentFailed.jsx
✓ src/pages/PaymentHistory.jsx
✓ src/api/paymentApi.js
✓ src/App.jsx (updated)
✓ PAYMENT_GATEWAY_DOCS.md
✓ PAYMENT_SETUP.md
✓ PAYMENT_DEV_REFERENCE.md (this file)
```

To integrate:
```
1. Add Stripe key to .env.local
2. Verify backend endpoints running
3. Test with test cards
4. Deploy to production with live keys
```

---

## 🎓 Learning Resources

### Understanding Payment Flows
- [Stripe Payments Overview](https://stripe.com/docs/payments)
- [Payment Intent Flow](https://stripe.com/docs/payments/payment-intents)
- [3D Secure Overview](https://stripe.com/docs/payments/3d-secure)

### React + Stripe Integration
- [React Stripe.js Guide](https://stripe.com/docs/stripe-js/react)
- [CardElement Documentation](https://stripe.com/docs/stripe-js/elements/card-element)
- [confirmCardPayment Reference](https://stripe.com/docs/js/payment_intents/confirm_card_payment)

### Security Best Practices
- [PCI Compliance](https://stripe.com/docs/security#pci-compliance)
- [Card Data Security](https://stripe.com/docs/security)
- [Webhook Signature Verification](https://stripe.com/docs/webhooks/signatures)

---

**Last Updated:** April 16, 2026
**Version:** 1.0.0
**Status:** Production Ready
