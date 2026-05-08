import { getallProductsService, deleteProductSerivce, addProductService} from "../Services/sellerProductService.js";
import { processProductsWithImages } from "../Middleware/ProcessingImage.js";


export const getallProductsController = async(req, res) => {
    
    try{
        const result = await getallProductsService(req.user.id);
        const productsWithImages = processProductsWithImages(result);
        res.status(200).json({products: productsWithImages});
    } catch(err){
        res.status(500).json({ Error : err.message});

    }
}

export const deleteProductsController = async(req, res) => {
    const productId = req.body.productid;
    
    try{
        await deleteProductSerivce(productId);
        res.status(200).json({ message : "Product deleted Succesfully"});
    } catch (err) {
        res.status(500).json({ Error : err.message});   
    }
}

export const addProductConrtoller = async(req, res) => {
    const imageBuffer = req.file ? req.file.buffer : null;
    const productData = {
      ...req.body,
      imageBuffer,
      tags: JSON.parse(req.body.tags || "[]"),
      sections: JSON.parse(req.body.sections || "[]"),
      userId: req.user.id,
    };

    try {
        await addProductService(productData);
        res.status(201).send("succesfull");
    } catch (err) {
        res.status(500).json({message: "Failed to add product"});
    }
}