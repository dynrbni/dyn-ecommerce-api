import express from "express";
import { getAllProductsController, getProductByIdController, createProductController, updateProductController, deleteProductController} from "../controllers/products";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/products", JwtVerify, getAllProductsController);
Router.get("/products/:id", JwtVerify, getProductByIdController);
Router.post("/products", JwtVerify, createProductController);
Router.patch("/products/:id", JwtVerify, updateProductController);
Router.delete("/products/:id", JwtVerify, deleteProductController);

export default Router;
