import React, { useState, useMemo } from 'react';
import { BASE_URL } from "../path";
import axios from "axios";
import { useLocation, useNavigate , useOutletContext } from 'react-router-dom';
import { HiOutlineShoppingCart, HiCheckCircle, HiXCircle, HiOutlineShieldCheck, HiOutlineScale, HiOutlineOfficeBuilding, HiOutlineExclamationCircle} from 'react-icons/hi';

const ProductDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {user} = useOutletContext();
    const { product } = location.state || {};
    const [cartMessage, setCartMessage] = useState(null);


    const stockStatus = useMemo(() => {
        if (!product) return {};

        if (product.stock === 0) {
            return { text: 'Out of Stock', color: 'text-red-600', icon: <HiXCircle /> };
        }
        if (product.stock < 10) {
            return { text: `Only ${product.stock} left!`, color: 'text-amber-600', icon: <HiOutlineExclamationCircle /> };
        }
        return { text: 'In Stock', color: 'text-green-600', icon: <HiCheckCircle /> };
    }, [product]);


    const sellerJoinedDate = useMemo(() => {
        if (!product?.seller_joined) return '';
        return new Date(product.seller_joined).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }, [product]);

    const AddtoCart = async (productid, userid) => {
        setCartMessage({ type: "loading", text: "Adding..." });
        try {
            await axios.post(`${BASE_URL}/addtoCart`, { productid:product.id, userid:user.id }, { withCredentials: true });
            setCartMessage({ type: "success", text: "Added!" });
            setTimeout(() => setCartMessage(null), 2000);
        } catch (err) {
            setCartMessage({ type: "error", text: err.response.data });
            setTimeout(() => setCartMessage(null), 2000);
        }
    };

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-bold text-slate-700">Product not found.</h2>
                <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" onClick={()=>{navigate("/")}}>Back to Homepage</button>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                    <div className="lg:w-2/5 xl:w-1/3 lg:sticky top-8 self-start">
                        <div className="bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={product.imageurl || product.image}
                                alt={product.pname}
                                className="w-full h-auto object-contain aspect-square mix-blend-multiply"
                            />
                        </div>

                        {user.id !== product.seller_id && <div className="flex gap-2 m-7">
                            {cartMessage ? (<button
                                className={`flex-1 rounded-md  gap-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 text-white ${cartMessage.type === "success" ? 'bg-green-600': 'bg-red-600 ' }`}>
                                {cartMessage.type === 'success' ? <HiCheckCircle /> : cartMessage.type === 'error' ? <HiXCircle /> : <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                <span>{cartMessage.text}</span>
                            </button>):
                            (<button
                                disabled={product.stock === 0}
                                className={`flex-1 flex items-center justify-center gap-1 px-4 py-3 bg-gray-800 text-white hover:bg-gray-1000 font-bold text-md rounded-lg shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed `} onClick={AddtoCart}>
                                <HiOutlineShoppingCart className="w-6 h-6" />
                                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                            </button>)
                            }

                            <button
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300"
                                onClick={() => alert('Saved for later!')}
                            >
                                ♡ Save for Later
                            </button>
                        </div>}
                    </div>


                    <div className="lg:w-3/5 xl:w-2/3">
                        <div>
                            <span className="text-sm font-medium text-indigo-600 tracking-wider uppercase">{product.category}</span>
                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2">{product.pname}</h1>
                            <p className="text-lg text-slate-500 mt-1">From <span className="font-semibold text-slate-700">{product.brand}</span></p>
                        </div>

                        <div className="mt-4">
                            <span className="text-4xl font-extrabold text-slate-900">
                                ₹{parseFloat(product.price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-base text-slate-500 ml-2">incl. of all taxes</span>
                        </div>

                        <hr className="my-6 border-slate-200" />

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`p-1.5 rounded-full ${stockStatus.color.replace('text', 'bg')} bg-opacity-10 flex items-center justify-center`}>
                                    {stockStatus.icon}
                                </span>
                                <span className={`font-semibold ${stockStatus.color}`}>{stockStatus.text}</span>
                            </div>


                            <div className="flex items-center gap-2 text-slate-600">
                                <span className="p-1.5 rounded-full bg-slate-100">
                                    <HiOutlineShieldCheck className="w-5 h-5" />
                                </span>
                                <span>{product.warranty_guarantee} Warranty</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <span className="p-1.5 rounded-full bg-slate-100">
                                    <HiOutlineScale className="w-5 h-5" />
                                </span>
                                <span>{product.weight} kg</span>
                            </div>
                        </div>

                        <hr className="my-6 border-slate-200" />

                        
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Seller Information</h2>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <div className="bg-indigo-100 p-2 rounded-full">
                                    <HiOutlineOfficeBuilding className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 hover:text-indigo-600 cursor-pointer">{product.store_name}</p>
                                    <p className="text-xs text-slate-500">
                                        {product.seller_name} (Joined {sellerJoinedDate})
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Description</h2>
                            <p className="text-slate-600 leading-relaxed">{product.description}</p>
                        </div>

                        {product.sections && product.sections.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-slate-800 mb-4">Specifications</h2>
                                <dl className="space-y-4">
                                    {product.sections.map((section, idx) => (
                                        <div key={idx} className="grid grid-cols-[120px_1fr] sm:grid-cols-[180px_1fr] gap-4 text-sm">
                                            <dt className="font-semibold text-slate-500">{section.title}</dt>
                                            <dd className="text-slate-700">{section.content}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {product.tags && product.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <h3 className="text-base font-bold text-slate-800 mb-3">Related Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.slice(0, 5).map((tag, idx) => (
                                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-md hover:bg-gray-200 cursor-pointer">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;