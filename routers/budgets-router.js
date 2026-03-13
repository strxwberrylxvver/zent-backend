import { Router } from "express";
import database from "../database.js";
import Model from "../models/Model.js";
import modelConfig from "../models/budgets-model.js";
import Accessor from "../accessors/Accessor.js";
import Controller from "../controllers/Controller.js";

const router = Router();
const model = new Model(modelConfig);
const accessor = new Accessor(model, database);
const controller = new Controller(accessor);

router.get("/users/:id", (req, res) => controller.get(req, res, "user"));
router.get("/:id", (req, res) => controller.get(req, res, null));
router.get("/", (req, res) => controller.get(req, res, null));

router.post("/", controller.post);
router.put("/:id", controller.put);
router.delete("/:id", controller.delete);

export default router;
