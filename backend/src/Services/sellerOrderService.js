import { getOrdersReceivedModule, updateOrderStatusModule } from "../Modules/sellerOrderModule.js";
import { io } from "../../server.js";

export const getOrdersReceivedService = async (sellerId) => {
    const result = await getOrdersReceivedModule(sellerId);
    return result;
};

export const updateOrderStatusService = async (orderId, newStatus) => {
    const result = await updateOrderStatusModule(orderId, newStatus);
    io.emit("orderStatusUpdated", {
        orderId,
        newStatus
    });
    return result;
};