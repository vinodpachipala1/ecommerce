import db from "../server/db.js";

export const addToCartModule = async (userId, productId, quantity) => {
    const existingProduct = await db.query(
        `SELECT * FROM cart WHERE customer_id = $1 AND product_id = $2`,
        [userId, productId]
    );

    if (existingProduct.rows.length > 0) {
        await db.query(
            `UPDATE cart SET quantity = quantity + $1, updated_at = NOW() WHERE customer_id = $2 AND product_id = $3`,
            [quantity, userId, productId]
        );
    } else {
        await db.query(
            `INSERT INTO cart (customer_id, product_id, quantity) VALUES ($1, $2, $3)`,
            [userId, productId, quantity]
        );
    }

    return {
        message: "Product added to cart"
    };
};

export const getCartProductsModule = async (userId) => {
    const result = await db.query(
        `SELECT 
            c.id AS cart_id, c.product_id, c.quantity,
            p.pname, p.price, p.brand, p.stock, p.imageurl, p.image, p.seller_id,
            u.store_name
        FROM cart c
        JOIN products p ON c.product_id = p.id
        JOIN users u ON p.seller_id = u.id
        WHERE c.customer_id = $1 AND p.is_deleted IS NOT TRUE
        ORDER BY c.created_at DESC`,
        [userId]
    );

    return result.rows;
};

export const updateCartQuantityModule = async (userId, productId, quantity) => {
    await db.query(
        `UPDATE cart SET quantity = $1, updated_at = NOW() WHERE customer_id = $2 AND id = $3`,
        [quantity, userId, productId]
    );

    return {
        message: "Cart quantity updated"
    };
};

export const removeCartProductModule = async (cartId) => {
    await db.query(`DELETE FROM cart WHERE id = $1`, [cartId]);

    return {
        message: "Product removed from cart"
    };
};