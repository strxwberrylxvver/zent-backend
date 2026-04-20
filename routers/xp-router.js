import { Router } from "express";
import database from "../database.js";
import Model from "../models/Model.js";
import Accessor from "../accessors/Accessor.js";
import xpController from "../controllers/XpController.js";
import xpModel from "../models/xp-model.js";

const xpRouter = Router();
export const xpController = new XPController(
  new Accessor(new Model(xpModel), database)
);

xpRouter.get("/me", xpController.getMyXP);
xpRouter.post("/award", xpController.awardRoute);

export default xpRouter;