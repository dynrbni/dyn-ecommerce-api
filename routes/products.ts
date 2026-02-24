import express from "express";
import { getAllProductsController, getProductByIdController, createProductController, updateProductController, deleteProductController} from "../controllers/products";
import { JwtVerify } from "../middleware/jwtVerify";
import { authorizeRole } from "../middleware/roleValidation";
import { Role } from "@prisma/client";

const Router = express.Router();

Router.get("/products", JwtVerify, getAllProductsController);
Router.get("/products/:id", JwtVerify, getProductByIdController);
Router.post("/products", JwtVerify, authorizeRole([Role.ADMIN]), createProductController);
Router.patch("/products/:id", JwtVerify, authorizeRole([Role.ADMIN]), updateProductController);
Router.delete("/products/:id", JwtVerify, authorizeRole([Role.ADMIN]), deleteProductController);

export default Router;
