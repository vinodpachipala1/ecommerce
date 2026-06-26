import express from 'express';
import { authenticate } from "../Middleware/auth.js";
import { upload } from "../Middleware/ProcessingImage.js";

import { getallProductsController, deleteProductsController, addProductConrtoller, updateProductConrtoller } from "../Controllers/sellerProductController.js";

export const sellerProductsRoutes = express.Router();

sellerProductsRoutes.get('/getallProducts', authenticate, getallProductsController);
sellerProductsRoutes.delete('/deleteProduct', authenticate, deleteProductsController);
sellerProductsRoutes.post('/addProduct', authenticate,  upload.single("image"), addProductConrtoller);
sellerProductsRoutes.put(`/updateProductDetails/:id`, authenticate,  upload.single("image"), updateProductConrtoller); 