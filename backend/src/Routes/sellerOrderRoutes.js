import express from "express";
import { authenticate } from "../Middleware/auth.js";
import { getOrdersReceivedController, updateOrderStatusController } from "../Controllers/sellerOrderController.js";

export const sellerOrderRoutes = express.Router();

sellerOrderRoutes.get("/getOrdersReceived", authenticate, getOrdersReceivedController);
sellerOrderRoutes.put("/updateOrderStatus", authenticate, updateOrderStatusController);