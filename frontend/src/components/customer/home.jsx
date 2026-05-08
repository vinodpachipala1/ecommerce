import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

import { BASE_URL } from "../path";
import ProductCard from "../common pages/ProductCard";
import { socket } from "../socket";
import {
  HiExclamationCircle,
  HiDeviceMobile,
  HiDesktopComputer,
  HiChip,
  HiShoppingBag,
  HiHome,
  HiBookOpen,
  HiCollection,
  HiX,
  HiFilter,
} from "react-icons/hi";

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

const CustomerHome = () => {
  const { user } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { name: "All", icon: <HiCollection className="w-5 h-5 inline mr-2" /> },
    { name: "Mobile & Tablets", icon: <HiDeviceMobile className="w-5 h-5 inline mr-2" /> },
    { name: "Laptops & Computers", icon: <HiDesktopComputer className="w-5 h-5 inline mr-2" /> },
    { name: "Electronics", icon: <HiChip className="w-5 h-5 inline mr-2" /> },
    { name: "Fashion", icon: <HiShoppingBag className="w-5 h-5 inline mr-2" /> },
    { name: "Home & Furniture", icon: <HiHome className="w-5 h-5 inline mr-2" /> },
    { name: "Books & Stationery", icon: <HiBookOpen className="w-5 h-5 inline mr-2" /> }
  ];

  const [search, setSearch] = useState("");

  const fetchProducts = async (
    searchValue = "",
    currentPage = page
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/product/getProducts`, {
        params: {
          search: searchValue,
          selectedCategory,
          min: priceRange.min,
          max: priceRange.max,
          brand: selectedBrand,
          sort: sortOption,
          page: currentPage
        }, headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res.data)
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError("Error loading products");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, priceRange, sortOption, page, selectedBrand]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sortOption, priceRange, search, selectedBrand]);

  const fetchBrands = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/product/getBrands`,
        {
          params: {
            search,
            selectedCategory,
            min: priceRange.min,
            max: priceRange.max
          }
        }
      );

      setBrands(
        res.data.brands.map(
          (b) => b.brand
        )
      );

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    search,
    selectedCategory,
    priceRange
  ]);

  const handleBrandChange = (brand) => {
    if (selectedBrand === brand) {
      setSelectedBrand("All");
    } else {
      setSelectedBrand(brand);
    }
  };

  useEffect(() => {
    socket.on("productAdded", (newProduct) => {
      setProducts((prev) => [newProduct, ...prev]);
    });

    socket.on("productDeleted", ({ productId }) => {
      setProducts((prev) =>
        prev.filter((p) => p.id !== productId)
      );
    });

    socket.on(
      "stockUpdated",
      ({ productId, stock }) => {
        setProducts((prevProducts) =>
          prevProducts.map((product) => product.id === productId ? {
            ...product, stock
          } : product
          )
        );
      });

    return () => {
      socket.off("productAdded");
      socket.off("productDeleted");
      socket.off("stockUpdated");
    };
  }, []);


  return (
    <div>

      <div className="sticky top-16 z-40 bg-[#CFD8DC] border-b border-gray-300">
        <div className="overflow-x-auto">
          <div className="flex bg-white whitespace-nowrap">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full sm:py-4 text-sm sm:text-md py-2 min-w-48 border border-gray-300 shadow-sm font-medium transition flex items-center justify-center
                ${selectedCategory === cat.name
                    ? "bg-gray-800 text-white border-gray-800 shadow-md"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow-md"
                  }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchProducts(search);
            }
          }}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
        />

        <button
          onClick={() => fetchProducts(search)}
          className="px-5 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        >
          Search
        </button>
      </div>

      <div className="m-6 x-12 mb-6 flex items-center justify-between">

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="p-2 border rounded-md sm:block hidden text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
        >

          <option value="" > Sort by relevance</option>
          <option value="ASC">Price: Low to High</option>
          <option value="DESC">Price: High to Low</option>
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="block sm:hidden w-16 px-1 py-1 border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-gray-800"
        >
          <option value="default">Sort</option>
          <option value="price-asc">Low → High</option>
          <option value="price-desc">High → Low</option>
        </select>

        <h2 className="text-center font-bold text-lg  sm:text-2xl">
          {selectedCategory === "All" ? "All Products" : selectedCategory}
        </h2>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 p-2 border rounded-md text-sm font-semibold bg-white hover:bg-gray-100"
        >
          <HiFilter /> <span className="hidden sm:block">Filters</span>
        </button>
      </div>

      <div className={`fixed top-0 right-0 h-full w-full z-50 transition-transform duration-300 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}></div>
        <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Filters</h3>
            <button onClick={() => setIsFilterOpen(false)}><HiX className="w-6 h-6" /></button>
          </div>
          <div className="space-y-6">
            <div>
              <p className="font-semibold text-sm mb-2">Price Range</p>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} className="w-full p-2 border rounded-md text-sm" />
                <span>-</span>
                <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} className="w-full p-2 border rounded-md text-sm" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">Brands</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {brands.map((brand) => (

                  <label
                    key={brand}
                    className="flex items-center text-sm gap-2 cursor-pointer"
                  >

                    <input
                      type="checkbox"
                      checked={selectedBrand === brand}
                      onChange={() => handleBrandChange(brand)}
                      className="rounded text-gray-800 focus:ring-gray-800"
                    />

                    {brand}

                  </label>

                ))}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Products / Skeleton / Error / Empty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center gap-5 m-6">
        {loading && Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)}
        {!loading && error && (
          <div className="col-span-full flex flex-col items-center justify-center text-center text-red-600 bg-red-50 p-8 rounded-lg">
            <HiExclamationCircle className="w-12 h-12 mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-16">
            <HiExclamationCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="font-semibold text-xl">No products found in this category.</p>
          </div>
        )}
        {!loading && !error && products.length > 0 &&
          products.map((product) => (
            <ProductCard key={product.id} userType="Customer" userid={user?.id} product={product} />
          ))}
      </div>

      <div className="flex justify-center items-center gap-3 mb-10">

        <button
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
          className={`px-4 py-2 rounded-md border
      ${page === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"}
    `}
        >
          Prev
        </button>

        <span className="font-semibold">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(prev => prev + 1)}
          className={`px-4 py-2 rounded-md border
          ${page === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"}
          `}
        >
          Next
        </button>

      </div>
    </div>
  );
};

export default CustomerHome;