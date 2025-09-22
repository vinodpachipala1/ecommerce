import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../components/path";

const Login = () => {
    const navigate = useNavigate();
    const handleRegisterClick = () => {
        navigate("/register");
    };

    const [userType, setuserType] = useState("Customer");
    const [log, setlog] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setlog((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const login = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.post(`${BASE_URL}/login`, { log, userType }, { withCredentials: true });
            if (userType === "Seller") {
                navigate("/seller/home");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.log(err);
            setError(
                err.response?.data?.message || "Invalid email or password. Please try again."
            );
        }
    };

    return (
        <div
            style={{ background: "linear-gradient(135deg, #37474F, #546E7A)" }}
            className="flex justify-center items-center h-screen m-0 font-poppins px-4"
        >
            <div className="bg-[#CFD8DC] w-full sm:w-[400px] md:w-[29%] p-6 rounded-xl relative shadow-lg text-center">
                <div className="text-2xl text-[#37474F] font-semibold absolute -top-5 left-1/2 bg-[#CFD8DC] pt-1 pb-1 px-5 transform -translate-x-1/2 rounded-3xl shadow-lg">
                    PrimeCart
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#37474F] mb-5 mt-4">
                    User Login
                </h2>
                <div className="flex justify-center mb-5">
                    <button
                        className={`flex-1 p-2 sm:p-3 text-sm sm:text-md transition-colors duration-300 ease-in-out font-[500] ${userType === "Customer"
                                ? "bg-[#37474F] text-white font-bold"
                                : "bg-[#B0BEC5] text-[#37474F]"
                            } rounded-[10px_0px_0px_10px]`}
                        onClick={() => setuserType("Customer")}
                        id="customerBtn "
                    >
                        Customer
                    </button>
                    <button
                        className={`flex-1 p-2 sm:p-3 text-sm sm:text-md transition-colors duration-300 ease-in-out font-[500] ${userType === "Seller"
                                ? "bg-[#37474F] text-[#FFFFFF] font-bold"
                                : "bg-[#B0BEC5] text-[#37474F]"
                            } rounded-[0px_10px_10px_0px]`}
                        onClick={() => setuserType("Seller")}
                        id="sellerBtn"
                    >
                        Seller
                    </button>
                </div>
                <div className="flex flex-col gap-y-3 items-center">
                    <input
                        onChange={handleOnChange}
                        className="p-3 w-full text-sm sm:text-md rounded-md border-2 border-[#90A4AE] mb-3 focus:outline-none focus:border-[#546E7A]"
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                    />
                    <input
                        onChange={handleOnChange}
                        className="p-3 w-full text-sm sm:text-md rounded-md border-2 border-[#90A4AE] mb-3 focus:outline-none focus:border-[#546E7A]"
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                    />
                    <button
                        onClick={login}
                        className="text-sm sm:text-md py-2 sm:py-3 px-4 mb-3 rounded-md w-full sm:w-fit text-center bg-[#37474F] text-white hover:bg-[#546E7A] active:scale-95 transition-all duration-200"
                        type="submit"
                        id="loginBtn"
                    >
                        Login as {userType}
                    </button>


                    {error && (
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                    )}


                    {userType === "Customer" && (
                        <p
                            className="hover:cursor-pointer text-sm mt-2"
                            onClick={() => {
                                navigate("/");
                            }}
                        >
                            Skip Login
                        </p>
                    )}
                </div>

                <p className="mt-4 text-sm">
                    Don't have an account?{" "}
                    <span
                        onClick={handleRegisterClick}
                        className="text-[#546E7A] hover:underline hover:cursor-pointer"
                    >
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
