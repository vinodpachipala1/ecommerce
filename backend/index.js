import express from 'express';
import pg, { Client, Pool } from 'pg';
import cors from 'cors';
import bcrypt from "bcryptjs";
import pgSession from "connect-pg-simple";
import session from 'express-session';
import multer from 'multer';
import dotenv from "dotenv";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
dotenv.config();

const app = express();
const port = 3001;
app.use(express.json());
const saltrounds = 10;
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

// const db = new Pool({
//     user: process.env.user,
//     host: process.env.host,
//     password: process.env.password,
//     database: process.env.database,
//     port: process.env.port
// });

const db = new Pool({
  connectionString: process.env.string,
});

const PgSession = pgSession(session);

app.use(
    session({
        store: new PgSession({
            pool: db,
            tableName: "session",
            createTableIfMissing: true,
        }),
        secret: "your_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            secure: false, //false-localhost //else-true
            sameSite: "lax",//lax-localhost // none
            httpOnly: true
        },
    })
);

const createTables = async () => {
    try {
        // Create user_role enum if it doesn't exist
        await db.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                    CREATE TYPE user_role AS ENUM ('Customer', 'Seller');
                END IF;
            END$$;
        `);

        // Create tables
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role user_role NOT NULL,
                store_name VARCHAR(150),
                business_address TEXT,
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                seller_id INT REFERENCES users(id) ON DELETE CASCADE,
                category VARCHAR NOT NULL,
                pname VARCHAR NOT NULL,
                price NUMERIC NOT NULL,
                brand VARCHAR NOT NULL,
                stock INT NOT NULL,
                imageurl TEXT,
                image BYTEA,
                description TEXT NOT NULL,
                warranty_guarantee TEXT NOT NULL,
                weight NUMERIC NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                is_deleted BOOLEAN DEFAULT FALSE,
                CONSTRAINT unique_seller_product UNIQUE (seller_id, pname, category, brand)
            );

            CREATE TABLE IF NOT EXISTS product_tags (
                id SERIAL PRIMARY KEY,
                product_id INT REFERENCES products(id) ON DELETE CASCADE,
                tag VARCHAR NOT NULL
            );

            CREATE TABLE IF NOT EXISTS product_sections (
                id SERIAL PRIMARY KEY,
                product_id INT REFERENCES products(id) ON DELETE CASCADE,
                title VARCHAR,
                content TEXT
            );

            CREATE TABLE IF NOT EXISTS cart (
                id SERIAL PRIMARY KEY,
                customer_id INT REFERENCES users(id) ON DELETE CASCADE,
                product_id INT REFERENCES products(id) ON DELETE CASCADE,
                quantity INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT unique_customer_product UNIQUE (customer_id, product_id)
            );

            CREATE TABLE IF NOT EXISTS address (
                id SERIAL PRIMARY KEY,
                customer_id INT REFERENCES users(id),
                name VARCHAR(100),
                phone VARCHAR(15),
                local_address TEXT,
                pincode VARCHAR(10),
                city VARCHAR(100),
                district VARCHAR(100),
                state VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_group_id VARCHAR(255) NOT NULL,
                customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                product_id INT REFERENCES products(id),
                quantity INT NOT NULL,
                price NUMERIC NOT NULL,
                address JSONB NOT NULL,
                shipping NUMERIC NOT NULL,
                payment_method VARCHAR(20) NOT NULL,
                payment_status VARCHAR(20) DEFAULT 'Pending',
                payment_info VARCHAR(50),
                seller_id INT REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'Processing',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log("✅ All tables and user_role enum created successfully.");
    } catch (err) {
        console.error("❌ Error creating tables:", err);
    }
};

createTables();




const processProductsWithImages = (products) => {
    if (!Array.isArray(products)) {
        return [];
    }

    return products.map(product => {
        if (product.image && product.image instanceof Buffer) {
            const imageBase64 = product.image.toString('base64');
            const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
            return { ...product, image: imageDataUrl };
        }
        return product;
    });
};

// Register
app.post("/register", async (req, res) => {
    const { reg, userType } = req.body;

    const { name, email, password, confirmpassword, store, BusinessAddress, phone } = reg;
    try {
        const hashedPassword = await bcrypt.hash(password, saltrounds);

        const query = `
      INSERT INTO users
      (name, email, password, role, store_name, business_address, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

        const values = [name, email, hashedPassword, userType, store || null, BusinessAddress || null, phone || null];

        const result = await db.query(query, values);

        res.status(201).json({ message: "Success", userId: result.rows[0].id });
    } catch (err) {
        console.error("Error inserting user:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// login

app.post("/login", async (req, res) => {
    const { email, password } = req.body.log;
    const userType = req.body.userType;

    try {
        const result = await db.query(`SELECT password, role, id, name FROM users WHERE email = $1 and role = $2`, [email, userType]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).send({ message: "user not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid Password!" });
        }

        req.session.user = {
            id: user.id,
            email: email,
            role: userType,
            name: user.name
        }
        req.session.save((err) => {
            if (err) {
                console.error("🔴 Session save error:", err);
                return res.status(500).send({
                    error: "Something went wrong. Please try again later!",
                });
            }

            return res.status(200).json({ redirect: "/home" });
        });


    } catch (err) {
        res.status(500).send({ error: err.message });
    }
})

//login verify
app.get("/verifyLogin", async (req, res) => {

    res.send({ user: req.session.user })
})

//logout
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Could not log out");
        }
        res.clearCookie("connect.sid");
        res.send({ message: "Logged out successfully" });
    });
});


//addproduct
app.post("/addproduct", upload.single("image"), async (req, res) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const imageBuffer = req.file ? req.file.buffer : null;
        const { userid, category, pname, price, brand, stock, imageurl, description, warranty_guarantee, weight } = req.body;
        const tags = JSON.parse(req.body.tags);
        const sections = JSON.parse(req.body.sections);
        console.log(userid)

        const productResult = await client.query(`
            INSERT INTO products (seller_id, category, pname, price, brand, stock, imageurl, image, description, warranty_guarantee, weight) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING id
        `, [userid, category, pname, price, brand, stock, imageurl, imageBuffer, description, warranty_guarantee, weight]);

        const newProductId = productResult.rows[0].id;

        if (tags && tags.length > 0) {
            for (const tag of tags) {
                await client.query(`INSERT INTO product_tags (product_id, tag) VALUES ($1, $2)`, [newProductId, tag]);
            }
        }
        if (sections && sections.length > 0) {
            for (const section of sections) {
                await client.query(`INSERT INTO product_sections (product_id, title, content) VALUES ($1, $2, $3)`, [newProductId, section.title, section.content]);
            }
        }

        await client.query('COMMIT');
        res.status(201).send({ message: "Product added successfully", productId: newProductId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error in /addproduct transaction:", err);
        res.status(500).send({ message: "Failed to add product. Operation was rolled back." });

    } finally {
        client.release();
    }
});

//delete product
app.delete("/deleteProduct", async (req, res) => {
    const id = req.body.productid;
    try {
        const result = await db.query(`UPDATE products SET stock = 0, is_deleted = TRUE, updated_at = NOW() WHERE id = $1 `, [id]);
        await db.query(`DELETE FROM cart WHERE product_id = $1`, [id]);
    } catch (err) {
        console.log(err);
    }
})

//update product details
app.put("/updateProductDetails/:id", upload.single("image"), async (req, res) => {
    // Get a dedicated client from the pool for the transaction
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { id: productId } = req.params;
        const { userid, category, pname, price, brand, stock, imageurl, description, warranty_guarantee, weight } = req.body;
        const tags = JSON.parse(req.body.tags);
        const sections = JSON.parse(req.body.sections);
        const imageBuffer = req.file ? req.file.buffer : null;

        const productResult = await client.query(`UPDATE products 
            SET category=$1, pname=$2, price=$3, brand=$4, stock=$5, imageurl=$6, 
                description=$7, warranty_guarantee=$8, weight=$9, updated_at=NOW(),
                image = COALESCE($10, image)
            WHERE id=$11 AND seller_id=$12
        `, [category, pname, price, brand, stock, imageurl, description, warranty_guarantee, weight, imageBuffer, productId, userid]);

        await client.query("DELETE FROM product_tags WHERE product_id = $1", [productId]);
        await client.query("DELETE FROM product_sections WHERE product_id = $1", [productId]);

        if (tags && tags.length > 0) {
            for (const tag of tags) {
                await client.query(`INSERT INTO product_tags (product_id, tag) VALUES ($1, $2)`, [productId, tag]);
            }
        }
        if (sections && sections.length > 0) {
            for (const section of sections) {
                await client.query(`INSERT INTO product_sections (product_id, title, content) VALUES ($1, $2, $3)`, [productId, section.title, section.content]);
            }
        }

        await client.query('COMMIT');
        res.status(200).send({ message: "Product updated successfully", productId: productId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error in /updateproduct transaction:", err);
        res.status(500).send({ message: "Failed to update product. Operation was rolled back." });
    } finally {
        client.release();
    }

})

//getsellerproduct
app.post("/getSellerProducts", async (req, res) => {
    const seller_id = req.body.seller;
    try {
        const result = await db.query(`SELECT p.id, p.seller_id, p.category, p.pname, p.price, p.brand, p.stock, p.imageurl, p.description, p.warranty_guarantee, p.weight, p.created_at, p.updated_at, p.image,
            COALESCE(ARRAY_AGG(DISTINCT t.tag), '{}') AS tags,
            COALESCE(json_agg(DISTINCT jsonb_build_object('title', s.title, 'content', s.content))
            , '[]') AS sections
            FROM products p 
            LEFT JOIN product_tags t ON p.id = t.product_id 
            LEFT JOIN product_sections s ON p.id = s.product_id 
            WHERE seller_id = $1 AND p.is_deleted = FALSE GROUP BY p.id`, [seller_id])

        const productsWithImages = processProductsWithImages(result.rows)

        res.status(200).send({ products: productsWithImages });

    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
        console.log(err);
    }
})

//get seller Received orders
app.post("/getOrdresReceived", async (req, res) => {
    const sellerId = req.body.sellerId;
    try {
        const result = await db.query(`SELECT o.*, u.name as customer_name, p.pname as product_name, p.image  FROM orders o LEFT JOIN users u ON o.customer_id = u.id LEFT JOIN products p ON p.id = o.product_id WHERE o.seller_id = $1`, [sellerId]);
        const ordersWithImages = processProductsWithImages(result.rows)
        res.send({ orders: ordersWithImages });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
        console.log(err)
    }
})

//update order status
app.post("/updateOrdreStatus", async (req, res) => {
    const { orderId, newStatus } = req.body;
    try {
        await db.query(`UPDATE orders SET status = $1 WHERE id = $2`, [newStatus, orderId])
        res.send("Successful")
    } catch (err) {
        res.status(500).send({ message: err.message });
        console.log(err);
    }
})



//get product for customer dashboard
app.get("/getProducts", async (req, res) => {
    try {
        const result = await db.query(`SELECT p.id, p.seller_id, p.category, p.pname, p.price, p.brand, p.stock, p.imageurl, p.description, p.warranty_guarantee, p.weight, p.created_at, p.updated_at, p.image,
            COALESCE(ARRAY_AGG(DISTINCT t.tag), '{}') AS tags,
            COALESCE(json_agg(DISTINCT jsonb_build_object('title', s.title, 'content', s.content))
            , '[]') AS sections,
            u.name AS seller_name, u.store_name, u.created_at AS Seller_joined
            FROM products p 
            LEFT JOIN product_tags t ON p.id = t.product_id 
            LEFT JOIN product_sections s ON p.id = s.product_id
            LEFT JOIN users u ON p.seller_id = u.id
            GROUP BY p.id, u.id
            ORDER BY (p.stock = 0), p.created_at DESC;`)

        const productsWithImages = processProductsWithImages(result.rows)
        res.status(200).send({ products: productsWithImages });
    }
    catch (err) {
        console.log(err)
    }
})


// add products to cart
app.post("/addtoCart", async (req, res) => {
    const { productid, userid } = req.body
    try {
        const result = await db.query(`INSERT INTO cart (customer_id, product_id) VALUES ($1, $2)`, [userid, productid]);
        res.send("success")
    }
    catch (err) {
        if (err.code === "23505") {
            res.status(500).send("Already added to cart")
        }
        else {
            res.status(500).send("Internal Server Error")
        }
    }
})

// to get details of cart page
app.post("/getCartandAddress", async (req, res) => {
    const userid = req.body.userid;
    try {
        const result = await db.query(`SELECT c.id, c.product_id, c.quantity ,p.pname, p.imageurl, p.price, p.brand, p.stock, p.image, p.seller_id, s.store_name from cart c LEFT JOIN products p ON c.product_id = p.id LEFT JOIN users s ON p.seller_id = s.id WHERE c.customer_id = $1 ORDER BY c.created_at DESC`, [userid]);
        const result1 = await db.query(`SELECT * FROM address WHERE customer_id = $1`, [userid])
        const processedCart = processProductsWithImages(result.rows)
        res.status(200).send({ cart: processedCart, address: result1.rows })
    } catch (err) {
        res.status(500).send("Unable to fetch");
    }
})

// to update cart items quantity
app.put("/updateCartQuantity", async (req, res) => {
    const { productid, userid, quantity } = req.body;
    try {
        const result = await db.query(`UPDATE cart SET quantity = $1, updated_at = NOW() WHERE product_id = $2 AND customer_id = $3 RETURNING quantity`, [quantity, productid, userid]);
        res.status(200).send("Successfull");
    } catch (err) {
        console.log(err)
        res.status(500).send("Error please Retry");
    }
})

//remove an item from cart
app.delete("/deleteCartItem", async (req, res) => {
    const id = req.body.cartitemid;
    try {
        const result = await db.query(`DELETE FROM cart WHERE id = $1`, [id])
    }
    catch (err) {
        console.log(err);
    }
})

//place order
app.post("/placeOrder", async (req, res) => {
    const { address, customerId, cartItems, total, shipping, payment_method, payment_info } = req.body;
    try {
        const orderGroupId = `ORD-${Date.now()}`;
        for (const item of cartItems) {
            await db.query(`INSERT INTO orders (order_group_id, customer_id, product_id, quantity, price, address, shipping, payment_method, payment_status, payment_info, seller_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING order_group_id, id`, [orderGroupId, customerId, item.product_id, item.quantity, item.price, address, shipping, payment_method, 'successful', payment_info, item.seller_id])
            await db.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [item.quantity, item.product_id])
        }

        await db.query(`DELETE FROM cart WHERE customer_id = $1`, [customerId]);

        res.status(201).json({
            message: "Order placed successfully!",
            orderId: orderGroupId,
        });
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ message: "Failed to place order." });
    }
})

//get customer orders
app.post("/getOrders", async (req, res) => {
    const customerId = req.body.userid;
    try {
        const result = await db.query(`SELECT o.id, o.order_group_id, o.product_id, o.quantity, o.price, o.address, o.shipping, o.payment_method, o.payment_status, o.payment_info, o.status, o.created_at,p.image, p.imageurl
            FROM orders o  
            LEFT JOIN products p ON p.id = o.product_id
            WHERE o.customer_id = $1 ORDER BY o.created_at`, [customerId]);
        const ordersWithImages = processProductsWithImages(result.rows);
        res.send({ orders: ordersWithImages });
    }
    catch (err) {
        console.log(err)
    }
})

//get order data
app.post("/getOrder", async (req, res) => {
    const { userid, orderGroupId } = req.body;

    try {
        const result = await db.query(`SELECT o.*, p.seller_id, p.pname, p.brand, p.image, p.imageurl, u.store_name, u.name as seller_name 
            FROM orders o
            LEFT JOIN products p ON o.product_id = p.id
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE o.customer_id = $1 AND o.order_group_id = $2`, [userid, orderGroupId]);
        const orderWithImages = processProductsWithImages(result.rows)
        res.send({ order: orderWithImages });
    }
    catch (err) {
        console.log(err);
    }
})

//get profile
app.post("/getProfileDetails", async (req, res) => {
    const { userId } = req.body;
    try {
        const result = await db.query(`SELECT a.*, u.store_name,u.business_address, u.phone as seller_phone FROM users u LEFT JOIN address a  ON a.customer_id = u.id WHERE u.id = $1`,
            [userId]);
        console.log(result.rows)
        res.send({ ProfleData: result.rows });

    } catch (err) {
        console.log(err);
        res.status(500).send({ message: err.message })
    }
})

//add new address
app.post("/addAddress", async (req, res) => {
    const { address, userId } = req.body;
    console.log()
    try {
        const result = await db.query(`INSERT INTO address (customer_id, name, phone, local_address, pincode, city,district, state) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8)`, [userId, address.name, address.phone, address.local_address, address.pincode, address.city, address.district, address.state])
    }
    catch (err) {
        console.log(err)
    }
})

app.listen(port, () => {
    console.log(`listening to ${port}`);
}) 