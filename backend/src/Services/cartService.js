import { addToCartModule, getCartProductsModule, updateCartQuantityModule, removeCartProductModule } from "../Modules/cartModule.js";
import { getAddressModule } from "../Modules/userModule.js";

export const addToCartService = async (userId, productId, quantity) => {
    const result = await addToCartModule(userId, productId, quantity);
    return result;
};

export const getCartAndAddressService = async (userId) => {
    const cart = await getCartProductsModule(userId);
    const address = await getAddressModule(userId);

    return {
        cart,
        address
    };
};

export const updateCartQuantityService = async (userId, productId, quantity) => {
    const result = await updateCartQuantityModule(userId, productId, quantity);
    return result;
};

export const removeCartProductService = async (cartId) => {
    console.log(cartId);
    const result = await removeCartProductModule(cartId);
    return result;
};