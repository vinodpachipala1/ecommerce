import db from "../server/db.js";
import { io } from "../../server.js";

export const placeOrderModule = async (orderGroupId, customerId, address, cartItems, shipping, payment_method, payment_info) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        for (const item of cartItems) {
            const productResult = await client.query(
                `SELECT stock, price FROM products WHERE id = $1`,
                [item.product_id]
            );

            const product = productResult.rows[0];
            const currentStock = product?.stock;
            const actualPrice = product?.price;

            if (currentStock === undefined) {
                throw new Error("Product not found");
            }

            if (item.quantity > currentStock) {
                throw new Error(`${item.pname} is out of stock`);
            }

            await client.query(
                `INSERT INTO orders (order_group_id, customer_id, product_id, quantity, 
                price, address, shipping, payment_method, payment_status, payment_info, seller_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [orderGroupId, customerId, item.product_id, item.quantity, actualPrice, address, 
                    shipping, payment_method, "successful", payment_info, item.seller_id]
            );

            const updated = await client.query(
                `UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2 RETURNING stock`,
                [item.quantity, item.product_id]
            );

            const newStock = updated.rows[0].stock;

            io.emit("stockUpdated", {
                productId: item.product_id,
                stock: newStock
            });

            await client.query(`DELETE FROM cart WHERE id = $1`, [item.cart_id]);
        }

        await client.query("COMMIT");
        io.emit("newOrder", { orderGroupId });
        return {
            message: "Order placed successfully!",
            orderId: orderGroupId
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const getOrdersModule = async (customerId) => {
    const result = await db.query(
        `SELECT 
            o.id, o.order_group_id, o.product_id, o.quantity, o.price, o.address, 
            o.shipping, o.payment_method, o.payment_status, o.payment_info, o.status, 
            o.created_at, p.image, p.imageurl
        FROM orders o
        LEFT JOIN products p ON p.id = o.product_id
        WHERE o.customer_id = $1
        ORDER BY o.created_at DESC`,
        [customerId]
    );

    return result.rows;
};

export const getOrderModule = async (customerId, orderGroupId) => {
    const result = await db.query(
        `SELECT
            o.*,
            p.seller_id, p.pname, p.brand, p.image, p.imageurl,
            u.store_name, u.name AS seller_name
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        LEFT JOIN users u ON p.seller_id = u.id
        WHERE o.customer_id = $1 AND o.order_group_id = $2`,
        [customerId, orderGroupId]
    );

    return result.rows;
};