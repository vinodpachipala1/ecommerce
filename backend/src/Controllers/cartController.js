import { addToCartService, getCartAndAddressService, updateCartQuantityService, removeCartProductService } from "../Services/cartService.js";
import { processProductsWithImages } from "../Middleware/ProcessingImage.js";

export const addToCartController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const result = await addToCartService(userId, productId, quantity);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

export const getCartAndAddressController = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await getCartAndAddressService(userId);
        const productsWithImages = processProductsWithImages(result.cart);

        res.status(200).json({
            cart: productsWithImages,
            address: result.address
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
};

export const updateCartQuantityController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cartId, quantity } = req.body;

        const result = await updateCartQuantityService(userId, cartId, quantity);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

export const removeCartProductController = async (req, res) => {
    try {
        const cartId = req.params.productId;
        const result = await removeCartProductService(cartId);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};