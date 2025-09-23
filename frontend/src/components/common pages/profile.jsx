import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../path";
import { useOutletContext, useNavigate } from "react-router-dom";
import { HiUserCircle, HiOutlineHome, HiOutlineOfficeBuilding, HiOutlinePencil, HiOutlinePlus } from 'react-icons/hi';

const ProfileSkeleton = () => (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="flex flex-col items-center sm:flex-row gap-6 mb-8 border-b pb-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="space-y-3">
                    <div className="h-7 w-48 bg-gray-300 rounded"></div>
                    <div className="h-5 w-64 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="h-8 w-1/3 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-4">
                <div className="h-16 bg-gray-200 rounded-md"></div>
                <div className="h-16 bg-gray-200 rounded-md"></div>
            </div>
        </div>
    </div>
);

const ProfilePage = () => {
    const { user, isAuthLoading } = useOutletContext();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [addressForm, setAddressForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addressbtn, setAddressBtn] = useState("+ Add New Address")
    const [address, setAddress] = useState({
        name: "",
        phone: "",
        local_address: "",
        pincode: "",
        city: "",
        district: "",
        state: ""
    })

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
        if (isAuthLoading) {
            return;
        }
        if (user && user.id) {
            const getProfile = async () => {

                try {
                    setLoading(true);
                    setError(null);
                    const res = await axios.post(`${BASE_URL}/getProfileDetails`, { userId: user.id }, { withCredentials: true });
                    setProfileData(res.data.ProfleData);
                } catch (err) {
                    console.error("Error fetching profile:", err);
                    setError("Could not load your profile.");
                } finally {
                    setLoading(false);
                }
            }
            getProfile();
        }
        else {
            alert("please login first")
            navigate('/login');
            return;
        }

    }, [user, isAuthLoading, navigate]);

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

    const SaveAddress = async (e) => {
        e.preventDefault();
        if (verifyAddress(address)) {
            try {
                const res = await axios.post(`${BASE_URL}/addAddress`, { address, userId: user.id }, { withCredentials: true });
                console.log(res);
            } catch (err) {
                console.log(err);
            }
        }
    }

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return <div className="text-center p-10 text-red-600">{error}</div>;
    }

    if (!profileData) {
        return <div className="text-center p-10">Could not find profile data.</div>
    }

    return (
        <div className="bg-[#CFD8DC] min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
                <div className="flex flex-col items-center sm:flex-row gap-6 border-b pb-8 mb-8">
                    <HiUserCircle className="w-24 h-24 text-gray-300 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-md text-gray-500">{user.email}</p>
                        <span className="mt-2 inline-block text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            {user.role}
                        </span>
                    </div>
                </div>

                {user.role === 'Seller' && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Store Information</h2>
                        <div className="bg-gray-50 p-6 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <HiOutlineOfficeBuilding className="w-6 h-6 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Store Name</p>
                                    <p className="font-semibold text-gray-800">{profileData[0].store_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <HiOutlineHome className="w-6 h-6 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Business Address</p>
                                    <p className="font-semibold text-gray-800">{profileData[0].business_address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Saved Address</h2>
                    </div>

                    <div className="space-y-4">

                        {profileData?.length > 0 && profileData[0].name ? (
                            profileData.map(addr => (
                                <div key={addr.address_id} className="bg-gray-50 p-4 rounded-lg flex items-start gap-4">
                                    <HiOutlineHome className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{addr.name}</p>
                                        <p className="text-sm text-gray-600">{addr.local_address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">You have no saved addresses.</p>
                        )}
                    </div>
                </div>

                <div className="text-center mt-8 border-t pt-8">
                    <button className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800" onClick={() => { setAddressForm(!addressForm); if (!addressForm) { setAddressBtn("- Close") } else { setAddressBtn("+ Add New Address") } }}>
                        {addressbtn}
                    </button>
                    {addressForm && <div className="md:grid md:grid-cols-2 gap-2 bg-white rounded-md p-5">
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


                        <div className="col-span-2 mb-5 text-center">
                            <button className="p-2 bg-[#4CAF50] text-white rounded-md shadow-md hover:bg-[#43a047] hover:scale-105 active:scale-95 transition-all duration-200" onClick={SaveAddress}>Add</button>
                        </div>

                    </div>}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;