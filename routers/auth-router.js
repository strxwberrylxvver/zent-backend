import { Router } from "express";
import database from "../database.js";
import Model from "../models/Model.js";
import Accessor from "../accessors/Accessor.js";
import AuthController from "../controllers/authController.js";
import usersConfig from "../models/users-model.js";

const authRouter = Router();
const controller = new AuthController(
  new Accessor(new Model(usersConfig), database)
);

authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);

export default authRouter;
