import express  from "express";
import { addToCartController, getUserCartController, updateCartController, removeItemCartController } from "../controllers/cart";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/cart", JwtVerify, getUserCartController);
Router.post("/cart", JwtVerify, addToCartController);
Router.patch("/cart", JwtVerify, updateCartController);
Router.delete("/cart", JwtVerify, removeItemCartController);

export default Router;
