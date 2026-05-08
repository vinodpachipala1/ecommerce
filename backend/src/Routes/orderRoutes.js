import express from "express";
import { authenticate } from "../Middleware/auth.js";
import { placeOrderController, getOrdersController, getOrderController } from "../Controllers/orderController.js";

export const orderRoutes = express.Router();

orderRoutes.post("/placeOrder", authenticate, placeOrderController);
orderRoutes.get("/getOrders", authenticate, getOrdersController);
orderRoutes.get("/getOrder/:orderGroupId", authenticate, getOrderController);