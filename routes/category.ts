import express from "express";
import { getAllCategoriesController, getCategoriesByIdController } from "../controllers/category";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/categories", JwtVerify, getAllCategoriesController);
Router.get("/categories/:id", JwtVerify, getCategoriesByIdController);

export default Router;