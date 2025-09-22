import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../components/path";
import { useNavigate, Outlet } from "react-router-dom";
import { MdHome, MdPerson, MdAddBox, MdLogout, MdDashboard, MdListAlt } from "react-icons/md";

import AddProduct from "../components/seller/addproduct";

const Seller = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        id: "",
        email: "",
        role: "",
        name: "",
    })


    useEffect(() => {
        const verifyLogin = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/verifyLogin`, { withCredentials: true, });
                if (!res.data.user) {
                    alert("Please log in")
                    navigate("/login")
                }
                if (res.data.user.role === "Seller") {
                    setUser(res.data.user);
                } else {
                    alert("Please log in first")
                    navigate("/login")
                }
            } catch (err) {
                console.error("Error verifying login:", err);
            }
        };
        verifyLogin();
    }, []);

    const logout = async () => {
        const res = await axios.get(`${BASE_URL}/logout`, { withCredentials: true });
        navigate("/");
    }


    return (
        <div className="bg-[#CFD8DC] text-[#37474F] min-h-screen flex flex-col font-poppins">
            <header className="fixed w-full z-50 bg-[#37474F] text-[#cfd8dc] flex items-center justify-between sm:px-4 px-2 md:px-14 h-16">
                <h1 className="sm:text-3xl text-xl font-medium cursor-pointer" onClick={() => navigate("/")}>
                    PrimeCart
                </h1>
                <h1 className="text-center font-bold text-xl sm:text-2xl">Seller Dashboard</h1>
                <button className="flex flex-col items-center hover:text-blue-500" onClick={logout}>
                    <MdLogout className="sm:text-3xl text-xl" />
                    <span className="text-xs mt-1">Logout</span>
                </button>
            </header>



            
            <main className="mt-16">
                <Outlet context={{ user }} />
            </main>



            <nav className="fixed z-50 bottom-0 w-full bg-white shadow-md flex justify-around items-center py-2">
                <button
                    className="flex flex-col items-center text-gray-700 hover:text-blue-500"
                    onClick={() => navigate("/seller/home")}
                >
                    <MdHome size={28} />
                    <span className="text-xs mt-1">Home</span>
                </button>

                <button
                    className="flex flex-col items-center text-gray-700 hover:text-blue-500"
                    onClick={() => navigate("/addproduct")}
                >
                    <MdAddBox size={28} />
                    <span className="text-xs mt-1">Add</span>
                </button>


                <button
                    className="flex flex-col items-center text-gray-700 hover:text-blue-500"
                    onClick={() => navigate("/seller/profile")}
                >
                    <MdPerson size={28} />
                    <span className="text-xs mt-1">Profile</span>
                </button>

                <button
                    className="flex flex-col items-center text-gray-700 hover:text-blue-500"
                    onClick={() => navigate("/")}
                >
                    <MdDashboard size={28} />
                    <span className="text-xs mt-1">Customer</span>
                </button>

                <button
                    className="flex flex-col items-center text-gray-700 hover:text-blue-500"
                    onClick={() => navigate("/seller/orders")}
                >
                    <MdListAlt size={28} />
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

        </div>)
}
export default Seller;