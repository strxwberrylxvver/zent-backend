import { Router } from "express";
import database from "../database.js";
import Model from "../models/Model.js";
import modelConfig from "../models/transactions-model.js";
import Accessor from "../accessors/Accessor.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const model = new Model(modelConfig);
const accessor = new Accessor(model, database);

const getTransactionsController = async (req, res, variant) => {
  const id = req.params.id;
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await accessor.read(id, variant);
  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(200).json(result);
};

const postTransactionsController = async (req, res) => {
  const record = req.body;
  record.TransactionID = uuidv4();
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await accessor.create(record);
  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(201).json(result);
};

const putTransactionsController = async (req, res) => {
  const id = req.params.id;
  const record = req.body;
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await accessor.update(record, id);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

const deleteTransactionsController = async (req, res) => {
  const id = req.params.id;
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await accessor.delete(id);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

router.get("/users/:id", (req, res) =>
  getTransactionsController(req, res, "user")
);
router.get("/:id", (req, res) => getTransactionsController(req, res, null));
router.get("/", (req, res) => getTransactionsController(req, res, null));

router.post("/", postTransactionsController);
router.put("/:id", putTransactionsController);
router.delete("/:id", deleteTransactionsController);

export default router;
