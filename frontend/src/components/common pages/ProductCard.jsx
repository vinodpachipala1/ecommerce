import React, { useState } from "react";
import { BASE_URL } from "../path";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

const ProductCard = (props) => {
  const navigate = useNavigate();
  const { product, userid, userType } = props;
  const productId = product.id;

  const [cartMessage, setCartMessage] = useState(null);

  const StockVal = (stock) => {
    if (stock >= 10) {
      return { text: "In Stock", color: "bg-green-400 text-green-900" };
    } else if (stock > 0 && stock < 10) {
      return { text: "Limited Stock", color: "bg-yellow-300 text-yellow-900" };
    } else {
      return { text: "Out of Stock", color: "bg-red-400 text-red-900" };
    }
  };

  const AddtoCart = async (productid, userid) => {
    setCartMessage({ type: "loading", text: "Adding..." });
    try {
      await axios.post(`${BASE_URL}/addtoCart`, { productid, userid }, { withCredentials: true });
      setCartMessage({ type: "success", text: "Added!" });
      setTimeout(() => setCartMessage(null), 2000);
    } catch (err) {
      setCartMessage({ type: "error", text: err.response?.data || "Error" });
      setTimeout(() => setCartMessage(null), 2000);
    }
  };

  if (userid && userid === product.seller_id) {
    return null;
  }

  return (
    <>
      <div className="block sm:hidden w-full max-w-sm rounded-lg border bg-white shadow-sm p-3">
        <div className="flex items-center gap-3">
          <img
            className="w-20 h-20 object-contain rounded-md flex-shrink-0"
            src={product.imageurl || product.image}
            alt={product.pname}
            onClick={() => navigate(`/product/${productId}`, { state: { product } })}
          />
          <div className="flex-1 min-w-0">
            <h4 className="truncate text-xs font-medium text-gray-500">{product.brand}</h4>
            <h3
              className="truncate text-sm font-semibold text-gray-800"
              onClick={() => navigate(`/product/${productId}`, { state: { product } })}
            >
              {product.pname}
            </h3>
            <p className="text-xs text-gray-500">₹ {product.price}</p>
            <span
              className={`mt-1 inline-block text-xs font-medium ${StockVal(product.stock).color.replace(
                "bg-",
                "text-"
              ).replace("-400", "-700")} px-2 py-0.5 rounded ${StockVal(product.stock).color
                .replace("text-", "bg-")
                .replace("-900", "-100")}`}
            >
              {StockVal(product.stock).text}
            </span>
          </div>
        </div>

        {userType === "Customer" ? (
          <div className="flex gap-2 mt-2">
            {cartMessage ? (
              <button
                disabled
                className={`flex-1 text-xs rounded-md py-2 px-2 flex items-center justify-center gap-1 transition-all duration-300 ${cartMessage.type === "success"
                    ? "bg-green-600 text-white"
                    : cartMessage.type === "error"
                      ? "bg-red-600 text-white"
                      : "bg-gray-600 text-white"
                  }`}
              >
                {cartMessage.type === "loading" && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {cartMessage.type === "success" && <HiCheckCircle />}
                {cartMessage.type === "error" && <HiXCircle />}
                <span className="truncate">{cartMessage.text}</span>
              </button>
            ) : (
              <button
                disabled={product.stock <= 0}
                className={`flex-1 text-xs rounded-md py-2 px-2 ${product.stock > 0
                    ? "bg-gray-800 text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                onClick={() => AddtoCart(product.id, userid)}
              >
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            )}
            <button className="rounded-md border w-[30%] px-4 py-1 text-gray-500 hover:text-gray-800 text-md">
              ♡
            </button>
          </div>
        ) : (
          <div className="flex m-2 gap-2 pl-4 pr-4">
            <button
              className="flex-1 rounded-md bg-green-700 text-white py-2 text-xs font-semibold hover:bg-green-800"
              onClick={() =>
                navigate("/editproduct", { state: { product, type: "edit" } })
              }
            >
              Edit
            </button>
            <button
              className="flex-1 rounded-md bg-red-700 text-white py-2 text-xs font-semibold hover:bg-red-800"
              onClick={() => props.deleteProduct(product.id)}
            >
              Delete
            </button>
          </div>
        )}
      </div>


      {/* Desktop View (hidden sm:block) - Unchanged                            */}
      <div className="hidden sm:block w-full max-w-xs overflow-hidden rounded-xl border bg-white shadow-sm hover:cursor-pointer relative">
        <div onClick={() => navigate(`/product/${productId}`, { state: { product } })}>
          <div className="relative flex justify-center items-center">
            <img
              className="h-52 object-contain rounded-md"
              src={product.imageurl || product.image}
              alt={product.pname}
            />
            <span
              className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${StockVal(product.stock).color}`}
            >
              {StockVal(product.stock).text}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div onClick={() => navigate(`/product/${productId}`, { state: { product } })}>
            <div className="flex items-baseline justify-between">
              <h3 className="truncate text-lg font-semibold text-gray-800" title={product.brand}>
                {product.brand}
              </h3>
              {userType === "Customer" && (
                <a href="#" className="text-xs text-gray-500 hover:underline">
                  Sold by {product.seller_name}
                </a>
              )}
            </div>
            <p className="my-2 text-xl font-bold text-gray-900">{product.pname}</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-600">
                ₹ {product.price}
              </span>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            {userType === "Customer" && (
              <>
                {cartMessage ? (
                  <button
                    disabled
                    className={`flex-1 rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${cartMessage.type === "success"
                        ? "bg-green-600 text-white"
                        : cartMessage.type === "error"
                          ? "bg-red-600 text-white"
                          : "bg-gray-600 text-white cursor-wait"
                      }`}
                  >
                    {cartMessage.type === "success" ? (
                      <HiCheckCircle />
                    ) : cartMessage.type === "error" ? (
                      <HiXCircle />
                    ) : (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {cartMessage.text}
                  </button>
                ) : (
                  <button
                    disabled={product.stock <= 0}
                    className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all duration-300 ${product.stock > 0
                        ? "bg-gray-800 text-white hover:bg-gray-900"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    onClick={() => AddtoCart(product.id, userid)}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                )}
                <button className="rounded-md border p-2 text-gray-400 hover:text-gray-800">
                  ♡
                </button>
              </>
            )}
            {userType !== "Customer" && (
              <>
                <button
                  className="rounded-md border p-2 bg-green-800 text-white w-full hover:text-gray-800"
                  onClick={() =>
                    navigate("/editproduct", { state: { product, type: "edit" } })
                  }
                >
                  Edit
                </button>
                <button
                  className="rounded-md border bg-red-800 p-2 text-white w-full hover:text-gray-800"
                  onClick={() => props.deleteProduct(product.id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
