import express  from "express";
import { addToCartController, getUserCartController, getItemCartByIdController, updateCartController, removeItemCartController } from "../controllers/cart";
import { JwtVerify } from "../middleware/jwtVerify";
import { zodValidation } from "../middleware/zodValidation";
import { addToCartSchema, updateCartSchema, removeCartItemSchema } from "../zodSchemas/cart.schemas";

const Router = express.Router();

Router.get("/cart", JwtVerify, getUserCartController);
Router.get("/cart/:id", JwtVerify, getItemCartByIdController);
Router.post("/cart", JwtVerify, zodValidation(addToCartSchema), addToCartController);
Router.patch("/cart", JwtVerify, zodValidation(updateCartSchema), updateCartController);
Router.delete("/cart", JwtVerify, zodValidation(removeCartItemSchema), removeItemCartController);

export default Router;
