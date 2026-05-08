import { getallProductsService, getBrandsService } from "../Services/productService.js";

import { processProductsWithImages } from "../Middleware/ProcessingImage.js";

export const getallProductsController = async (req, res) => {

    try {

        const { search, selectedCategory, min, max, brand, sort, page } = req.query;
    
        const result = await getallProductsService( search, selectedCategory, min, max, brand, sort, page );

        const productsWithImages =
            processProductsWithImages(result.rows);

        res.status(200).json({
            products: productsWithImages,
            total: result.total,
            currentPage: result.currentPage,
            totalPages: result.totalPages
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
};

export const getBrandsController = async (req, res) => {

    try {

        const { search, selectedCategory, min, max } = req.query;

        const brands = await getBrandsService( search, selectedCategory, min, max );

        res.status(200).json({
            brands
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
};