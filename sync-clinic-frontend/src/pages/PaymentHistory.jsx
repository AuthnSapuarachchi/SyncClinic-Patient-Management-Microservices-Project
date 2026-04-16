import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPayments } from '../api/paymentApi';

/**
 * PaymentHistory Page
 * Shows patient's payment records and transaction history
 */
export default function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, paid, pending, failed
  const [sortBy, setSortBy] = useState('date'); // date, amount

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getMyPayments();
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        // Mock data for demo
        setPayments([
          {
            id: 'PAY-001',
            appointmentId: 'APT-001',
            doctorName: 'Dr. Rajesh Kumar',
            amount: 1500.00,
            currency: 'lkr',
            status: 'PAID',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'PAY-002',
            appointmentId: 'APT-002',
            doctorName: 'Dr. Priya Sharma',
            amount: 2000.00,
            currency: 'lkr',
            status: 'PAID',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'PAY-003',
            appointmentId: 'APT-003',
            doctorName: 'Dr. Amit Patel',
            amount: 1500.00,
            currency: 'lkr',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 'PAY-004',
            appointmentId: 'APT-004',
            doctorName: 'Dr. Nisha Gupta',
            amount: 1800.00,
            currency: 'lkr',
            status: 'FAILED',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status.toLowerCase() === filter;
  });

  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'amount') {
      return b.amount - a.amount;
    }
    return 0;
  });

  // Calculate statistics
  const stats = {
    totalPaid: payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.length,
    pendingPayments: payments.filter(p => p.status === 'PENDING').length,
    failedPayments: payments.filter(p => p.status === 'FAILED').length
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' };
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' };
      case 'FAILED':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '?' };
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
          <p className="text-center mt-4 text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto mt-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Payment History</h1>
            <p className="text-gray-600 mt-2">View and manage your payment records</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">LKR {stats.totalPaid.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Failed Payments</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedPayments}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Status</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
                  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
                  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' }
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filter === f.value
                        ? f.color || 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Most Recent</option>
                <option value="amount">Highest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            <div>
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Payments Table */}
        {sortedPayments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payments Found</h3>
            <p className="text-gray-600">You haven't made any payments yet. Start by booking an appointment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Appointment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPayments.map((payment, idx) => {
                    const statusColor = getStatusColor(payment.status);
                    return (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-800 font-medium">
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-800">{payment.doctorName}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-mono text-gray-600">{payment.appointmentId}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-gray-800">
                            {payment.currency?.toUpperCase()} {payment.amount?.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
                            {statusColor.icon} {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => alert('Receipt download feature - integrate with backend')}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate('/patientDashboard')}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Statement
          </button>
        </div>
      </div>
    </div>
  );
}
