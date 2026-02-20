import express  from "express";
import { createUserController, getAllUsersController, getUserByIdController, loginUserController, updateUserController, deleteUserController } from "../controllers/users";
import { zodValidation } from "../middleware/zodValidation";
import { createUserSchema, updateUserSchema, loginUserSchema} from "../zodSchemas/users.schemas";
import { JwtVerify } from "../middleware/jwtVerify";

const Router = express.Router();

Router.get("/users", JwtVerify, getAllUsersController);
Router.get("/users/:id", JwtVerify, getUserByIdController);
Router.post("/login", zodValidation(loginUserSchema), loginUserController);
Router.post("/register", zodValidation(createUserSchema), createUserController);
Router.patch("/users/:id", JwtVerify, zodValidation(updateUserSchema), updateUserController);
Router.delete("/users/:id", JwtVerify, deleteUserController);

export default Router;