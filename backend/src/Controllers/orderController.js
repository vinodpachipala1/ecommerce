import { placeOrderService, getOrdersService, getOrderService } from "../Services/orderService.js";
import { processProductsWithImages } from "../Middleware/ProcessingImage.js";

export const placeOrderController = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { address, cartItems, shipping, payment_method, payment_info } = req.body;

        const result = await placeOrderService(customerId, address, cartItems, shipping, payment_method, payment_info);

        res.status(201).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
};

export const getOrdersController = async (req, res) => {
    try {
        const customerId = req.user.id;
        const result = await getOrdersService(customerId);
        const ordersWithImages = processProductsWithImages(result);

        res.send({
            orders: ordersWithImages
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: err.message
        });
    }
};

export const getOrderController = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { orderGroupId } = req.params;

        const result = await getOrderService(customerId, orderGroupId);
        const orderWithImages = processProductsWithImages(result);

        res.send({
            order: orderWithImages
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: err.message
        });
    }
};