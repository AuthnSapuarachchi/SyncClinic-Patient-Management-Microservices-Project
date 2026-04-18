import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPaymentIntent, checkPaymentStatus } from '../api/paymentApi';

/**
 * PaymentInitiation Page
 * Shows appointment details and initiates payment flow
 */
export default function PaymentInitiation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch appointment details from backend
    // For now, we'll use mock data or get it from props/context
    const mockAppointmentDetails = {
      appointmentId: appointmentId || 'APT-001',
      doctorName: 'Dr. Rajesh Kumar',
      doctorSpecialty: 'General Physician',
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      consultationFee: 1500.00,
      description: 'General consultation',
      status: 'COMPLETED'
    };

    setAppointmentDetails(mockAppointmentDetails);
    
    // Check if payment already exists
    checkPaymentStatus(appointmentId).then(status => {
      setPaymentStatus(status);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [appointmentId]);

  const handleInitiatePayment = async () => {
    setInitiating(true);
    setError('');

    try {
      const result = await createPaymentIntent(appointmentId);
      
      // Navigate to checkout with the payment details
      navigate(`/payment-checkout/${appointmentId}`, {
        state: {
          clientSecret: result.clientSecret,
          publishableKey: result.publishableKey,
          appointmentDetails
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
      setInitiating(false);
    }
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
          <p className="text-center mt-4 text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus?.status === 'PAID') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Already Complete</h2>
            <p className="text-gray-600 mb-6">This appointment has already been paid for.</p>
            <button
              onClick={() => navigate('/patientDashboard')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
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
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Payment for Appointment</h1>
          <p className="text-gray-600 mt-2">Review your appointment details and proceed to payment</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Appointment Card */}
        {appointmentDetails && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Dr. {appointmentDetails.doctorName}</h2>
                <p className="text-gray-600">{appointmentDetails.doctorSpecialty}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Appointment Date & Time</label>
                  <p className="text-gray-800 font-semibold">{appointmentDetails.appointmentDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Status</label>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {appointmentDetails.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                <p className="text-gray-700">{appointmentDetails.description}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Consultation Fee</span>
                <span className="text-gray-800 font-semibold">LKR {appointmentDetails.consultationFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Tax (0%)</span>
                <span className="text-gray-800 font-semibold">LKR 0.00</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">LKR {appointmentDetails.consultationFee.toFixed(2)}</span>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">📌 Note:</span> By proceeding, you authorize SyncClinic to charge your payment method for the above amount. Payment processing is secure and encrypted.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleInitiatePayment}
            disabled={initiating}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {initiating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Proceed to Payment
              </>
            )}
          </button>
        </div>

        {/* Security Badges */}
        <div className="flex justify-center gap-8 mt-8 text-center">
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600">Secure Payment</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-gray-600">SSL Encrypted</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600">PCI Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
