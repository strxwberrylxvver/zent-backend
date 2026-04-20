import { Router } from "express";
import database from "../database.js";
import Model from "../models/Model.js";
import Accessor from "../accessors/Accessor.js";
import XPController from "../controllers/XpController.js";
import xpModel from "../models/xp-model.js";

const xpRouter = Router();
export const XPController = new XPController(
  new Accessor(new Model(xpModel), database)
);

xpRouter.get("/me", XPController.getMyXP);
xpRouter.post("/award", XPController.awardRoute);

export default xpRouter;