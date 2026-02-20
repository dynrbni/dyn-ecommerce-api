import express from "express";
import { getAllCategoriesController, getCategoriesByIdController, createCategoryController, updateCategoryController, deleteCategoryController } from "../controllers/category";
import { JwtVerify } from "../middleware/jwtVerify";
import { zodValidation } from "../middleware/zodValidation";
import { createCategorySchema, updateCategorySchema } from "../zodSchemas/category.schemas";

const Router = express.Router();

Router.get("/categories", JwtVerify, getAllCategoriesController);
Router.get("/categories/:id", JwtVerify, getCategoriesByIdController);
Router.post("/categories", JwtVerify, zodValidation(createCategorySchema), createCategoryController);
Router.patch("/categories/:id", JwtVerify, zodValidation(updateCategorySchema), updateCategoryController);
Router.delete("/categories/:id", JwtVerify, deleteCategoryController);

export default Router;