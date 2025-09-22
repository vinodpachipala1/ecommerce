import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineClipboardList, HiCheckCircle, HiOutlineCube, HiOutlineHome, HiArrowRight} from "react-icons/hi";
import { BASE_URL } from "../path"; 

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cartItems, grandTotal, orderId, shippingAddress } = location.state || {};

  const handleContinue = () => {
    navigate("/");
  };

  const handleViewOrder = () => {
    navigate(`/order/${orderId}`);
  };
  
  const getImageUrl = (item) => {
    if (item.imageurl) return item.imageurl;
    if (item.id || item.product_id) return `${BASE_URL}/product/image/${item.id || item.product_id}`;
    return 'https://via.placeholder.com/150';
  };


  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-8">
        
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center mx-auto w-20 h-20 bg-green-100 rounded-full">
            <HiCheckCircle className="text-green-600 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Thank you for your order!</h1>
          <p className="text-slate-500">
            Your order has been placed Successfully. </p>
          <div className="inline-block bg-slate-100 rounded-lg px-4 py-2 text-slate-700">
            Order ID: <span className="font-bold text-slate-900">{orderId}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
            <HiOutlineCube />
            Order Summary
          </h2>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {cartItems?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <img 
                  src={item.imageurl || item.image} 
                  alt={item.pname} 
                  className="w-16 h-16 rounded-lg object-cover border"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-slate-800">{item.pname}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
                <div className="">
                  <p className="font-medium text-slate-800 text-right">₹{(item.price).toLocaleString('en-IN')}</p>
                  <p className="font-medium text-slate-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
                
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between items-center font-bold text-lg text-slate-900">
            <p>Grand Total</p>
            <p>₹{grandTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {shippingAddress && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
              <HiOutlineHome />
              Shipping To
            </h2>
            <div className="text-slate-600 bg-slate-50 rounded-lg p-4">
              <p className="font-semibold">{shippingAddress.name}</p>
              <p>{shippingAddress.local_address}, {shippingAddress.city}</p>
              <p>{shippingAddress.state} - {shippingAddress.pincode}</p>
            </div>
          </div>
        )}

        {/* --- Action Buttons --- */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleViewOrder}
            className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 border-2 border-indigo-200 py-3 rounded-lg font-semibold hover:bg-indigo-50 hover:border-indigo-600 transition-all duration-300"
          >
            <HiOutlineClipboardList />
            View Order
          </button>
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-transform hover:scale-105"
          >
            Continue Shopping
            <HiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;