import api from './axiosConfig';

/**
 * Payment API Service
 * Handles all payment-related API calls to the backend
 */

/**
 * Create a payment intent for an appointment
 * @param {string} appointmentId - The appointment ID to create payment for
 * @returns {Promise} Response with clientSecret and publishableKey
 */
export const createPaymentIntent = async (appointmentId) => {
  try {
    const response = await api.post('/api/payments/intent', {
      appointmentId
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to create payment intent. Please try again.'
    );
  }
};

/**
 * Get payment history for the current patient
 * @returns {Promise} Array of payment records
 */
export const getMyPayments = async () => {
  try {
    const response = await api.get('/api/payments/my-payments');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to fetch payment history'
    );
  }
};

/**
 * Get payment by appointment ID
 * @param {string} appointmentId - The appointment ID
 * @returns {Promise} Payment record
 */
export const getPaymentByAppointment = async (appointmentId) => {
  try {
    const response = await api.get(`/api/payments/appointment/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to fetch payment details'
    );
  }
};

/**
 * Check if payment already exists for an appointment
 * @param {string} appointmentId - The appointment ID
 * @returns {Promise} Boolean or payment status
 */
export const checkPaymentStatus = async (appointmentId) => {
  try {
    const response = await api.get(`/api/payments/status/${appointmentId}`);
    return response.data;
  } catch (error) {
    // Payment might not exist yet, which is okay
    return null;
  }
};

export default {
  createPaymentIntent,
  getMyPayments,
  getPaymentByAppointment,
  checkPaymentStatus
};
