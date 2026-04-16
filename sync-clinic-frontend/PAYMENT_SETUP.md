# Payment Gateway Setup Guide

This guide walks through setting up the SyncClinic Payment Gateway frontend with Stripe integration.

## 🚀 Quick Start

### 1. Create Environment File

Create `.env.local` in the frontend root directory:

```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080
```

### 2. Get Your Stripe Keys

1. Sign up at [https://stripe.com](https://stripe.com)
2. Log in to your Stripe Dashboard
3. Navigate to **Developers** → **API Keys**
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
5. Keep your **Secret Key** safe (only for backend)

### 3. Install Dependencies

All dependencies are already in `package.json`. Just run:

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔑 Stripe Keys Explained

### Publishable Key (Frontend)
- **Safe to expose** in frontend code
- Used for creating Stripe Elements
- Identifies your Stripe account
- Test Key: `pk_test_...`
- Live Key: `pk_live_...`

### Secret Key (Backend Only)
- **NEVER expose** in frontend code
- Used for server-side operations
- Full control over Stripe account
- Keep in backend `.env` file
- Test Key: `sk_test_...`
- Live Key: `sk_live_...`

---

## 🧪 Testing with Stripe

### Test Mode Setup

1. Ensure you're using **Test Keys** (start with `pk_test_`)
2. Use test card numbers below
3. No real charges will be made

### Test Card Numbers

```
✅ SUCCESSFUL PAYMENTS
4242 4242 4242 4242  (Visa)
5555 5555 5555 4444  (Mastercard)
3782 822463 10005    (American Express)

⚠️ REQUIRES 3D SECURE
4000 0025 0000 3155
4000 0025 0000 3163

❌ CARD DECLINED
4000 0000 0000 0002
4000 0000 0000 0069
5555 5555 5555 5557

🔒 LOST CARD
3530 1113 3330 0000

💳 EXPIRED CARD
2000 0000 0000 0000
```

### Test Expiry & CVC
```
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
```

---

## 🔗 Backend Integration

### Required Backend Endpoints

The frontend expects these endpoints to be available:

#### 1. Create Payment Intent
```
POST /api/payments/intent
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "appointmentId": "APT-001"
}

Response (200 OK):
{
  "clientSecret": "pi_1234567890_secret_abcdef",
  "publishableKey": "pk_test_...",
  "id": "PAY-001",
  "amount": 1500.00,
  "currency": "lkr",
  "status": "PENDING"
}
```

#### 2. Get My Payments
```
GET /api/payments/my-payments
Authorization: Bearer {jwt_token}

Response (200 OK):
[
  {
    "id": "PAY-001",
    "appointmentId": "APT-001",
    "doctorName": "Dr. Kumar",
    "amount": 1500.00,
    "currency": "lkr",
    "status": "PAID",
    "createdAt": "2026-04-16T10:30:00Z"
  }
]
```

#### 3. Get Payment by Appointment
```
GET /api/payments/appointment/{appointmentId}
Authorization: Bearer {jwt_token}

Response (200 OK):
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

### CORS Configuration (Backend)

Add to your Spring Boot `application.yml` or `application.properties`:

```yaml
# application.yml
spring:
  mvc:
    cors:
      allowed-origins: http://localhost:5173, https://yourdomain.com
      allowed-methods: GET, POST, PUT, DELETE, OPTIONS
      allowed-headers: '*'
      allow-credentials: true
```

Or in Java Configuration:

```java
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "https://yourdomain.com")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
        }
    };
}
```

---

## 🔐 Security Checklist

- [ ] Stripe Publishable Key is in `.env.local` (frontend safe)
- [ ] Stripe Secret Key is in backend `.env` only
- [ ] JWT token is properly validated on backend
- [ ] CORS whitelist includes your frontend URL
- [ ] API Gateway adds `Authorization` header to requests
- [ ] HTTPS enforced in production
- [ ] Rate limiting enabled on payment endpoints
- [ ] Webhook signature verified on backend
- [ ] PCI compliance verified

---

## 📋 File Structure

```
sync-clinic-frontend/
├── .env.local                          # ← Create this file with keys
├── src/
│   ├── pages/
│   │   ├── PaymentInitiation.jsx
│   │   ├── PaymentCheckout.jsx
│   │   ├── PaymentSuccess.jsx
│   │   ├── PaymentFailed.jsx
│   │   └── PaymentHistory.jsx
│   ├── api/
│   │   ├── axiosConfig.js              # JWT interceptor
│   │   └── paymentApi.js               # Payment endpoints
│   └── App.jsx                         # Updated with payment routes
├── package.json
└── PAYMENT_GATEWAY_DOCS.md
```

---

## 🧬 Component Integration

### Adding to Patient Dashboard

Update `src/pages/PatientDashboard.jsx`:

```javascript
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const navigate = useNavigate();

  const handlePayment = (appointmentId) => {
    navigate(`/payment-initiation/${appointmentId}`);
  };

  return (
    <div>
      {/* ... existing code ... */}
      
      {/* Add payment button to appointments */}
      <button
        onClick={() => handlePayment(appointment.id)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        💳 Make Payment
      </button>
    </div>
  );
}
```

---

## 🚨 Common Issues & Solutions

### Issue: "Stripe not loaded"
```
Error: Cannot find Stripe.js
```

**Solution:**
1. Check `.env.local` has `REACT_APP_STRIPE_PUBLISHABLE_KEY`
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Issue: CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Check backend CORS configuration
2. Verify frontend URL in allowed origins
3. Ensure `Access-Control-Allow-Credentials: true`

### Issue: JWT Token Not Sent
```
Unauthorized: 401 (Missing JWT)
```

**Solution:**
1. Check `localStorage.getItem('jwt_token')`
2. Verify token in DevTools → Application → localStorage
3. Check axios interceptor in `axiosConfig.js`

### Issue: Card Element Not Rendering
```
Error: Cannot find CardElement
```

**Solution:**
1. Ensure `<Elements stripe={stripePromise}>` wrapper
2. Check Stripe public key is correct
3. Verify browser console for errors

---

## 🌐 Production Deployment

### 1. Get Live Stripe Keys

1. Complete Stripe account verification
2. Switch from "Test Mode" to "Live Mode" in Stripe Dashboard
3. Copy **Live Publishable Key** (starts with `pk_live_`)

### 2. Update Environment

Create `.env.production`:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
REACT_APP_API_BASE_URL=https://api.syncclinic.com
```

### 3. Build for Production

```bash
npm run build
```

### 4. Deploy

```bash
# Option 1: Deploy to Netlify
netlify deploy --prod --dir=dist

# Option 2: Deploy to Vercel
vercel --prod

# Option 3: Docker
docker build -t syncclinic-frontend .
docker run -p 80:3000 syncclinic-frontend
```

### 5. Update Backend CORS

Add production URL to backend allowed origins:

```yaml
# production deployment
spring:
  mvc:
    cors:
      allowed-origins: https://syncclinic.com, https://www.syncclinic.com
```

### 6. Enable SSL/TLS

Ensure all payment pages are served over HTTPS:

```nginx
# nginx config
server {
    listen 443 ssl http2;
    server_name syncclinic.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Force HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

---

## 📊 Monitoring & Debugging

### View Stripe Events

1. Go to Stripe Dashboard
2. Click **Events** in sidebar
3. Look for `payment_intent.succeeded` events
4. Check webhook delivery logs

### Enable Browser DevTools

```javascript
// Add to PaymentCheckout.jsx for debugging
console.log('Stripe Promise:', stripePromise);
console.log('Client Secret:', clientSecret);
console.log('Public Key:', publishableKey);
```

### Check Backend Logs

```bash
# View Spring Boot logs
tail -f logs/spring-boot.log | grep payment
```

---

## 📞 Support & Resources

### Stripe Documentation
- [Stripe API Docs](https://stripe.com/docs/api)
- [React Stripe Documentation](https://stripe.com/docs/stripe-js/react)
- [Payment Element Guide](https://stripe.com/docs/payments/payment-element)

### SyncClinic Resources
- [Backend Payment Service Docs](../payment-service/PAYMENT_SERVICE_OVERVIEW.md)
- [API Gateway Configuration](../api-gateway/README.md)
- [Main Project README](../README.md)

### Troubleshooting
- [Stripe Common Errors](https://stripe.com/docs/error-codes)
- [React Stripe GitHub Issues](https://github.com/stripe/react-stripe-js/issues)

---

## ✅ Final Checklist

- [ ] `.env.local` created with Stripe key
- [ ] Backend endpoints are accessible
- [ ] CORS configured on backend
- [ ] JWT token properly handled
- [ ] Test payment with test cards works
- [ ] Payment history displays correctly
- [ ] Error handling tested (failed cards)
- [ ] 3D Secure flow tested
- [ ] Mobile responsive tested
- [ ] Production keys configured
- [ ] SSL/TLS enabled in production
- [ ] Error logging/monitoring setup

---

**Last Updated:** April 16, 2026
**Version:** 1.0.0
