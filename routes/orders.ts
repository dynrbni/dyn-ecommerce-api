import express from "express";
import { getAllUsersOrdersController, checkoutFromCartController } from "../controllers/orders";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/orders", JwtVerify, getAllUsersOrdersController);
Router.post("/orders/checkout-cart", JwtVerify, checkoutFromCartController);

export default Router;