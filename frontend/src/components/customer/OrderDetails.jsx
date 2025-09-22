import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useOutletContext,  useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../path';
import { HiOutlineHome, HiOutlineCreditCard, HiArrowLeft,} from 'react-icons/hi';
import OrderStatusTracker from './OrderTracker';


const OrderDetails = () => {
    const { orderGroupId } = useParams();
    const { user, isAuthLoading } = useOutletContext();
    const navigate = useNavigate();
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }
        if (user && user.id && orderGroupId) {
            const fetchOrderDetails = async () => {
                try {
                    const res = await axios.post(`${BASE_URL}/getOrder`, { userid: user.id, orderGroupId });
                    setOrderItems(res.data.order || []);
                } catch (err) {
                    console.error("Failed to fetch order details:", err);
                    setError("Could not load your order details.");
                } finally {
                    setLoading(false);
                }
            };
            fetchOrderDetails();
        } else {
            setLoading(false);
        }
    }, [user, orderGroupId]);

    const sharedOrderInfo = useMemo(() => {
        if (orderItems.length === 0) return null;
        
        const firstItem = orderItems[0];
        const subtotal = orderItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
        const shipping = subtotal > 5000 ? 0 : 99;
        const grandTotal = subtotal + shipping;
        
        return {
            shippingAddress: firstItem.address,
            orderGroupId: firstItem.order_group_id,
            createdAt: firstItem.created_at,
            subtotal,
            shipping,
            grandTotal,
        };
    }, [orderItems]);


    if (loading) {
        return <div className="text-center p-10">Loading order details...</div>;
    }
    if (error) {
        return <div className="text-center p-10 text-red-600">{error}</div>;
    }
    if (!sharedOrderInfo) {
        return <div className="text-center p-10">Order not found.</div>;
    }

    return (
       <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">

  <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-md">
    <div className="mb-8">
      <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2" onClick={()=>{navigate("/orders")}}><HiArrowLeft /> Back to All Orders</button>
      
      <p className="text-sm text-gray-500">Order Details</p>
      <h1 className="text-3xl font-bold text-gray-900">{sharedOrderInfo.orderGroupId}</h1>
      <p className="text-gray-600">
        Placed on {new Date(sharedOrderInfo.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Items in this Order</h2>
        {orderItems.map(item => (
          <div key={item.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition">
            <div className="p-4 flex flex-col sm:flex-row gap-4">
              <img 
                src={item.image || item.imageurl} 
                alt={item.pname} 
                className="w-24 h-24 rounded-md border object-cover" 
              />
              <div className="flex-grow mt-2">
                <p className="font-semibold text-gray-900">{item.pname}</p>
                <p className="text-sm text-gray-500">Sold by: {item.store_name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right mt-2">
                <p className="text-gray-800">₹{item.price}</p>
                <p className="text-sm text-gray-500">x {item.quantity}</p>
                <p className="font-semibold text-green-600">
                  Total: ₹{item.quantity * item.price}
                </p>
              </div>
            </div>
            <OrderStatusTracker status={item.status}/>
          </div>
        ))}
      </div>

      {/* Address + Payment */}
      <div className="space-y-8">
        <div className="bg-indigo-50 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-indigo-700">
            <HiOutlineHome /> Shipping Address
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-bold">{sharedOrderInfo.shippingAddress.name}</p>
            <p>{sharedOrderInfo.shippingAddress.local_address}, {sharedOrderInfo.shippingAddress.city}</p>
            <p>{sharedOrderInfo.shippingAddress.state} - {sharedOrderInfo.shippingAddress.pincode}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-800">
            <HiOutlineCreditCard /> Payment Summary
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">Subtotal: <span>₹{sharedOrderInfo.subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between">Shipping: <span className="text-indigo-600 font-medium">{sharedOrderInfo.shipping === 0? 'FREE' : `₹${sharedOrderInfo.shipping}`}</span></div>
            <hr className="my-2"/>
            <div className="flex justify-between font-bold text-base text-gray-900">
              <p>Total Amount:</p> 
              <p className="text-green-600">₹{sharedOrderInfo.grandTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    );
};

export default OrderDetails;