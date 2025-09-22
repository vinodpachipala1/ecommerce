import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../components/path";

const Register = () => { 
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate("/login");
    };

    const [userType, setUserType] = useState("Customer");

    const [reg, setReg] = useState({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",
        store: "",
        BusinessAddress: "",
        phone: "",
    });

    const [err, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",
        store: "",
        BusinessAddress: "",
        phone: "",
    });

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setReg((prev) => ({
            ...prev, [name]: value
        }));
        setErrors((prev) => ({
            ...prev, [name]: ""
        }));
    };

    const handleCustomerClick = () => {
        setUserType("Customer");
        setReg(prev => ({
            ...prev,
            store: "",
            BusinessAddress: "",
            phone: ""
        }));
    };

    const verify = () => {
        let isValid = true;

        if (reg.name.length === 0 || !/^[A-Za-z][A-Za-z ]*$/.test(reg.name)) {
            isValid = false;
            setErrors(prev => ({ ...prev, name: "Name must contain letters only!" }));
        }

        if (reg.email.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.email)) {
            isValid = false;
            setErrors(prev => ({ ...prev, email: "Invalid email format" }));
        }

        if (userType === "Seller" && !/^\d{10}$/.test(reg.phone)) {
            isValid = false;
            setErrors(prev => ({ ...prev, phone: "Phone number must be 10 digits" }));
        }

        if (reg.password.length === 0 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(reg.password)) {
            isValid = false;
            setErrors(prev => ({ ...prev, password: "At least 8 characters, uppercase, lowercase, number, and special character" }));
        }

        if (reg.password !== reg.confirmpassword) {
            isValid = false;
            setErrors(prev => ({ ...prev, confirmpassword: "Password and Confirm Password should match" }));
        }

        if (userType === "Seller" && !/^[A-Za-z\s]{3,}$/.test(reg.store)) {
            isValid = false;
            setErrors(prev => ({ ...prev, store: "Store name must be at least 3 letters" }));
        }

        if (userType === "Seller" && reg.BusinessAddress.length < 5) {
            isValid = false;
            setErrors(prev => ({ ...prev, BusinessAddress: "Address should be at least 5 characters" }));
        }

        return isValid;
    };

    const register = async (e) => {
        e.preventDefault();
        if (verify()) {
            try {
                const res = await axios.post(`${BASE_URL}/register`, { reg: reg, userType: userType });
                if (res.data.message === "Success") {
                    navigate("/login");
                }
            } catch (err) {
                console.log(err);
            }
        }
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #37474F, #546E7A)' }} className="flex justify-center items-center min-h-screen font-poppins p-4">
            <div className={`bg-[#CFD8DC] w-full max-w-md p-5 rounded-xl relative shadow-lg text-center ${userType === "Seller" ? "my-10" : "my-0"}`}>
                <div className="text-2xl text-[#37474F] font-semibold absolute -top-5 left-1/2 bg-[#CFD8DC] pt-1 pb-1 px-5 transform -translate-x-1/2 rounded-3xl shadow-lg">PrimeCart</div>
                <h2 className="text-2xl font-semibold text-[#37474F] mb-5 mt-5">User Registration</h2>

                <div className="flex justify-center mb-5">
                    <button
                        className={`flex-1 p-3 text-md transition-colors duration-300 ease-in-out font-[500] ${userType === "Customer" ? "bg-[#37474F] text-white font-bold" : "bg-[#B0BEC5] text-[#37474F]"} rounded-l-lg`}
                        onClick={handleCustomerClick}
                    >
                        Customer
                    </button>
                    <button
                        className={`flex-1 p-3 text-md transition-colors duration-300 ease-in-out font-[500] ${userType === "Seller" ? "bg-[#37474F] text-white font-bold" : "bg-[#B0BEC5] text-[#37474F]"} rounded-r-lg`}
                        onClick={() => setUserType("Seller")}
                    >
                        Seller
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <input
                        onChange={handleOnChange}
                        name="name"
                        className="p-3 w-full text-md rounded-md border-2 border-[#90A4AE] focus:outline-none focus:border-[#546E7A]"
                        type="text"
                        placeholder="Full Name"
                        required
                    />
                    {err.name && <p className="text-red-600 text-sm">{err.name}</p>}

                    <input
                        onChange={handleOnChange}
                        name="email"
                        className="p-3 w-full text-md rounded-md border-2 border-[#90A4AE] focus:outline-none focus:border-[#546E7A]"
                        type="email"
                        placeholder="Email"
                        required
                    />
                    {err.email && <p className="text-red-600 text-sm">{err.email}</p>}

                    <input
                        onChange={handleOnChange}
                        name="password"
                        className="p-3 w-full text-md rounded-md border-2 border-[#90A4AE] focus:outline-none focus:border-[#546E7A]"
                        type="password"
                        placeholder="Password"
                        required
                    />
                    {err.password && <p className="text-red-600 text-sm">{err.password}</p>}

                    <input
                        onChange={handleOnChange}
                        name="confirmpassword"
                        className="p-3 w-full text-md rounded-md border-2 border-[#90A4AE] focus:outline-none focus:border-[#546E7A]"
                        type="password"
                        placeholder="Confirm Password"
                        required
                    />
                    {err.confirmpassword && <p className="text-red-600 text-sm">{err.confirmpassword}</p>}

                    {userType === "Seller" && (
                        <div className="flex flex-col gap-2">
                            <input
                                onChange={handleOnChange}
                                name="store"
                                className="p-3 w-full text-md rounded-md border-2 border-[#90A4AE] focus:outline-none focus:border-[#546E7A]"
                                type="text"
                                placeholder="Store Name"
                            />
                            {err.store && <p className="text-red-600 text-sm">{err.store}</p>}

                            <input
                                onChange={handleOnChange}
                                name="BusinessAddress"
                                className="p-3 w-full text-md rounded-md border-2 border-[#90A4AE] focus:outline-none focus:border-[#546E7A]"
                                type="text"
                                placeholder="Business Address"
                            />
                            {err.BusinessAddress && <p className="text-red-600 text-sm">{err.BusinessAddress}</p>}

                            <input
                                onChange={handleOnChange}
                                name="phone"
                                className="p-3 w-full text-md rounded-md border-2 border-[#90A4AE] focus:outline-none focus:border-[#546E7A]"
                                type="text"
                                placeholder="Phone Number"
                            />
                            {err.phone && <p className="text-red-600 text-sm">{err.phone}</p>}
                        </div>
                    )}

                    <button
                        className="text-md pt-2 pb-2 pl-3 pr-3 mb-3 rounded-md w-full text-center bg-[#37474F] text-white hover:bg-[#546E7A] active:scale-95 transition-all duration-200"
                        onClick={register}
                    >
                        Register
                    </button>
                </div>

                <p>Already have an account? <span onClick={handleLoginClick} className="text-[#546E7A] hover:underline hover:cursor-pointer">Login here</span></p>
            </div>
        </div>
    );
};

export default Register;
