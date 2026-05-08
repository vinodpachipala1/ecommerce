import express from 'express';
import { authenticate } from "../Middleware/auth.js";

import { getallProductsController, getBrandsController } from '../Controllers/productController.js';


export const productRoutes = express.Router();

productRoutes.get('/getProducts', getallProductsController);
productRoutes.get('/getBrands', getBrandsController);