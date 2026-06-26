import { getallProductsModule, deleteProductModule, InsertProduct, UpdateProduct, InsertProductSections, InsertProductTags, DeleteProductSections, DeleteProductTags } from "../Modules/sellerProductModule.js";
import db from "../server/db.js";
import { io } from "../../server.js";

export const getallProductsService = async (userId) => {
    const products = await getallProductsModule(userId);
    return products;
}

export const deleteProductSerivce = async (id) => {
    const result = await deleteProductModule(id);
    io.emit("productDeleted", { productId: id });
    return result;
}

export const addProductService = async (productData) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const productId = await InsertProduct( client, productData.userId, productData.category, productData.pname, 
            productData.price, productData.brand, productData.stock, productData.description, 
            productData.warranty_guarantee, productData.weight, productData.imageBuffer, productData.imageurl );
        await InsertProductTags(
            client,
            productId,
            productData.tags
        );

        await InsertProductSections(
            client,
            productId,
            productData.sections
        );

        await client.query("COMMIT");

        io.emit("productAdded", {
            id: productId,
            ...productData,
        });

        return productId;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const updateProductService = async (productData) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        await UpdateProduct( client, productData.productId,productData.userId,productData.category,productData.pname,
            productData.price, productData.brand, productData.stock, productData.description, productData.warranty_guarantee, 
            productData.weight, productData.imageBuffer, productData.imageurl
        );

        await DeleteProductTags(
            client,
            productData.productId
        );

        await DeleteProductSections(
            client,
            productData.productId
        );

        await InsertProductTags(
            client,
            productData.productId,
            productData.tags
        );

        await InsertProductSections(
            client,
            productData.productId,
            productData.sections
        );

        await client.query("COMMIT");

        io.emit("productUpdated", {
            id: productData.productId,
            ...productData,
        });

        return true;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};