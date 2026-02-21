import express  from "express";
import { addToCartController, getUserCartController } from "../controllers/cart";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/cart", JwtVerify, getUserCartController);
Router.post("/cart", JwtVerify, addToCartController);

export default Router;
