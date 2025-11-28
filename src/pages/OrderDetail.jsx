import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(id);
      setOrder(response.data);
    } catch (error) {
      showNotification('Failed to fetch order', 'error');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await orderAPI.updateStatus(id, { status: newStatus });
      showNotification('Order status updated successfully', 'success');
      fetchOrder();
    } catch (error) {
      showNotification('Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus) => {
    setUpdating(true);
    try {
      await orderAPI.updateStatus(id, { paymentStatus: newPaymentStatus });
      showNotification('Payment status updated successfully', 'success');
      fetchOrder();
    } catch (error) {
      showNotification('Failed to update payment status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="text-gray-400 hover:text-white transition"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Details</h1>
          <p className="text-gray-400">Order #{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-user text-[#D2C1B6]"></i>
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">
                  <i className="fas fa-user-circle mr-2"></i>Name
                </p>
                <p className="text-white font-medium">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">
                  <i className="fas fa-envelope mr-2"></i>Email
                </p>
                <p className="text-white font-medium break-all">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">
                  <i className="fas fa-phone mr-2"></i>Phone
                </p>
                <p className="text-white font-medium">{order.customer.phone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-[#D2C1B6]"></i>
              Delivery Address
            </h2>
            <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <i className="fas fa-home text-gray-400 mt-1"></i>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">Street Address</p>
                  <p className="text-white font-medium leading-relaxed">{order.customer.address}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-600">
                <div className="flex items-start gap-3">
                  <i className="fas fa-city text-gray-400 mt-1"></i>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">City</p>
                    <p className="text-white font-medium">{order.customer.city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-map text-gray-400 mt-1"></i>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Province</p>
                    <p className="text-white font-medium">{order.customer.province}</p>
                  </div>
                </div>
              </div>

              {order.customer.postalCode && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-600">
                  <i className="fas fa-mail-bulk text-gray-400 mt-1"></i>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Postal Code</p>
                    <p className="text-white font-medium">{order.customer.postalCode}</p>
                  </div>
                </div>
              )}

              {order.customer.deliveryNotes && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-600">
                  <i className="fas fa-sticky-note text-yellow-400 mt-1"></i>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-1">Delivery Notes</p>
                    <p className="text-white font-medium leading-relaxed bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      {order.customer.deliveryNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium mb-2">{item.name}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Quantity:</span>
                        <span className="text-white font-medium">{item.quantity}</span>
                      </div>
                      {item.size && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Size:</span>
                          <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-medium">
                            {item.size}
                          </span>
                        </div>
                      )}
                      {item.color && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Color:</span>
                          <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-medium">
                            {item.color}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      <span>Unit Price: Rs {item.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#D2C1B6] font-bold text-lg">
                      Rs {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">Total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Update Status</h2>
            <div className="space-y-2">
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updating || order.status === status}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition capitalize ${
                    order.status === status
                      ? 'bg-[#D2C1B6] text-gray-900'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>Rs {order.pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Delivery</span>
                <span>
                  {order.pricing.deliveryCharge === 0
                    ? 'FREE'
                    : `Rs ${order.pricing.deliveryCharge.toLocaleString()}`}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span className="text-[#D2C1B6]">Rs {order.pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Update */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Payment Status</h2>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-600/20 text-green-400'
                    : order.paymentStatus === 'failed'
                    ? 'bg-red-600/20 text-red-400'
                    : 'bg-yellow-600/20 text-yellow-400'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {['pending', 'paid', 'failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handlePaymentStatusUpdate(status)}
                  disabled={updating || order.paymentStatus === status}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition capitalize ${
                    order.paymentStatus === status
                      ? 'bg-[#D2C1B6] text-gray-900'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {status}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-3 text-center">
              <i className="fas fa-info-circle mr-1"></i>
              Update payment status for COD orders
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Order Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm mb-1">Order Date</p>
                <p className="text-white font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Payment Method</p>
                <p className="text-white font-medium">Cash on Delivery (COD)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
