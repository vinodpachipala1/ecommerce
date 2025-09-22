import React from 'react';
import { HiOutlineTruck, HiOutlineHeart, HiOutlineTrash } from 'react-icons/hi';

const CartItem = (props) => {
    const { item, QuantityIncrease, QuantityDecrease, removeFromCart } = props
    const subtotal = item.price * item.quantity;

    const getStockInfo = () => {
        if (item.stock <= 0) {
            return <p className="text-sm font-semibold text-red-600">Out of Stock</p>;
        }
        if (item.stock < 10) {
            return <p className="text-sm font-semibold text-amber-600">Only {item.stock} left!</p>;
        }
        return <p className="text-sm font-semibold text-green-600">In Stock</p>;
    };

    return (
        <div className="w-sm xl:max-w-2xl rounded-lg border bg-white p-4 shadow-sm mb-2">
            <div className="flex gap-2 md:gap-4">
                <img src={item.imageurl || item.image} alt={item.pname} className="h-20 w-20 md:h-28 md:w-28 rounded-md object-cover" />

                <div className="flex-grow mt-4">
                    <p className="text-xs md:text-sm font-medium text-gray-500">{item.brand}</p>
                    <h3 className=" md:text-lg font-semibold text-gray-800">{item.pname}</h3>
                    {item.store_name && (
                        <p className="md:mt-1 text-xs text-gray-500">
                            Sold by: <span className="font-medium text-blue-600">{item.store_name}</span>
                        </p>
                    )}
                </div>

                <div className="text-right mt-4">
                    <p className="text-base md:text-xl font-medium text-gray-900 pb-2">
                        ₹{item.price}
                    </p>
                    <p >Quatntity: {item.quantity}</p>
                </div>
            </div>

            <div className="md:mt-4 flex items-center justify-between border-t md:pt-3">
                <div className="flex items-center rounded-md border">
                    <button className="px-1 md:px-3 md:py-1 font-bold text-gray-600 hover:bg-gray-100" onClick={() => QuantityDecrease(item.id)}>-</button>
                    <span className="w-8 md:w-10 text-center text-xs md:text-sm font-medium">{item.quantity}</span>
                    <button className="px-1 md:px-3 md:py-1 font-bold text-gray-600 hover:bg-gray-100" onClick={() => QuantityIncrease(item.id)}>+</button>
                </div>


                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                    <button className="flex items-center gap-1 hover:text-indigo-600">
                        <HiOutlineHeart /> Save for Later
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-600" onClick={() => removeFromCart(item.id)}>
                        <HiOutlineTrash /> Remove
                    </button>
                </div>
            </div>

            <div className="mt-2 md:mt-3 flex items-center justify-between rounded-md bg-gray-50 p-2">
                {getStockInfo()}
                <div className="text-right">
                    <p className="text-sm md:text-lg font-semibold text-gray-500">Subtotal:
                        <span className="text-sm md:text-lg font-bold text-gray-900"> ₹{subtotal}</span></p>
                </div>

            </div>
        </div>
    );
};

export default CartItem;