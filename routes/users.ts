import express  from "express";
import { createUserController, getAllUsersController, getUserByIdController, loginUserController, updateUserController, deleteUserController } from "../controllers/users";
import { zodValidation } from "../middleware/zodValidation";
import { createUserSchema, updateUserSchema, loginUserSchema} from "../zodSchemas/users.schemas";
import { JwtVerify } from "../middleware/jwtVerify";
import { Role } from "@prisma/client";
import { authorizeRole } from "../middleware/roleValidation";

const Router = express.Router();

Router.get("/users", JwtVerify, authorizeRole([Role.ADMIN]), getAllUsersController);
Router.get("/users/:id", JwtVerify, getUserByIdController);
Router.post("/login", zodValidation(loginUserSchema), loginUserController);
Router.post("/register", zodValidation(createUserSchema), createUserController);
Router.patch("/users/:id", JwtVerify, authorizeRole([Role.ADMIN]), zodValidation(updateUserSchema), updateUserController);
Router.delete("/users/:id", JwtVerify, authorizeRole([Role.ADMIN]), deleteUserController);

export default Router;