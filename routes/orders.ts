import express from "express";
import { getAllUsersOrdersController, checkoutFromCartController, getOrderByIdController, checkoutNowController, updateOrdersController} from "../controllers/orders";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/orders", JwtVerify, getAllUsersOrdersController);
Router.get("/orders/:id", JwtVerify, getOrderByIdController);
Router.post("/orders/checkout-cart", JwtVerify, checkoutFromCartController);
Router.post("/orders/checkout", JwtVerify, checkoutNowController);
Router.patch("/orders/:id", JwtVerify, updateOrdersController);

export default Router;