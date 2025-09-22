import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { ArrowUpDown } from 'lucide-react';
import { BASE_URL } from "../path";
import ProductCard from "../common pages/ProductCard";
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
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { name: "All", icon: <HiCollection className="w-5 h-5 inline mr-2" /> },
    { name: "Mobile & Tablets", icon: <HiDeviceMobile className="w-5 h-5 inline mr-2" /> },
    { name: "Laptops & Computers", icon: <HiDesktopComputer className="w-5 h-5 inline mr-2" /> },
    { name: "Electronics", icon: <HiChip className="w-5 h-5 inline mr-2" /> },
    { name: "Fashion", icon: <HiShoppingBag className="w-5 h-5 inline mr-2" /> },
    { name: "Home & Furniture", icon: <HiHome className="w-5 h-5 inline mr-2" /> },
    { name: "Books & Stationery", icon: <HiBookOpen className="w-5 h-5 inline mr-2" /> }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/getProducts`);
        if (res.data) {
          setProducts(res.data.products);
          const uniqueBrands = [...new Set(res.data.products.map(p => p.brand))];
          setBrands(uniqueBrands);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Could not load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);



  const filteredProducts = useMemo(() => {
    let processedProducts = [...products];
    if (selectedCategory !== "All") {
      processedProducts = processedProducts.filter(p => p.category === selectedCategory);
    }
    if (selectedBrands.length > 0) {
      processedProducts = processedProducts.filter(p => selectedBrands.includes(p.brand));
    }
    const minPrice = parseFloat(priceRange.min);
    const maxPrice = parseFloat(priceRange.max);
    if (!isNaN(minPrice)) {
      processedProducts = processedProducts.filter(p => parseFloat(p.price) >= minPrice);
    }
    if (!isNaN(maxPrice)) {
      processedProducts = processedProducts.filter(p => parseFloat(p.price) <= maxPrice);
    }
    switch (sortOption) {
      case "price-asc":
        processedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        processedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      default:
        break;
    }
    return processedProducts;
  }, [products, selectedCategory, selectedBrands, priceRange, sortOption]);

  const handleBrandChange = (e) => {
    const { value, checked } = e.target;
    setSelectedBrands(prev =>
      checked ? [...prev, value] : prev.filter(brand => brand !== value)
    );
  };

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


      <div className="m-6 x-12 mb-6 flex items-center justify-between">

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="p-2 border rounded-md sm:block hidden text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
        >

          <option value="default" > Sort by relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
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
                {brands.map(brand => (
                  <label key={brand} className="flex items-center text-sm gap-2">
                    <input type="checkbox" value={brand} checked={selectedBrands.includes(brand)} onChange={handleBrandChange} className="rounded text-gray-800 focus:ring-gray-800" />
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
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-16">
            <HiExclamationCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="font-semibold text-xl">No products found in this category.</p>
          </div>
        )}
        {!loading && !error && filteredProducts.length > 0 &&
          filteredProducts.map((product) => (
            <ProductCard key={product.id} userType="Customer" userid={user.id} product={product} />
          ))}
      </div>
    </div>
  );
};

export default CustomerHome;
