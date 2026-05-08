import { placeOrderModule, getOrdersModule, getOrderModule } from "../Modules/orderModule.js";

export const placeOrderService = async (customerId, address, cartItems, shipping, payment_method, payment_info) => {
    const orderGroupId = `ORD-${Date.now()}`;
    const result = await placeOrderModule(orderGroupId, customerId, address, cartItems,
         shipping, payment_method, payment_info);
    return result;
};

export const getOrdersService = async (customerId) => {
    const result = await getOrdersModule(customerId);
    return result;
};

export const getOrderService = async (customerId, orderGroupId) => {
    const result = await getOrderModule(customerId, orderGroupId);
    return result;
};