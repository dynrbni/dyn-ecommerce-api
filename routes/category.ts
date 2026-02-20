import express from "express";
import { getAllCategoriesController, getCategoriesByIdController, createCategoryController, updateCategoryController, deleteCategoryController } from "../controllers/category";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/categories", JwtVerify, getAllCategoriesController);
Router.get("/categories/:id", JwtVerify, getCategoriesByIdController);
Router.post("/categories", JwtVerify, createCategoryController);
Router.patch("/categories/:id", JwtVerify, updateCategoryController);
Router.delete("/categories/:id", JwtVerify, deleteCategoryController);

export default Router;