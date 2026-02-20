import express  from "express";
import { createUserController, getAllUsersController, getUserByIdController, loginUserController, updateUserController, deleteUserController } from "../controllers/users";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/users", JwtVerify, getAllUsersController);
Router.get("/users/:id", JwtVerify, getUserByIdController);
Router.post("/login", loginUserController);
Router.post("/register", createUserController);
Router.patch("/users/:id", JwtVerify, updateUserController);
Router.delete("/users/:id", JwtVerify, deleteUserController);

export default Router;