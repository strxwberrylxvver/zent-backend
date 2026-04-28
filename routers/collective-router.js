import { Router } from "express";
import database from "../database.js";
import Model from "../models/Model.js";
import Accessor from "../accessors/Accessor.js";
import Controller from "../controllers/Controller.js";
import Validator from "../validators/Validator.js";

const collectiveRouter = (modelConfig, xpController = null) => {
  const router     = Router();
  const controller = new Controller(
    new Accessor(new Model(modelConfig), database),
    xpController,
  );

  const validator = modelConfig.schema ? new Validator(modelConfig.schema) : null;
  const validate  = (method) =>
    validator ? validator.middleware(method) : (_req, _res, next) => next();


  
  router.get("/me", (req, res) =>
    controller.get(req, res, "user", req.user?.userID),
  );

  router.get(
    "/users/:id",
    validate("get"),
    (req, res) => controller.get(req, res, "user"),
  );

  router.get("/:id", validate("get"), (req, res) =>
    controller.get(req, res, null),
  );

  router.get("/", (req, res) => controller.get(req, res, null));

  router.post(   "/",    validate("post"),   controller.post);
  router.put(    "/:id", validate("put"),    controller.put);
  router.delete( "/:id", validate("delete"), controller.delete);

  return router;
};

export default collectiveRouter;