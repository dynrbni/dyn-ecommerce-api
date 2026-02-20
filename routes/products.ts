import express from "express";
import { getAllProductsController, getProductByIdController, createProductController} from "../controllers/products";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/products", JwtVerify, getAllProductsController);
Router.get("/products/:id", JwtVerify, getProductByIdController);
Router.post("/products", JwtVerify, createProductController);

export default Router;
