import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../path";
import { useOutletContext, useLocation } from "react-router-dom";

const AddProduct = (props) => {
    const location = useLocation();
    const { product, type } = location.state || {}

    const { user } = useOutletContext();
    const [productdetails, setproductDetails] = useState({
        category: "",
        pname: "",
        price: "",
        brand: "",
        stock: "",
        imageurl: "",
        description: "",
        warranty_guarantee: "",
        weight: "",
        image: null,
        tags: []
    })

    const [Errors, setErrors] = useState({
        category: "",
        pname: "",
        price: "",
        brand: "",
        stock: "",
        imageurl: "",
        description: "",
        warranty_guarantee: "",
        weight: "",
        image: "",
        tags: ""
    })

    useEffect(() => {
        if (type === 'edit' && product) {
            setproductDetails({
                ...product,
                tags: product.tags || [],
                image: null
            });
            setSections(product.sections || [{ title: "", content: "" }]);
        }
    }, [product, type]);

    const handleChange = (e) => {
        const { name, value, files, type } = e.target;
        setproductDetails((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value
        }))
        setErrors((prev) => ({
            ...prev, [name]: ""
        }))
    }


    const [tagInput, setTagInput] = useState("");


    const handleTagKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const newTag = tagInput.trim();

            if (newTag && !productdetails.tags.includes(newTag)) {
                setproductDetails((prev) => ({
                    ...prev,
                    tags: [...prev.tags, newTag],
                }));
                setErrors((prev) => ({ ...prev, tags: "" }));
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setproductDetails((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };



    const [sections, setSections] = useState([
        { title: "", content: "" }
    ]);

    const handleSecChange = (index, field, value) => {
        const newSections = [...sections];
        newSections[index][field] = value;
        setSections(newSections);
    };

    const addSection = () => {
        setSections([...sections, { title: "", content: "" }]);
    };

    const removeSection = (index) => {
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
    };

    const verify = () => {
        var isValid = true;
        if (!productdetails.category) {
            setErrors((prev) => ({ ...prev, category: "Please select a category" }));
            isValid = false;
        }

        if (!productdetails.pname || productdetails.pname.length < 3) {
            setErrors((prev) => ({ ...prev, pname: "Name must be at least 3 characters" }));
            isValid = false;
        }

        if (!productdetails.price || productdetails.price <= 1) {
            setErrors((prev) => ({ ...prev, price: "Price must be greater than 1" }));
            isValid = false;
        }

        if (!productdetails.brand) {
            setErrors((prev) => ({ ...prev, brand: "Brand name is required" }));
            isValid = false;
        }

        if (!productdetails.stock || productdetails.stock < 1) {
            setErrors((prev) => ({ ...prev, stock: "Stock must be at least 1" }));
            isValid = false;
        }

        if ((!productdetails.imageurl || !/^https?:\/\/.+(\.(jpg|jpeg|png|webp|gif)(\?.*)?)?$/i.test(productdetails.imageurl)) && !productdetails.image) {
            setErrors((prev) => ({ ...prev, imageurl: "Valid image URL is required" }));
            isValid = false;
        }

        if (!productdetails.description || productdetails.description.trim().length < 10) {
            setErrors((prev) => ({ ...prev, description: "Description must be at least 10 characters long" }));
            isValid = false;
        }

        if (!productdetails.warranty_guarantee) {
            setErrors((prev) => ({ ...prev, warranty_guarantee: "Warranty/Guarantee details required" }));
            isValid = false;
        }

        if (!productdetails.weight || productdetails.weight <= 0) {
            setErrors((prev) => ({ ...prev, weight: "Weight must be a positive number" }));
            isValid = false;
        }

        if (!productdetails.tags || productdetails.tags.length < 3) {
            setErrors((prev) => ({ ...prev, tags: "Please provide at least 3 tags/keywords" }));
            isValid = false;
        }
        return isValid;
    }

    const createProductFormData = (productdetails, sections, userid) => {
        const formData = new FormData();

        formData.append("userid", userid);
        if (productdetails.image instanceof File) {
            formData.append("image", productdetails.image);
            formData.append("imageurl", "");
        } else {
            formData.append("imageurl", productdetails.imageurl);
        }

        formData.append("category", productdetails.category);
        formData.append("pname", productdetails.pname);
        formData.append("price", productdetails.price);
        formData.append("brand", productdetails.brand);
        formData.append("stock", productdetails.stock);
        formData.append("description", productdetails.description);
        formData.append("warranty_guarantee", productdetails.warranty_guarantee);
        formData.append("weight", productdetails.weight);

        formData.append("tags", JSON.stringify(productdetails.tags));
        formData.append("sections", JSON.stringify(sections));

        return formData;
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (verify()) {
            const formData = createProductFormData(productdetails, sections, user.id);
            try {
                const res = await axios.post(`${BASE_URL}/addproduct`, formData);
                alert("Product added successfully!");
            } catch (err) {
                console.log(err);
                alert("Failed to add product.");
            }
        }
    };

    const editproduct = async (e) => {
        console.log("hello");
        e.preventDefault();
        if (verify()) {
            const formData = createProductFormData(productdetails, sections, user.id);
            try {
                const res = await axios.put(`${BASE_URL}/updateProductDetails/${productdetails.id}`, formData);
                alert("Product details updated successfully!");
            } catch (err) {
                console.log(err);
                alert("Failed to update product.");
            }
        }
    }


    return (
        // Main container with a light gray background for the page
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl">
                {/* Form Header */}
                <div className="p-8 border-b border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 text-center">
                        {type === "edit" ? "Edit Product Details" : "Add a New Product"}
                    </h2>
                    <p className="text-center text-gray-500 mt-2">
                        Please fill out the form to {type === "edit" ? "update the" : "add a new"} product.
                    </p>
                </div>

                <div className="p-8 space-y-8">
                    <div className="p-6 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-6">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Category *</label>
                                <select
                                    name="category"
                                    onChange={handleChange}
                                    value={productdetails.category}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                >
                                    <option value="">Select a Category</option>
                                    <option value="Mobile & Tablets">Mobile & Tablets</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Home & Furniture">Home & Furniture</option>
                                    <option value="Laptops & Computers">Laptops & Computers</option>
                                    <option value="Books & Stationery">Books & Stationery</option>
                                </select>
                                {Errors.category && <p className="text-red-500 text-xs mt-1">{Errors.category}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Brand *</label>
                                <input type="text" name="brand" onChange={handleChange} value={productdetails.brand}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                                {Errors.brand && <p className="text-red-500 text-xs mt-1">{Errors.brand}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Product Name *</label>
                                <input name="pname" onChange={handleChange} value={productdetails.pname}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                                {Errors.pname && <p className="text-red-500 text-xs mt-1">{Errors.pname}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-6">Pricing & Stock</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Price *</label>
                                <input type="number" name="price" onChange={handleChange} value={productdetails.price}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                                {Errors.price && <p className="text-red-500 text-xs mt-1">{Errors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Stock *</label>
                                <input type="number" name="stock" onChange={handleChange} value={productdetails.stock}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                                {Errors.stock && <p className="text-red-500 text-xs mt-1">{Errors.stock}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-lg space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700">Media & Description</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Image *</label>
                            <div className="flex flex-col gap-4">
                                <input name="imageurl" onChange={handleChange} value={productdetails.imageurl} placeholder="Paste image URL here"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                                <div className="flex items-center justify-center w-full">
                                    <span className="text-gray-400 text-sm">OR</span>
                                </div>
                                <input type="file" name="image" onChange={handleChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                            {Errors.imageurl && <p className="text-red-500 text-xs mt-1">{Errors.imageurl}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Description *</label>
                            <textarea name="description" rows="5" onChange={handleChange}value={productdetails.description}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                        {Errors.description && <p className="text-red-500 text-xs mt-1">{Errors.description}</p>}
                    </div>

                    <div className="p-6 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-6">Additional Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Warranty / Guarantee *</label>
                                <input name="warranty_guarantee" onChange={handleChange} value={productdetails.warranty_guarantee}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                                {Errors.warranty_guarantee && <p className="text-red-500 text-xs mt-1">{Errors.warranty_guarantee}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Weight (kg) *</label>
                                <input type="number" name="weight" step="0.01" onChange={handleChange} value={productdetails.weight}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                />
                                {Errors.weight && <p className="text-red-500 text-xs mt-1">{Errors.weight}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Specifications</h3>
                        <div className="space-y-4">
                            {sections.map((section, index) => (
                                <div key={index} className="p-4 rounded-lg bg-gray-50 border relative">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input type="text" placeholder="Section Title (e.g. Display)" value={section.title} onChange={(e) => handleSecChange(index, "title", e.target.value)}
                                            className="md:col-span-1 w-full border-gray-300 rounded-md p-2"
                                        />
                                        <textarea rows="3" placeholder="Section Content..." value={section.content} onChange={(e) => handleSecChange(index, "content", e.target.value)}
                                            className="md:col-span-2 w-full border-gray-300 rounded-md p-2"
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeSection(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                                    >
                                        &#x2715;
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addSection}
                            className="mt-4 w-full px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition"
                        >
                            + Add Specification
                        </button>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-lg">
                        <label className="block text-lg font-semibold text-gray-700 mb-4">
                            Tags / Keywords *
                        </label>
                        <div className="border border-gray-300 rounded-lg p-3 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-indigo-500 transition">
                            {productdetails.tags.map((tag, index) => (
                                <div key={index} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
                                    <span>{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="font-bold text-indigo-500 hover:text-indigo-800"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <input
                                type="text"
                                className="flex-grow p-1 outline-none bg-transparent"
                                placeholder={
                                    productdetails.tags.length < 3 ? "Add at least 3 tags..." : "Add more tags..."
                                }
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                            />
                        </div>
                        {Errors.tags && <p className="text-red-500 text-xs mt-1">{Errors.tags}</p>}
                    </div>
                </div>

                <div className="p-8 border-t border-gray-200 flex justify-center">
                    <button
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-10 py-3 rounded-lg shadow-lg hover:opacity-90 active:scale-95 transition-transform"
                        onClick={type === 'edit' ? editproduct : handleAddProduct}
                    >
                        {type === 'edit' ? 'Update Product' : 'Add Product to Store'}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default AddProduct;