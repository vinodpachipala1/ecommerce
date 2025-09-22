import axios from "axios";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { BASE_URL } from "../path";
import ProductCard from "../common pages/ProductCard";
import { HiExclamationCircle } from "react-icons/hi";

const ProductCardSkeleton = () => (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="relative h-52 w-full animate-pulse bg-gray-200"></div>
        <div className="p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-2 h-6 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="mt-4 h-5 w-1/4 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-5 h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
        </div>
    </div>
);

const SellerHome = () => {
    const { user } = useOutletContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getProducts = async () => {
            if (user?.role === "Seller") {
                try {
                    setLoading(true);
                    setError(null);
                    const res = await axios.post(`${BASE_URL}/getSellerProducts`, { seller: user.id }, { withCredentials: true });
                    setProducts(res.data.products);
                } catch (err) {
                    console.log(err);
                    setError("Could not load your products. Please try again.");
                } finally {
                    setLoading(false);
                }
            }
        }
        if(user) {
            getProducts();
        }
    }, [user]);

    const deleteProduct = async (productid) => {
        setProducts(prev => prev.filter(product => product.id !== productid));
        try {
            await axios.delete(`${BASE_URL}/deleteProduct`, { data: { productid }, withCredentials: true });
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center gap-5 m-2 md:m-12 mt-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))
                ) : error ? (
                    <div className="col-span-full flex flex-col items-center justify-center text-center text-red-600 bg-red-50 p-8 rounded-lg">
                        <HiExclamationCircle className="w-12 h-12 mb-2" />
                        <p className="font-semibold">{error}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-16">
                        <p className="font-semibold text-xl">You haven't added any products yet.</p>
                        <p className="mt-2">Click the "Add" button below to get started.</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            userType={user.role} 
                            product={product} 
                            deleteProduct={deleteProduct} 
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default SellerHome;