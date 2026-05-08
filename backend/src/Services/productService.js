import { getallProductsModule, getBrandsModule } from "../Modules/productModule.js";


export const getallProductsService = async ( search, selectedCategory, min, max, brand, sort, userId, page ) => {
    const products = await getallProductsModule( search, selectedCategory, min, max, brand, sort, userId, page );
    return products;
};

export const getBrandsService = async ( search, selectedCategory, min, max) => {

    const brands = await getBrandsModule( search, selectedCategory, min, max );

    return brands;
};

