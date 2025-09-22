import React, { useState, useEffect, useMemo } from 'react';
import { Package, Truck, CheckCircle2, MoreVertical, Import } from 'lucide-react';
import { BASE_URL } from "../path";
import axios from 'axios';
import { useOutlet, useOutletContext } from 'react-router-dom';

const SellerOrders = () => {
    const { user } = useOutletContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');


    useEffect(() => {
        const getOrders = async () => {
            if (user?.role === "Seller") {
                try {
                    setLoading(true);
                    const res = await axios.post(`${BASE_URL}/getOrdresReceived`, { sellerId: user.id }, { withCredentials: true });
                    console.log(res.data.orders)
                    setOrders(res.data.orders);
                } catch (err) {
                    setError('Failed to fetch orders. Please try again later.');
                } finally {
                    setLoading(false);
                }
            }

        };
        if (user) {
            getOrders();
        }
    }, [user]);


    const handleStatusChange = async (orderId, newStatus) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
        try {
            const result = await axios.post(`${BASE_URL}/updateOrdreStatus`, {orderId, newStatus}, {withCredentials : true});
            console.log(`Order ${orderId} status changed to ${newStatus}`);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const filteredOrders = useMemo(() => {
        if (filterStatus === 'All') {
            return orders;
        }
        return orders.filter(order => order.status === filterStatus);
    }, [orders, filterStatus]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            case 'Shipped':
                return 'bg-yellow-100 text-yellow-800';
            case 'Out for Delivery':
                return 'bg-indigo-100 text-indigo-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filterTabs = ['All', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-10 text-red-600 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Orders</h1>

                <div className="mb-4">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6">
                            {filterTabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterStatus(tab)}
                                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${filterStatus === tab
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>


                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_group_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <img className="h-10 w-10 rounded-md object-cover mr-4" src={order.imageurl || order.image} alt={order.product_name} />
                                                    <div>
                                                        <div>{order.product_name}</div>
                                                        <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${(order.quantity * order.price).toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="p-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                >
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Out for Delivery">Out for Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-gray-500">
                                            No orders found for this filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerOrders;