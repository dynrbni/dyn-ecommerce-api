import express from "express";
import { getAllCategoriesController, getCategoriesByIdController, createCategoryController, updateCategoryController, deleteCategoryController } from "../controllers/category";
import { JwtVerify } from "../middleware/jwtVerify";
import { zodValidation } from "../middleware/zodValidation";
import { createCategorySchema, updateCategorySchema } from "../zodSchemas/category.schemas";
import { authorizeRole } from "../middleware/roleValidation";
import { Role } from "@prisma/client";

const Router = express.Router();

Router.get("/categories", JwtVerify, getAllCategoriesController);
Router.get("/categories/:id", JwtVerify, getCategoriesByIdController);
Router.post("/categories", JwtVerify, authorizeRole([Role.ADMIN]), zodValidation(createCategorySchema), createCategoryController);
Router.patch("/categories/:id", JwtVerify, authorizeRole([Role.ADMIN]), zodValidation(updateCategorySchema), updateCategoryController);
Router.delete("/categories/:id", JwtVerify, authorizeRole([Role.ADMIN]), deleteCategoryController);

export default Router;