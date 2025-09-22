import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from '../pages/login';
import Register from '../pages/register';
import CustomerHome from '../components/customer/home';
import Seller from '../pages/SellerDashboard';
import Cart from '../components/customer/Cart';
import CustomerDashboard from '../pages/CustomerDashbord';
import Checkout from '../components/customer/CheckOut';
import AddProduct from '../components/seller/addproduct';
import SellerHome from '../components/seller/home';
import ProductDetails from '../components/common pages/ProductDetail';
import OrderSuccess from '../components/customer/OrderSuccess';
import Orders from '../components/customer/Orders';
import OrderDetails from '../components/customer/OrderDetails';
import SellerOrders from '../components/seller/handleOrders';
import ProfilePage from '../components/common pages/profile';
const Router = ()=>{
    return(<BrowserRouter>
    <Routes>
        <Route path='/login' element = {<Login />} />
        <Route path='/register' element = {<Register />} />
        <Route element ={<Seller />} >
            <Route path='/seller/home' element = {<SellerHome />} />
            <Route path='/addproduct' element = {<AddProduct />} />
            <Route path='/editproduct' element = {<AddProduct />} />
            <Route path='/seller/orders' element={<SellerOrders />} />
            <Route path='seller/profile' element={<ProfilePage />} />
        </Route>
        <Route element={<CustomerDashboard />}>
            <Route path="/" element={<CustomerHome />} />
            <Route path="/cart" element={<Cart />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/ordersuccess' element={<OrderSuccess />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/order/:orderGroupId' element={<OrderDetails />} />
            <Route path='/product/:productId' element={<ProductDetails />} />
            <Route path='/profile' element={<ProfilePage />} />
        </Route>
        
    </Routes>
    </BrowserRouter>)
}
export default Router;