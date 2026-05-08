import express from 'express';
import { authenticate, optionalAuth } from "../Middleware/auth.js";

import { getallProductsController, getBrandsController } from '../Controllers/productController.js';


export const productRoutes = express.Router();

productRoutes.get('/getProducts', optionalAuth, getallProductsController);
productRoutes.get('/getBrands', getBrandsController);