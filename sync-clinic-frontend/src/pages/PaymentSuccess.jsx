import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPaymentByAppointment } from '../api/paymentApi';

/**
 * PaymentSuccess Page
 * Displays success confirmation after successful payment
 */
export default function PaymentSuccess() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch payment details to display
    const fetchPaymentDetails = async () => {
      try {
        const paymentData = await getPaymentByAppointment(appointmentId);
        setPayment(paymentData);
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header with Green Background */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100">Your payment has been processed and confirmed</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Confirmation Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Thank you for your payment!</h3>
                  <p className="text-green-800 text-sm">
                    Your payment has been successfully processed. A confirmation email with receipt details has been sent to your email address.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  {payment ? (
                    <>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Payment ID</span>
                        <span className="font-mono text-gray-800 font-semibold">{payment.id?.slice(0, 12)}...</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Appointment ID</span>
                        <span className="font-mono text-gray-800 font-semibold">{payment.appointmentId}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Doctor</span>
                        <span className="text-gray-800 font-semibold">{payment.doctorName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Amount</span>
                        <span className="text-2xl font-bold text-green-600">LKR {payment.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Currency</span>
                        <span className="text-gray-800 font-semibold">{payment.currency?.toUpperCase() || 'LKR'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status</span>
                        <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold">
                          ✓ PAID
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 text-center py-4">Loading payment details...</p>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">What's Next?</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Confirmation Email</h4>
                      <p className="text-gray-600 text-sm">Check your email for payment receipt and appointment details</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Appointment Confirmation</h4>
                      <p className="text-gray-600 text-sm">Your appointment with the doctor is now confirmed</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Join Consultation</h4>
                      <p className="text-gray-600 text-sm">At your scheduled time, join the telemedicine consultation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Download Invoice</h4>
                      <p className="text-gray-600 text-sm">Access your invoice anytime from your payment history</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Receipt */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-900">Receipt Available</h4>
                      <p className="text-blue-800 text-sm">Your payment receipt has been generated</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Receipt download feature - integrate with backend')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => navigate('/payment-history')}
                className="bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Payment History
              </button>
              <button
                onClick={() => navigate('/patientDashboard')}
                className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-12 mt-12 text-center">
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-gray-700">Secure & Encrypted</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <p className="text-sm font-semibold text-gray-700">Powered by Stripe</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-semibold text-gray-700">Email Confirmation Sent</p>
          </div>
        </div>
      </div>
    </div>
  );
}
