import express  from "express";
import { createUserController, getAllUsersController, getUserByIdController, loginUserController } from "../controllers/users";

const Router = express.Router();

Router.get("/users", getAllUsersController);
Router.get("/users/:id", getUserByIdController);
Router.post("/login", loginUserController);
Router.post("/register", createUserController);

export default Router;