import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

export const processProductsWithImages = (products) => {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.map((product) => {
    if (product.image && product.image instanceof Buffer) {
      const imageBase64 = product.image.toString("base64");
      const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
      return { ...product, image: imageDataUrl };
    }
    return product;
  });
};