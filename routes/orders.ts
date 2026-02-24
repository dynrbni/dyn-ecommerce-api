import express from "express";
import { getAllUsersOrdersController, checkoutFromCartController, getOrderByIdController, checkoutNowController, updateOrdersController} from "../controllers/orders";
import { JwtVerify } from "../middleware/jwtVerify";
import { zodValidation } from "../middleware/zodValidation";
import { checkoutFromCartSchema, checkoutNowSchema, updateOrderSchema } from "../zodSchemas/orders.schemas";
import { Role } from "@prisma/client";
import { authorizeRole } from "../middleware/roleValidation";

const Router = express.Router();

Router.get("/orders", JwtVerify, getAllUsersOrdersController);
Router.get("/orders/:id", JwtVerify, getOrderByIdController);
Router.post("/orders/checkout-cart", JwtVerify, zodValidation(checkoutFromCartSchema), checkoutFromCartController);
Router.post("/orders/checkout", JwtVerify, zodValidation(checkoutNowSchema), checkoutNowController);
Router.patch("/orders/:id", JwtVerify, authorizeRole([Role.ADMIN]), zodValidation(updateOrderSchema), updateOrdersController);

export default Router;