import { useNavigate, useParams } from 'react-router-dom';

/**
 * PaymentFailed Page
 * Displays error when payment fails
 */
export default function PaymentFailed() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const failureReasons = [
    'Card was declined by your bank',
    'Insufficient funds on your card',
    'Incorrect card details provided',
    'Card has expired',
    'Transaction blocked for security reasons',
    'Payment gateway timeout'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        {/* Error Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header with Red Background */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
            <p className="text-red-100">Your payment could not be processed</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Error Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Transaction Unsuccessful</h3>
                  <p className="text-red-800 text-sm">
                    We were unable to process your payment. Please review the details below and try again with a different payment method or card.
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Transaction Details</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Appointment ID</span>
                    <span className="font-mono text-gray-800 font-semibold">{appointmentId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Amount</span>
                    <span className="text-gray-800 font-semibold">LKR 1,500.00</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Timestamp</span>
                    <span className="text-gray-800 font-semibold">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className="inline-block bg-red-100 text-red-800 px-4 py-1 rounded-full text-sm font-semibold">
                      ✗ FAILED
                    </span>
                  </div>
                </div>
              </div>

              {/* Possible Reasons */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Why Did This Happen?</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-4 font-semibold">The payment failed for one of these reasons:</p>
                  <ul className="space-y-2">
                    {failureReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-yellow-600 mr-3">•</span>
                        <span className="text-gray-700">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* What to Do Next */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">What Can You Do?</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0 text-sm">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Verify Card Details</h4>
                      <p className="text-gray-600 text-sm">Ensure your card number, expiry date, and CVV are correct</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0 text-sm">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Check Card Balance</h4>
                      <p className="text-gray-600 text-sm">Ensure you have sufficient funds available on your card</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0 text-sm">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Contact Your Bank</h4>
                      <p className="text-gray-600 text-sm">Verify there are no fraud blocks or transaction limits preventing the payment</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0 text-sm">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Try a Different Card</h4>
                      <p className="text-gray-600 text-sm">Attempt payment with an alternative payment method</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0 text-sm">5</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Contact Support</h4>
                      <p className="text-gray-600 text-sm">Reach out to SyncClinic support if the issue persists</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Contact */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-900">Need Help?</h4>
                      <p className="text-blue-800 text-sm">Our support team is available 24/7 to assist you</p>
                      <p className="text-blue-800 text-sm font-semibold mt-1">📞 +94 11 234 5678 | 📧 support@syncclinic.lk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => navigate(`/payment-initiation/${appointmentId}`)}
                className="bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <button
                onClick={() => navigate('/patientDashboard')}
                className="bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Tips to Ensure Payment Success</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="text-2xl mr-3">🔒</div>
              <div>
                <p className="font-semibold text-gray-800">Use a Recent Card</p>
                <p className="text-sm text-gray-600">Older cards may have additional verification requirements</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🌐</div>
              <div>
                <p className="font-semibold text-gray-800">Stable Connection</p>
                <p className="text-sm text-gray-600">Ensure a strong, stable internet connection</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <p className="font-semibold text-gray-800">Correct Information</p>
                <p className="text-sm text-gray-600">Double-check all billing address details</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">⏱️</div>
              <div>
                <p className="font-semibold text-gray-800">Wait & Retry</p>
                <p className="text-sm text-gray-600">Sometimes a temporary issue - wait a few minutes and try again</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
