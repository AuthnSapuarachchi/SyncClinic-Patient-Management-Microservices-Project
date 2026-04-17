import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createPaymentIntent } from '../api/paymentApi';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890');

/**
 * Stripe Checkout Form Component
 * Handles card input and payment confirmation
 */
function StripeCheckoutForm({ clientSecret, appointmentDetails, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');
  const [formData, setFormData] = useState({
    email: localStorage.getItem('user_email') || '',
    name: '',
    billingAddress: '',
    billingCity: '',
    billingZip: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (event) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setCardError('Stripe not loaded. Please try again.');
      return;
    }

    setProcessing(true);
    setCardError('');

    try {
      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            address: {
              line1: formData.billingAddress,
              city: formData.billingCity,
              postal_code: formData.billingZip,
              country: 'LK'
            }
          }
        }
      });

      if (result.error) {
        setCardError(result.error.message);
        setProcessing(false);
        onError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess(result.paymentIntent);
      } else if (result.paymentIntent.status === 'requires_action') {
        setCardError('Additional verification required. Please complete the 3D Secure challenge.');
        setProcessing(false);
      }
    } catch (error) {
      setCardError('Payment processing failed. Please try again.');
      setProcessing(false);
      onError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address *</label>
            <input
              type="text"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              placeholder="123 Main Street"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="billingCity"
                value={formData.billingCity}
                onChange={handleChange}
                placeholder="Colombo"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
              <input
                type="text"
                name="billingZip"
                value={formData.billingZip}
                onChange={handleChange}
                placeholder="06000"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Information */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Card Details</h3>
        <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#333',
                  '::placeholder': { color: '#aaa' }
                },
                invalid: { color: '#dc2626' }
              }
            }}
            onChange={handleCardChange}
          />
        </div>

        {cardError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start mb-4">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-red-800">Card Error</p>
              <p className="text-red-700 text-sm">{cardError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Doctor Consultation</span>
            <span className="font-semibold text-gray-800">LKR {appointmentDetails?.consultationFee?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-semibold text-gray-800">LKR 0.00</span>
          </div>
          <div className="border-t border-gray-300 pt-3 flex justify-between">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-lg font-bold text-blue-600">LKR {appointmentDetails?.consultationFee?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || processing || !formData.name || !formData.billingAddress || !formData.billingCity || !formData.billingZip}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {processing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pay LKR {appointmentDetails?.consultationFee?.toFixed(2) || '0.00'}
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="flex justify-center gap-8 text-center">
        <div className="flex flex-col items-center">
          <svg className="w-6 h-6 text-green-600 mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-gray-600">Secure</p>
        </div>
        <div className="flex flex-col items-center">
          <svg className="w-6 h-6 text-blue-600 mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <p className="text-xs text-gray-600">Stripe</p>
        </div>
        <div className="flex flex-col items-center">
          <svg className="w-6 h-6 text-orange-600 mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-gray-600">3D Secure</p>
        </div>
      </div>
    </form>
  );
}

/**
 * PaymentCheckout Page
 * Main payment processing page with Stripe integration
 */
export default function PaymentCheckout() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientSecret, setClientSecret] = useState(null);
  const [publishableKey, setPublishableKey] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const state = location.state;
    
    if (state?.clientSecret && state?.publishableKey) {
      setClientSecret(state.clientSecret);
      setPublishableKey(state.publishableKey);
      setAppointmentDetails(state.appointmentDetails);
      setLoading(false);
    } else {
      // If no state, redirect back to initiation
      navigate(`/payment-initiation/${appointmentId}`);
    }
  }, [location, appointmentId, navigate]);

  const handlePaymentSuccess = (paymentIntent) => {
    // Navigate to success page
    navigate(`/payment-success/${appointmentId}`, {
      state: { paymentIntentId: paymentIntent.id }
    });
  };

  const handlePaymentError = (errorMsg) => {
    setError(errorMsg);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Preparing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/payment-initiation/${appointmentId}`)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Review
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Enter your payment details securely</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Payment Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stripe Elements Form */}
        {clientSecret && publishableKey && (
          <Elements stripe={loadStripe(publishableKey)}>
            <StripeCheckoutForm
              clientSecret={clientSecret}
              appointmentDetails={appointmentDetails}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
        )}

        {/* Payment Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Payment Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Your payment information is encrypted and secure</li>
                <li>✓ We use Stripe for safe payment processing</li>
                <li>✓ You will receive a confirmation email immediately after payment</li>
                <li>✓ No charges will appear until payment is confirmed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
