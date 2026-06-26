import db from "../server/db.js";

export const getallProductsModule = async (userId) => {
    const result = await db.query(
        `SELECT p.id, p.seller_id, p.category, p.pname, p.price, p.brand, p.stock, p.imageurl, p.description, p.warranty_guarantee, p.weight, p.created_at, p.updated_at, p.image,
            COALESCE(ARRAY_AGG(DISTINCT t.tag), '{}') AS tags,
            COALESCE(json_agg(DISTINCT jsonb_build_object('title', s.title, 'content', s.content))
            , '[]') AS sections
            FROM products p 
            LEFT JOIN product_tags t ON p.id = t.product_id 
            LEFT JOIN product_sections s ON p.id = s.product_id 
            WHERE seller_id = $1 AND p.is_deleted = FALSE GROUP BY p.id`,
        [userId]
    )
    return result.rows;
}

export const deleteProductModule = async (id) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE products 
                SET stock = 0, is_deleted = TRUE, updated_at = NOW() 
                WHERE id = $1`,
            [id]
        );

        await client.query(
            `DELETE FROM cart WHERE product_id = $1`,
            [id]
        );

        await client.query("COMMIT");

        return result;

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const InsertProduct = async(client, sellerId, category, productName, price, brand, stock, description, warranty_guarantee, weight, imageBuffer, imageUrl) => {
    
    const result = await client.query(`INSERT INTO products 
        (seller_id, category, pname, price, brand, stock, imageurl, image, description, warranty_guarantee, weight) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) 
        RETURNING *`, [sellerId, category, productName, price, brand, stock, imageUrl, imageBuffer, description, warranty_guarantee, weight]
    );
    console.log(result.rows[0]);

    return result.rows[0].id;
}

export const InsertProductTags = async (client, productId, tags) => {
    for (const tag of tags) {
        await client.query(
            `INSERT INTO product_tags (product_id, tag)
             VALUES ($1, $2)`,
            [productId, tag]
        );
    }
};

export const InsertProductSections = async (client, productId, sections) => {
    for (const section of sections) {
        await client.query(
            `INSERT INTO product_sections (product_id, title, content)
             VALUES ($1, $2, $3)`,
            [
                productId,
                section.title,
                section.content
            ]
        );
    }
};

export const DeleteProductTags = async (client, productId) => {
    await client.query(
        `DELETE FROM product_tags
         WHERE product_id = $1`,
        [productId]
    );
};

export const DeleteProductSections = async (client, productId) => {
    await client.query(
        `DELETE FROM product_sections
         WHERE product_id = $1`,
        [productId]
    );
};


export const UpdateProduct = async ( client, productId, sellerId, category, productName, 
    price, brand, stock, description, warranty_guarantee, weight, imageBuffer, imageUrl ) => {

    let query;
    let values;

    if (imageBuffer) {
        // New image uploaded
        query = `
            UPDATE products
            SET category = $1, pname = $2, price = $3, brand = $4, stock = $5, imageurl = $6, 
            image = $7, description = $8, warranty_guarantee = $9, weight = $10
            WHERE id = $11
            AND seller_id = $12
            RETURNING *;
        `;

        values = [ category, productName, price, brand, stock, imageUrl, imageBuffer, 
            description, warranty_guarantee, weight, productId, sellerId ];
    } else {
        // Keep existing image
        query = `
            UPDATE products
            SET category = $1, pname = $2, price = $3, brand = $4, stock = $5, imageurl = $6, 
            description = $7, warranty_guarantee = $8, weight = $9
            WHERE id = $10
            AND seller_id = $11
            RETURNING *;
        `;

        values = [ category,productName, price, brand, stock, imageUrl, 
            description, warranty_guarantee, weight, productId, sellerId ];
    }

    const result = await client.query(query, values);

    return result.rows[0];
};