import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../path";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";

const FormField = ({ label, name, value, onChange, children, error, type = "text" }) => (
    <div className="sm:col-span-1 col-span-2">
        <label className="font-semibold text-gray-700 mb-1 block">{label} *</label>
        {children ? (
            React.cloneElement(children, { name, value, onChange, className: "w-full text-base border p-2 rounded-md border-gray-300 focus:ring-2 focus:ring-purple-500" })
        ) : (
            <input type={type} name={name} value={value} onChange={onChange} className="w-full text-base border p-2 rounded-md border-gray-300 focus:ring-2 focus:ring-purple-500"/>
        )}
        {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
);

const AddProduct = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product, type } = location.state || {};
    const { user } = useOutletContext();
    
    const [productdetails, setproductDetails] = useState({
        category: "", pname: "", price: "", brand: "", stock: "", imageurl: "",
        description: "", warranty_guarantee: "", weight: "", image: null, tags: []
    });
    const [Errors, setErrors] = useState({});
    const [tagInput, setTagInput] = useState("");
    const [sections, setSections] = useState([{ title: "", content: "" }]);

    useEffect(() => {
        if (type === 'edit' && product) {
            setproductDetails({
                ...product,
                tags: product.tags || [],
                image: null 
            });
            setSections(product.sections && product.sections.length > 0 ? product.sections : [{ title: "", content: "" }]);
        }
    }, [product, type]);

    const handleChange = (e) => {
        const { name, value, files, type } = e.target;
        setproductDetails((prev) => ({
            ...prev, [name]: type === "file" ? files[0] : value
        }));
        setErrors((prev) => ({...prev, [name]: "" }));
    };

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
        let isValid = true;
        const newErrors = {};
        if (!productdetails.category) {
            newErrors.category = "Please select a category";
            isValid = false;
        }
        if (!productdetails.pname || productdetails.pname.length < 3) {
            newErrors.pname = "Name must be at least 3 characters";
            isValid = false;
        }
        if (!productdetails.price || productdetails.price <= 1) {
            newErrors.price = "Price must be greater than 1";
            isValid = false;
        }
        if (!productdetails.brand) {
            newErrors.brand = "Brand name is required";
            isValid = false;
        }
        if (!productdetails.stock || productdetails.stock < 1) {
            newErrors.stock = "Stock must be at least 1";
            isValid = false;
        }
        if ((!productdetails.imageurl) && !productdetails.image) {
            newErrors.imageurl = "An image URL or file upload is required";
            isValid = false;
        }
        if (!productdetails.warranty_guarantee) {
            newErrors.warranty_guarantee = "Warranty/Guarantee details required";
            isValid = false;
        }
        if (!productdetails.description || productdetails.description.length <= 11) {
            newErrors.description = "Description is required and must be at least 10 characters";
            isValid = false;
        }
        if (!productdetails.weight || productdetails.weight <= 0) {
            newErrors.weight = "Weight must be a positive number";
            isValid = false;
        }
        if (!productdetails.tags || productdetails.tags.length < 3) {
            newErrors.tags = "Please provide at least 3 tags/keywords";
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const createProductFormData = (productData, sectionsData, userid) => {
        const formData = new FormData();
        formData.append("userid", userid);
        if (productData.image instanceof File) {
            formData.append("image", productData.image);
            formData.append("imageurl", "");
        } else {
            formData.append("imageurl", productData.imageurl);
        }
        formData.append("category", productData.category);
        formData.append("pname", productData.pname);
        formData.append("price", productData.price);
        formData.append("brand", productData.brand);
        formData.append("stock", productData.stock);
        formData.append("description", productData.description);
        formData.append("warranty_guarantee", productData.warranty_guarantee);
        formData.append("weight", productData.weight);
        formData.append("tags", JSON.stringify(productData.tags));
        formData.append("sections", JSON.stringify(sectionsData));
        return formData;
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (verify()) {
            const formData = createProductFormData(productdetails, sections, user.id);
            try {
                await axios.post(`${BASE_URL}/addproduct`, formData);
                alert("Product added successfully!");
                navigate('/seller/home');
            } catch (err) {
                console.log(err);
                alert("Failed to add product.");
            }
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        if (verify()) {
            const formData = createProductFormData(productdetails, sections, user.id);
            try {
                await axios.put(`${BASE_URL}/updateProductDetails/${productdetails.id}`, formData);
                alert("Product details updated successfully!");
                navigate('/seller/home');
            } catch (err) {
                console.log(err);
                alert("Failed to update product.");
            }
        }
    };

    return (
        <div className="bg-white p-4 sm:p-8 max-w-2xl mx-auto my-8 rounded-lg shadow-lg">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">
                {type === 'edit' ? 'Edit Product' : 'Add a New Product'}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                
                <FormField label="Product Category" name="category" value={productdetails.category} onChange={handleChange} error={Errors.category}>
                    <select>
                        <option value="">Select Category</option>
                        <option value="Mobile & Tablets">Mobile & Tablets</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Home & Furniture">Home & Furniture</option>
                        <option value="Laptops & Computers">Laptops & Computers</option>
                        <option value="Books & Stationery">Books & Stationery</option>
                    </select>
                </FormField>

                <FormField label="Brand" name="brand" value={productdetails.brand} onChange={handleChange} error={Errors.brand} />
                
                <div className="col-span-2">
                  <FormField label="Product Name" name="pname" value={productdetails.pname} onChange={handleChange} error={Errors.pname} />
                </div>
                
                <FormField label="Price" name="price" value={productdetails.price} onChange={handleChange} error={Errors.price} type="number"/>

                <FormField label="Stock" name="stock" value={productdetails.stock} onChange={handleChange} error={Errors.stock} type="number"/>
                
                <FormField label="Weight (kg)" name="weight" value={productdetails.weight} onChange={handleChange} error={Errors.weight} type="number" step="0.01"/>
                
                <FormField label="Warranty / Guarantee" name="warranty_guarantee" value={productdetails.warranty_guarantee} onChange={handleChange} error={Errors.warranty_guarantee} />
            
                <div className="col-span-2">
                    <label className="font-semibold text-gray-700 mb-1 block">Image *</label>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input placeholder="Image URL" className="flex-grow text-base border p-2 rounded-md w-full border-gray-300" name="imageurl" onChange={handleChange} value={productdetails.imageurl}/>
                        <span className="font-semibold text-gray-500 my-2 sm:my-0">OR</span>
                        <input type="file" name="image" onChange={handleChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                    </div>
                    {Errors.imageurl && <span className="text-red-500 text-sm mt-1">{Errors.imageurl}</span>}
                </div>
                
                <div className="col-span-2">
                    <label className="font-semibold text-gray-700 mb-1 block">Description *</label>
                    <textarea className="w-full text-base border p-2 rounded-md border-gray-300 focus:ring-2 focus:ring-purple-500" name="description" rows="4" onChange={handleChange} value={productdetails.description} />
                    {Errors.description && <span className="text-red-500 text-sm mt-1">{Errors.description}</span>}
                </div>
                
                <div className="col-span-2">
                    <label className="font-semibold text-gray-700 mb-1 block">Tags / Keywords (press Enter to add) *</label>
                    <div className="border p-2 rounded-md flex flex-wrap gap-2 items-center border-gray-300">
                        {productdetails.tags.map((tag, index) => (
                            <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-2 text-sm">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="font-bold text-purple-600 hover:text-purple-900">&times;</button>
                            </div>
                        ))}
                        <input type="text" className="flex-grow p-1 outline-none text-sm" placeholder={productdetails.tags.length < 3 ? "Add at least 3 tags..." : "Add more tags..."} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} />
                    </div>
                    {Errors.tags && <span className="text-red-500 text-sm mt-1">{Errors.tags}</span>}
                </div>

                <div className="col-span-2">
                    <h3 className="font-semibold text-gray-700 mb-2">Product Details Sections</h3>
                    {sections.map((section, index) => (
                        <div key={index} className="border p-3 rounded-md mb-2 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-center gap-2"> 
                                <input type="text" placeholder="Section Title (e.g. Specifications)" value={section.title} onChange={(e) => handleSecChange(index, "title", e.target.value)} className="w-full sm:w-1/3 border rounded-md p-2 text-sm" />
                                <textarea rows="3" placeholder="Section Content" value={section.content} onChange={(e) => handleSecChange(index, "content", e.target.value)} className="w-full border rounded-md p-2 text-sm" />
                            </div>
                            <div className="flex justify-end mt-2">
                                <button type="button" onClick={() => removeSection(index)} className="text-red-500 text-xs font-semibold hover:underline">Remove Section</button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addSection} className="w-full mt-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-semibold">+ Add Section</button>
                </div>

                <div className="col-span-2 justify-center flex mt-6">
                    <button 
                        type="button" 
                        className="w-full sm:w-auto bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white px-8 py-3 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-transform duration-150 font-semibold text-lg" 
                        onClick={type === 'edit' ? handleUpdateProduct : handleAddProduct}
                    >
                        {type === 'edit' ? 'Update Product' : 'Add Product'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddProduct;