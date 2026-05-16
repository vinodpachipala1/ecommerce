import db from "../server/db.js"

export const findUserByEmail = async (email) => {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0];
}

export const register = async(name, email, password, store, BusinessAddress, phone, usertype) => {
    await db.query(`INSERT INTO users (name, email, password, role, business_address, phone) VALUES ($1, $2, $3, $4, $5, $6)`,[name, email, password, usertype, BusinessAddress, phone]);
    return { message : "Success"}
}

export const profileDetailsModule = async (userId, email) => {
    const result = await db.query(
      `SELECT a.*, u.store_name,u.business_address, u.phone as seller_phone FROM users u LEFT JOIN address a  ON a.customer_id = u.id WHERE u.id = $1`,
      [userId]

    );
    return result.rows;
}

export const getAddressModule = async (
    userId
) => {

    const result = await db.query(
        `
        SELECT *
        FROM address
        WHERE customer_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
};