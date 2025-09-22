import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../path';
import axios from "axios";
import { HiOutlineTicket, HiOutlineCalendar, HiOutlineEye, HiOutlineShoppingBag } from 'react-icons/hi';

const OrderItemSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 animate-pulse">
        <div className="w-full sm:w-24 h-32 sm:h-24 rounded-md bg-gray-200"></div>
        <div className="flex-grow space-y-3 py-1">
            <div className="w-24 h-5 rounded-full bg-gray-200"></div>
            <div className="w-3/4 h-6 rounded bg-gray-200"></div>
            <div className="w-1/2 h-4 rounded bg-gray-200"></div>
            <div className="w-1/2 h-4 rounded bg-gray-200"></div>
        </div>
        <div className="flex flex-col items-start sm:items-end justify-between flex-shrink-0">
            <div className="w-20 h-6 rounded bg-gray-200 mb-2"></div>
            <div className="w-24 h-4 rounded bg-gray-200 mb-4"></div>
            <div className="w-32 h-10 rounded-lg bg-gray-200"></div>
        </div>
    </div>
);


const Orders = () => {
    const navigate = useNavigate();
    const { user, isAuthLoading } = useOutletContext();
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }
        const getOrders = async () => {
            if (user && user.id) {
                try {
                    const res = await axios.post(`${BASE_URL}/getOrders`, { userid: user.id });
                    const sortedItems = res.data.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setOrderItems(sortedItems);
                } catch (err) {
                    console.error("Failed to fetch orders:", err);
                    setError("Could not load your orders.");
                }
            } else {
                alert("please login first")
                navigate("/login")
            }
            setLoading(false);
        };

        const timer = setTimeout(getOrders, 300);
        return () => clearTimeout(timer);

    }, [user, navigate]);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'processed': return 'bg-green-100 text-green-800';
            case 'shipped': return 'bg-yellow-100 text-yellow-800';
            case 'out for delivery': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="h-9 w-48 rounded bg-gray-300 animate-pulse mb-8"></div>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <OrderItemSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-10 text-red-600">{error}</div>;
    }

    if (orderItems.length === 0) {
        return (
            <div className="text-center p-10 flex flex-col items-center">
                <HiOutlineShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
                <p className="text-gray-500 mb-6">You haven't placed any orders with us. Let's change that!</p>
                <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700" onClick={()=>navigate("/")}>Start Shopping</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">My Orders</h1>
            <div className="space-y-4">
                {orderItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4">
                        <img
                            src={item.imageurl || item.image}
                            alt={item.pname}
                            className="w-full sm:w-24 h-32 sm:h-24 rounded-md object-cover border"
                        />
                        <div className="flex-grow">
                            <p className={`text-xs font-bold py-1 px-2 rounded-full inline-block mb-2 ${getStatusBadge(item.status)}`}>
                                {item.status?.toUpperCase()}
                            </p>
                            <h2 className="text-lg font-semibold text-slate-800">{item.pname}</h2>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                <HiOutlineTicket /> {item.order_group_id}
                            </p>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                <HiOutlineCalendar />
                                {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end justify-between">
                            <p className="text-lg font-bold text-slate-900 mb-2 sm:mb-0">
                                ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                            </p>
                            <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200" onClick={()=>{navigate(`/order/${item.order_group_id}`)}}><HiOutlineEye /> View Order</button>
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;