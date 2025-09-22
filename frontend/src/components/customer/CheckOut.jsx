import React, { useState, useMemo } from 'react';
import { HiLockClosed, HiCreditCard, HiQrcode } from 'react-icons/hi';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import axios from "axios";
import { BASE_URL } from '../path';

const CheckOut = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {address, cartItems} = location.state || {}
  const [paymentMethod, setPaymentMethod] = useState('card');
  const { user } = useOutletContext();

  const { subtotal, shipping, grandTotal } = useMemo(() => {
    const sub = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
    const shp = sub > 5000 ? 0 : 99;
    const total = sub + shp;
    return { subtotal: sub, shipping: shp, grandTotal: total };
  }, [cartItems]);

  const [payment, setPayment]= useState({
    card_num: "",
    cvv: "",
    upi: "",
    exp_date :""
  })

  const [errors, setErrors]= useState({
    card_num: "",
    cvv: "",
    upi: "",
    exp_date :""
  })

  const handleChange = (e) =>{
    const {name, value} = e.target;
    setPayment((prev) => ({
      ...prev, [name] : value.trim(),
    }))
    setErrors((prev) => ({
      ...prev, [name] : "",
    }))
  }

  const verifyPayment = (payment, paymentMethod)=>{
    console.log(user);
    let isValid = true;
    if(paymentMethod === "card"){
      
      if (!payment.card_num || !/^\d{16}$/.test(payment.card_num)) {
        setErrors(prev => ({ ...prev, card_num: "Card number must be 16 digits" }));
        isValid = false;
      }

      if (!payment.cvv || !/^\d{3,4}$/.test(payment.cvv)) {
        setErrors(prev => ({ ...prev, cvv: "CVV must be 3 or 4 digits" }));
        isValid = false;
      }

      if (!payment.exp_date || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.exp_date)) {
        setErrors(prev => ({ ...prev, exp_date: "Expiry must be in MM/YY format" }));
        isValid = false;
      }

    }else{
      const upi = payment.upi?.trim();
      if (!upi || !/^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/.test(upi)) {
        console.log("err")
        setErrors(prev => ({ ...prev, upi: "Enter a valid UPI ID" }));
        isValid = false;
      }
    }
    return isValid;
  }

  const placeOrder = async (e)=>{
    e.preventDefault();
    if(verifyPayment(payment, paymentMethod)){
      const paymentInfo = paymentMethod === "card" ? { last4: payment.card_num.slice(-4) } : { upi: payment.upi };
      const { id, customer_id, ...filteredAddress } = address;
      const orderData = {
        address: filteredAddress,
        customerId : user.id,
        cartItems: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          seller_id: item.seller_id,
        })),
        total: grandTotal,
        shipping,
        payment_method: paymentMethod,
        payment_info: paymentInfo,
      };

      try{
        const res = await axios.post(`${BASE_URL}/placeOrder`, orderData , {withCredentials: true});
        const orderId = res.data.orderId;

        navigate("/ordersuccess", {state : {cartItems, grandTotal, orderId, shippingAddress: filteredAddress}});
      }catch(err){
        console.log(err);
        alert("Internal Server Error");
      }
    }
  }

  
   return (
    <div className="mx-auto my-4 md:my-5 max-w-6xl p-4 md:p-16 bg-white rounded-xl">
        <h1 className="text-2xl md:text-3xl font-semibold">CHECKOUT</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:border-r md:pr-4">
            <div className="pt-6 pb-4">
              <div className="py-2 flex justify-between">
                <h1 className="text-xl font-semibold">SHIPPING ADDRESS</h1>
                <button className="text-md text-blue-600 font-medium hover:underline">Change</button>
              </div>
                <div className="space-y-1">
                  <p>{address.name}</p>
                  <p>{address.local_address}, {address.city}</p>
                  <p>{address.district}, {address.state}-{address.pincode}</p>
                  <p>{address.phone}</p>
                </div>
            </div>

            <div className="pt-4 border-t">
              
              <h1 className="text-xl font-semibold">Payment Method</h1>
              <div className="flex gap-4 py-8 mb-6">

                <button className={`flex-1 rounded-md p-4 border-2 transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`} onClick={() => setPaymentMethod('card')}>
                  <HiCreditCard className="mx-auto h-7 w-7 mb-2 text-blue-700" /> <span className="font-semibold text-sm">Card</span>
                </button>

                <button onClick={() => setPaymentMethod('upi')} className={`flex-1 rounded-md p-4 border-2 transition-all ${paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                  <HiQrcode className="mx-auto h-7 w-7 mb-2 text-purple-700" /><span className="font-semibold text-sm">UPI / QR</span>
                </button>

              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Card Number" onChange={handleChange} name="card_num" className="w-full p-3 border rounded-md" />
                  {errors.card_num && <span className="text-red-500 text-xs mt-1">{errors.card_num}</span>}
                  <div className="flex gap-4">
                    <input type="text" placeholder="Expiry (MM/YY)" onChange={handleChange} name="exp_date" className="w-1/2 p-3 border rounded-md" />
                    {errors.exp_date && <span className="text-red-500 text-xs mt-1">{errors.exp_date}</span>}
                    <input type="text" placeholder="CVV" name="cvv" onChange={handleChange} className="w-1/2 p-3 border rounded-md" />
                    {errors.cvv && <span className="text-red-500 text-xs mt-1">{errors.cvv}</span>}
                  </div>
                </div>
              )}
              {paymentMethod === 'upi' && (
                <div>
                  <input type="text" placeholder="Enter your UPI ID" onChange={handleChange} name="upi" className="w-full p-3 border rounded-md" />
                  {errors.upi && <span className="text-red-500 text-xs mt-1">{errors.upi}</span>}
                </div>
              )}
            </div>
        </div>


        <div className="pt-6 md:pt-0 border-t md:border-none">
          <h1 className="text-xl font-semibold mb-4">ORDER SUMMARY</h1>
          {cartItems?.map((item) => (
            <div key = {item.id} className="flex  md:border-y">
              <div className="md:h-24  md:w-24 w-20 h-20 flex items-center bg-[#CFCFC5] justify-center m-3 rounded-md ">
                <img  src={item.image || item.imageurl} className="md:h-20 md:w-20 w-16 h-16 rounded-md" />
              </div>
              <div className="flex justify-between flex-1 m-2 ">
                <div className="space-y-1">
                  <h2 className="text-lg font-medium">{item.brand}</h2>
                  <p>{item.pname}</p>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className="font-semibold text-right space-y-1">
                 <p className="text-lg">₹ {item.price}</p>
                 <p className=" ">X {item.quantity}</p>
                 <p>₹ {item.price * item.quantity}</p>
                </div>
              </div>
          </div>))}

          <div className="space-y-2 text-gray-600">
                <div className="flex justify-between"><p>Subtotal</p><p className="font-medium">₹ {subtotal.toLocaleString('en-IN')}</p></div>
                <div className="flex justify-between"><p>Shipping</p><p className="font-medium">{shipping === 0 ? "Free" : `₹ ${shipping}`}</p></div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between items-center font-bold text-lg text-slate-800">
                <p>Total</p>
                <p>₹{grandTotal.toLocaleString('en-IN')}</p>
              </div>
              <button className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-105" onClick={placeOrder} >
                Place Order
              </button>
              <p className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-2">
                <HiLockClosed /> Your payment is 100% secure.
              </p>
        </div>
        
    </div>
    </div>
  );
}

export default CheckOut;