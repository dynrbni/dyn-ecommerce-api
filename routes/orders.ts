import express from "express";
import { getUserOrdersController, getOrdersByIdController } from "../controllers/orders";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/orders", JwtVerify, getUserOrdersController);
Router.get("/orders/:id", JwtVerify, getOrdersByIdController);

export default Router;