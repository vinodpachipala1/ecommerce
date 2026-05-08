import db from '../server/db.js';

export const buildProductFilters = (search, selectedCategory, min, max, userId) => {
    let where = `WHERE p.is_deleted IS NOT TRUE`;
    const values = [];
    let ind = 1;

    if (userId) {
        where += ` AND p.seller_id != $${ind}`;
        values.push(userId);
        ind++;
    }

    if (search && search.trim() !== "") {
        where += ` AND (p.pname ILIKE $${ind} OR p.brand ILIKE $${ind} OR p.description ILIKE $${ind} OR p.id IN (SELECT product_id FROM product_tags WHERE tag ILIKE $${ind}))`;
        values.push(`%${search}%`);
        ind++;
    }

    if (selectedCategory && selectedCategory !== "All") {
        where += ` AND p.category = $${ind}`;
        values.push(selectedCategory);
        ind++;
    }

    if (min && min !== "") {
        where += ` AND p.price >= $${ind}`;
        values.push(parseFloat(min));
        ind++;
    }

    if (max && max !== "") {
        where += ` AND p.price <= $${ind}`;
        values.push(parseFloat(max));
        ind++;
    }

    return { where, values, ind };
};

export const getallProductsModule = async (search, selectedCategory, min, max, brand, sort, userId = null, page = 1) => {
    const limit = 20;
    const safePage = Math.max(1, parseInt(page) || 1);
    const offset = (safePage - 1) * limit;

    let { where, values, ind } = buildProductFilters(search, selectedCategory, min, max, userId);

    if (brand && brand !== "All") {
        where += ` AND p.brand = $${ind}`;
        values.push(brand);
        ind++;
    }

    const countQuery = `SELECT COUNT(DISTINCT p.id) FROM products p ${where}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    let query = `
        SELECT 
            p.id, p.seller_id, p.category, p.pname, p.price, p.brand, p.stock, p.imageurl, p.description, p.warranty_guarantee, p.weight, p.created_at, p.updated_at, p.image,
            COALESCE(ARRAY_AGG(DISTINCT t.tag), '{}') AS tags,
            COALESCE(json_agg(DISTINCT jsonb_build_object('title', s.title, 'content', s.content)), '[]') AS sections,
            u.name AS seller_name, u.store_name, u.created_at AS seller_joined
        FROM products p
        LEFT JOIN product_tags t ON p.id = t.product_id
        LEFT JOIN product_sections s ON p.id = s.product_id
        LEFT JOIN users u ON p.seller_id = u.id
        ${where}
    `;

    if (sort && sort !== "") {
        query += ` GROUP BY p.id, u.id ORDER BY (p.stock = 0), p.price ${sort}, p.created_at DESC`;
    } else {
        query += ` GROUP BY p.id, u.id ORDER BY (p.stock = 0), p.created_at DESC`;
    }

    query += ` LIMIT $${ind} OFFSET $${ind + 1}`;
    const finalValues = [...values, limit, offset];
    const result = await db.query(query, finalValues);

    return {
        rows: result.rows,
        total,
        currentPage: safePage,
        totalPages: Math.ceil(total / limit),
    };
};

export const getBrandsModule = async (search, selectedCategory, min, max) => {
    const { where, values } = buildProductFilters(search, selectedCategory, min, max);
    const query = `SELECT DISTINCT p.brand FROM products p ${where} ORDER BY p.brand`;
    const result = await db.query(query, values);
    return result.rows;
};