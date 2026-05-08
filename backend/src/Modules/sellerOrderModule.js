import db from "../server/db.js";

export const getOrdersReceivedModule = async (sellerId) => {
    const result = await db.query(
        `SELECT
            o.*,
            u.name AS customer_name,
            p.pname AS product_name, p.image, p.imageurl
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        LEFT JOIN products p ON p.id = o.product_id
        WHERE o.seller_id = $1
        ORDER BY o.created_at DESC`,
        [sellerId]
    );

    return result.rows;
};

export const updateOrderStatusModule = async (orderId, newStatus) => {
    await db.query(
        `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, orderId]
    );

    return {
        message: "Order status updated"
    };
};