import express from "express";
import cors from "cors";

import { userRoutes } from "./Routes/userRoutes.js";
import { productRoutes } from "./Routes/ProductRoutes.js";
import { sellerProductsRoutes } from "./Routes/sellerProductRoutes.js";
import { cartRoutes } from "./Routes/cartRoutes.js";
import { orderRoutes } from "./Routes/orderRoutes.js";
import { sellerOrderRoutes } from "./Routes/sellerOrderRoutes.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("hello");
})

app.use('/product', productRoutes);
app.use('/seller', sellerProductsRoutes);
app.use('/auth', userRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use("/sellerOrder", sellerOrderRoutes);
export default app;