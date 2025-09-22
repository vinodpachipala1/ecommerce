import axios from "axios";
import { BASE_URL } from "../path";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import CartItem from "./CartItem";

const CartItemSkeleton = () => (
    <div className="bg-white rounded-md p-4 mb-4 animate-pulse">
        <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mt-2"></div>
            </div>
        </div>
    </div>
);

const SummarySkeleton = () => (
    <div className="bg-white rounded-md p-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-6">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="mt-8 border-t pt-4 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
    </div>
);

const Cart = () => {
    const { user, isAuthLoading } = useOutletContext();
    const [cartproducts, setCartProducts] = useState([]);
    const navigate = useNavigate();
    const [alladdress, setAllAddress] = useState([]);
    const [address, setAddress] = useState({});
    const [loading, setLoading] = useState(true);

    const [addressErrors, setAddressErros] = useState({
        name: "",
        phone: "",
        local_address: "",
        pincode: "",
        city: "",
        district: "",
        state: ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({
            ...prev, [name]: value,
        }))
        setAddressErros((prev) => ({
            ...prev, [name]: "",
        }))
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isAuthLoading) {
                return;
            }
            const getCartItems = async () => {
                setLoading(true);
                if (user?.id) {
                    try {
                        setLoading(true);
                        const res = await axios.post(`${BASE_URL}/getCartandAddress`, { userid: user.id });
                        console.log(res.data.address)
                        setCartProducts(res.data.cart);
                        setAllAddress(res.data.address);
                        setAddress(res.data.address[0] || {});
                    } catch (err) {
                        console.log(err)
                    } finally {
                        setLoading(false);
                    }
                }
                else {
                    alert("please login first")
                    navigate("/login")
                }
            }
            getCartItems();
        }, 1000);

        return () => clearTimeout(timer);
    }, [user, navigate]);

    const QuantityIncrease = async (productid) => {
        const product = cartproducts.find((p) => p.id === productid);

        const newQuantity = product.quantity + 1;

        if (newQuantity > product.stock) {
            alert("Not enough stock.");
            return;
        }

        setCartProducts((currentProducts) => currentProducts.map((p) =>
            p.id === productid ? { ...p, quantity: newQuantity } : p
        ));

        try {
            await axios.put(`${BASE_URL}/updateCartQuantity`, { productid: product.product_id, userid: user.id, quantity: newQuantity, });

        } catch (err) {
            console.error("Error increasing quantity:", err);
        }
    }

    const QuantityDecrease = async (productid) => {
        const product = cartproducts.find((p) => p.id === productid);
        const newQuantity = product.quantity - 1;

        if (newQuantity < 1) {
            alert("Minimum Quantity is 1.");
            return;
        }

        setCartProducts((currentProducts) =>
            currentProducts.map((p) =>
                p.id === productid ? { ...p, quantity: newQuantity } : p
            )
        );

        try {
            await axios.put(`${BASE_URL}/updateCartQuantity`, { productid: product.product_id, userid: user.id, quantity: newQuantity, });

        } catch (err) {
            console.error("Error increasing quantity:", err);
        }
    }

    const removeFromCart = async (cartitemid) => {
        setCartProducts(product => product.filter(item => item.id != cartitemid))
        try {
            const res = await axios.delete(`${BASE_URL}/deleteCartItem`, { data: { cartitemid }, withCredentials: true })
        }
        catch (err) {
            console.log(err)
        }
    }

    const verifyAddress = (address) => {
        if (!address) {
            console.error(address);
            return false;
        }

        var isValid = true;

        if (!address.name || address.name.trim() === "") {
            setAddressErros((prev) => ({
                ...prev, name: "Name is required",
            }))
            isValid = false;
        }

        if ((!address.phone || address.phone.trim() === "") || !/^\d{10}$/.test(address.phone)) {
            setAddressErros((prev) => ({
                ...prev, phone: "Phone must be 10 digits",
            }))
            isValid = false;
        }

        if (!address.local_address || address.local_address.trim() === "") {
            setAddressErros((prev) => ({
                ...prev, local_address: "Local address is required",
            }))
            isValid = false;
        }

        if ((!address.pincode || address.pincode.trim() === "") || !/^\d{6}$/.test(address.pincode)) {

            setAddressErros((prev) => ({
                ...prev, pincode: "Pincode must be 6 digits",
            }))
            isValid = false;
        }

        if (!address.city || address.city.trim() === "") {
            setAddressErros((prev) => ({
                ...prev, city: "City/Village is required",
            }))
            isValid = false;
        }

        if (!address.district || address.district.trim() === "") {
            setAddressErros((prev) => ({
                ...prev, district: "District is required",
            }))
            isValid = false;
        }

        if (!address.state || address.state.trim() === "") {
            setAddressErros((prev) => ({
                ...prev, state: "State is required",
            }))
            isValid = false;
        }

        return isValid;
    };


    const proceedCheckout = (e) => {
        console.log(address)
        if (verifyAddress(address)) {
            navigate("/checkout", { state: { address, cartItems: cartproducts } })
        }
        else {
            console.log(addressErrors)
        }
    }

    if (loading) {
        return (
            <div className="bg-[#CFD8DC] md:flex gap-4 font-poppins xl:m-4 xl:mx-24 p-4">
                <div className="lg:w-3/5 md:w-1/2">
                    <CartItemSkeleton />
                    <CartItemSkeleton />
                </div>
                <div className="lg:w-2/5 md:w-1/2">
                    <SummarySkeleton />
                </div>
            </div>
        );
    }

    if (!loading && cartproducts.length === 0) {
        return (
            <div className="text-center py-20 bg-[#CFD8DC] h-screen">
                <h2 className="text-2xl font-bold text-[#37474F]">Your Cart is Empty</h2>
                <p className="text-gray-600 mt-2">Looks like you haven't added anything to your cart yet.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-6 py-2 bg-gray-800 text-white font-semibold rounded-md shadow-md hover:bg-gray-900 transition-colors"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (<div className="bg-[#CFD8DC] text-[#37474F] md:flex gap-2 font-poppins xl:m-4 xl:mx-24">
        <div className="lg:w-3/5 md:w-1/2">
            {cartproducts?.map((product) => (
                <CartItem key={product.id} item={product} QuantityIncrease={QuantityIncrease} QuantityDecrease={QuantityDecrease} removeFromCart={removeFromCart} />
            ))}
        </div>

        <div className="lg:w-2/5 md:mx-2  lg:m-0 md:w-1/2 ">
            <div className="col-span-2 mb-5">
                <label className="block mb-1 font-semibold">Choose Address</label>
                <select
                    className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-black"
                    value={address.id || ""}
                    onChange={(e) => { const selected = alladdress.find((addr) => addr.id === parseInt(e.target.value)); setAddress(selected || {}); }}>
                    {alladdress.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                            {addr.name}, {addr.local_address}, {addr.city}, {addr.state}
                        </option>
                    ))}
                </select>
            </div>

            <div className="md:grid md:grid-cols-2 gap-2 bg-white rounded-md p-5">
                <h1 className="md:text-2xl col-span-2 text-center font-bold">Address</h1>
                <div className="relative col-span-1 mb-5 flex flex-col border border-gray-300 rounded-md p-2 hover:border-black focus-within:border-black">
                    <label className="absolute left-2 -top-2 bg-white px-1 text-gray-500 text-xs transition-all duration-200">
                        Name *
                    </label>
                    <input className="outline-none focus:outline-none" onChange={handleChange} name="name" value={address.name || ""} type="text" id="name" />
                    {addressErrors.name && <span className="text-red-500 text-xs mt-1">{addressErrors.name}</span>}
                </div>

                <div className="relative col-span-1 mb-5 flex flex-col border border-gray-300 rounded-md p-2 hover:border-black focus-within:border-black">
                    <label className="absolute left-2 -top-2 bg-white px-1 text-gray-500 text-xs transition-all duration-200">
                        Phone *
                    </label>
                    <input className="outline-none focus:outline-none" onChange={handleChange} name="phone" value={address.phone || ""} type="text" id="name" />
                    {addressErrors.phone && <span className="text-red-500 text-xs mt-1">{addressErrors.phone}</span>}
                </div>

                <div className="relative col-span-2 mb-5 flex flex-col border border-gray-300 rounded-md p-2 hover:border-black focus-within:border-black">
                    <label className="absolute left-2 -top-2 bg-white px-1 text-gray-500 text-xs transition-all duration-200">
                        Local Address *
                    </label>
                    <textarea className=" rows-2 h-18 outline-none focus:outline-none" onChange={handleChange} name="local_address" value={address.local_address || ""} placeholder="door no/lcoal area/street name...." />
                    {addressErrors.local_address && <span className="text-red-500 text-xs mt-1">{addressErrors.local_address}</span>}
                </div>

                <div className="relative col-span-1 mb-5 flex flex-col border border-gray-300 rounded-md p-2 hover:border-black focus-within:border-black">
                    <label className="absolute left-2 -top-2 bg-white px-1 text-gray-500 text-xs transition-all duration-200">
                        Pincode *
                    </label>
                    <input className="outline-none focus:outline-none" onChange={handleChange} name="pincode" value={address.pincode || ""} type="text" id="name" />
                    {addressErrors.pincode && <span className="text-red-500 text-xs mt-1">{addressErrors.pincode}</span>}
                </div>

                <div className="relative col-span-1 mb-5 flex flex-col border border-gray-300 rounded-md p-2 hover:border-black focus-within:border-black">
                    <label className="absolute left-2 -top-2 bg-white px-1 text-gray-500 text-xs transition-all duration-200">
                        Village/City *
                    </label>
                    <input className="outline-none  focus:outline-none" onChange={handleChange} name="city" value={address.city || ""} type="text" id="name" />
                    {addressErrors.city && <span className="text-red-500 text-xs mt-1">{addressErrors.city}</span>}
                </div>

                <div className="relative col-span-1 mb-5 flex flex-col border border-gray-300 rounded-md p-2 hover:border-black focus-within:border-black">
                    <label className="absolute left-2 -top-2 bg-white px-1 text-gray-500 text-xs transition-all duration-200">
                        District *
                    </label>
                    <input className="outline-none focus:outline-none" onChange={handleChange} name="district" value={address.district || ""} type="text" id="name" />
                    {addressErrors.district && <span className="text-red-500 text-xs mt-1">{addressErrors.district}</span>}
                </div>

                <div className="relative col-span-1 mb-5 flex flex-col border border-gray-300 rounded-md p-2 hover:border-black focus-within:border-black">
                    <label className="absolute left-2 -top-2 bg-white px-1 text-gray-500 text-xs transition-all duration-200">
                        State *
                    </label>
                    <input className="outline-none focus:outline-none" onChange={handleChange} name="state" value={address.state || ""} type="text" id="name" />
                    {addressErrors.state && <span className="text-red-500 text-xs mt-1">{addressErrors.state}</span>}
                </div>

                <div className="col-span-2 flex mb-5 justify-between text-lg font-semibold mt-2 border-t pt-3">
                    <span>Total Amount:</span>
                    <span>₹{cartproducts.reduce((total, item) => total + item.price * item.quantity, 0)}</span>
                </div>

                <div className="col-span-2 mb-5 text-center">
                    <button className="p-2 bg-[#4CAF50] text-white rounded-md shadow-md hover:bg-[#43a047] hover:scale-105 active:scale-95 transition-all duration-200" onClick={proceedCheckout}>Proceed to Checkout</button>
                </div>

            </div>

        </div>
    </div>)
}
export default Cart;
