import express from "express";
import { getAllUsersOrdersController, checkoutFromCartController, getOrderByIdController, checkoutNowController, updateOrdersController} from "../controllers/orders";
import { JwtVerify } from "../middleware/jwtVerify";
import { zodValidation } from "../middleware/zodValidation";
import { checkoutFromCartSchema, checkoutNowSchema, updateOrderSchema } from "../zodSchemas/orders.schemas";

const Router = express.Router();

Router.get("/orders", JwtVerify, getAllUsersOrdersController);
Router.get("/orders/:id", JwtVerify, getOrderByIdController);
Router.post("/orders/checkout-cart", JwtVerify, zodValidation(checkoutFromCartSchema), checkoutFromCartController);
Router.post("/orders/checkout", JwtVerify, zodValidation(checkoutNowSchema), checkoutNowController);
Router.patch("/orders/:id", JwtVerify, zodValidation(updateOrderSchema), updateOrdersController);

export default Router;