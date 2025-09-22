import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../components/path";

import { Outlet, useNavigate } from "react-router-dom";
import { MdHome, MdPerson, MdShoppingCart, MdStore } from "react-icons/md";
import { BsBoxSeam } from 'react-icons/bs';


const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [loginorout, setloginorout] = useState("Login")
    const [user, setUser] = useState({
        id: "",
        email: "",
        role: "",
        name: ""
    })
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/verifyLogin`, { withCredentials: true, });
                if (res.data.user) {
                    setUser(res.data.user);
                    setloginorout("Logout")
                }
            } catch (err) {
                console.error("Error verifying login:", err);
            } finally {
                setIsAuthLoading(false);
            }
        };
        verify();
    }, []);

    const Logout = async (e) => {
        const res = await axios.get(`${BASE_URL}/logout`, { withCredentials: true });
        alert("Logout Success full");
        setloginorout("Login")
    }

    const Login = () => {
        navigate("/login")
    }

    const handleSellerClick = () => {
        if (user.role === "Seller") {
            navigate("/seller/home")
        }
        else {
            alert("Restricted to sellers only!")
        }
    }

    return (
        <div className="bg-[#CFD8DC] text-[#37474F] min-h-screen flex flex-col font-poppins">
            <header className="fixed w-full z-50 bg-[#37474F] text-[#cfd8dc] flex items-center justify-between sm:px-4 px-2 md:px-14 h-16">
                <h1 className="sm:text-3xl text-xl font-medium cursor-pointer" onClick={() => navigate("/")}>
                    PrimeCart
                </h1>
                <button className=" flex flex-col items-center hover:text-blue-500" onClick={() => loginorout === "Logout" ? Logout() : Login()}>
                    <MdPerson className="sm:text-3xl text-xl" />
                    <span className="text-xs mt-1">{loginorout}</span>
                </button>
            </header>


            <main className="mt-1 mt-16">
                <Outlet context={{ user, isAuthLoading }} />
            </main>

            <nav className="fixed z-50 bottom-0 w-full bg-white shadow-md flex justify-around items-center py-2">
                <button className="flex flex-col items-center text-gray-700 hover:text-blue-500" onClick={() => navigate("/")}>
                    <MdHome size={28} />
                    <span className="text-xs mt-1">Home</span>
                </button>
                <button className="flex flex-col items-center text-gray-700 hover:text-blue-500" onClick={() => navigate("/cart")}>
                    <MdShoppingCart size={28} />
                    <span className="text-xs mt-1">Cart</span>
                </button>
                <button className="flex flex-col items-center text-gray-700 hover:text-blue-500" onClick={() => navigate("/profile")}>
                    <MdPerson size={28} />
                    <span className="text-xs mt-1">Profile</span>
                </button>
                <button className="flex flex-col items-center text-gray-700 hover:text-blue-500" onClick={handleSellerClick}>
                    <MdStore size={28} />
                    <span className="text-xs mt-1">Seller</span>
                </button>
                <button
                    className="flex flex-col items-center text-gray-700 hover:text-blue-500"
                    onClick={() => navigate('/orders')}
                >
                    <BsBoxSeam size={28} />
                    <span className="text-xs mt-1">Orders</span>
                </button>
            </nav>


            <footer className="bg-[#37474F] w-full mt-auto text-center mb-16">
                <div className="m-auto">
                    <p className="text-sm lg:text-xl font-medium text-[#ECEFF1] mt-3">PrimeCart &copy; 2025 | All Rights Reserved</p>
                    <p className="text-[#cfd8dc] m-2 text-xs lg:text-base" >
                        <a className="text-[#f8b400] m-1 hover:underline" href="#">Privacy Policy</a> |
                        <a className="text-[#f8b400] m-1 hover:underline" href="#">Terms of Service</a> |
                        <a className="text-[#f8b400] m-1 hover:underline" href="#">Contact Us</a>
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default CustomerDashboard;