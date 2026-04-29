import { Router } from "express";
import database from "../database.js";
import Model from "../models/Model.js";
import Accessor from "../accessors/Accessor.js";
import XPController from "../controllers/xpController.js";
import xpModel from "../models/xp-model.js";

const xpRouter = Router();

const xpControllerInstance = new XPController(
  new Accessor(new Model(xpModel), database)
);

xpRouter.get("/me", xpControllerInstance.getMyXP);
xpRouter.post("/award", xpControllerInstance.awardRoute);

export { xpControllerInstance as xpController };
export default xpRouter;