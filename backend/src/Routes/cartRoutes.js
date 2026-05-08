import express from "express";
import { authenticate } from "../Middleware/auth.js";
import { addToCartController, getCartAndAddressController, 
    updateCartQuantityController, removeCartProductController } from "../Controllers/cartController.js";

export const cartRoutes = express.Router();

cartRoutes.post("/addToCart", authenticate, addToCartController);
cartRoutes.get("/getCartAndAddress", authenticate, getCartAndAddressController);
cartRoutes.put("/updateQuantity", authenticate, updateCartQuantityController);
cartRoutes.delete("/removeCartItem/:productId", authenticate, removeCartProductController);