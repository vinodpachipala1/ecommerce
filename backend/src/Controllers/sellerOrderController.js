import { getOrdersReceivedService, updateOrderStatusService } from "../Services/sellerOrderService.js";
import { processProductsWithImages } from "../Middleware/ProcessingImage.js";

export const getOrdersReceivedController = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const result = await getOrdersReceivedService(sellerId);
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

export const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;
        const result = await updateOrderStatusService(orderId, newStatus);

        res.send(result);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: err.message
        });
    }
};