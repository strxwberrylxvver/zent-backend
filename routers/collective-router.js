import { Router } from "express";
import database from "../database.js";
import Model from "../models/Model.js";
import Accessor from "../accessors/Accessor.js";
import Controller from "../controllers/Controller.js";

const collectiveRouter = (modelConfig) => {
  const router = Router();
  const controller = new Controller(
    new Accessor(new Model(modelConfig), database)
  );

  router.get("/me", (req, res) =>
    controller.get(req, res, "user", req.user?.userID)
  );
  router.get("/users/:id", (req, res) => controller.get(req, res, "user"));
  router.get("/:id", (req, res) => controller.get(req, res, null));
  router.get("/", (req, res) => controller.get(req, res, null));

  router.post("/", controller.post);
  router.put("/:id", controller.put);
  router.delete("/:id", controller.delete);

  return router;
};

export default collectiveRouter;
