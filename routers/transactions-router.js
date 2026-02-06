import { Router } from "express";
import database from "../database.js";
import Model from "../models/Model.js";
import modelConfig from "../models/transactions-model.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const model = new Model(modelConfig);

const read = async (id, variant) => {
  try {
    const { sql, data } = buildReadQuery(id, variant);
    const [result] = await database.query(sql, data);
    return result.length === 0
      ? { isSuccess: false, result: null, message: "No record(s) found." }
      : {
          isSuccess: true,
          result,
          message: "Record(s) successfully recovered.",
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const create = async (record) => {
  try {
    const { sql, data } = model.buildCreateQuery(record);
    const status = await database.query(sql, data);
    const { isSuccess, result, message } = await read(status[0].insertId, null);

    return isSuccess
      ? { isSuccess: true, result, message: "Record successfully recovered." }
      : {
          isSuccess: false,
          result: null,
          message: `Failed to recover inserted record : ${message}`,
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const update = async (record, id) => {
  try {
    const { sql, data } = model.buildUpdateQuery(record, id);
    const status = await database.query(sql, data);

    const { isSuccess, result, message } = await read(id, null);

    return isSuccess
      ? { isSuccess: true, result, message: "Record successfully recovered." }
      : {
          isSuccess: false,
          result: null,
          message: `Failed to recover inserted record : ${message}`,
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const delet3 = async (id) => {
  try {
    const { sql, data } = model.buildDeleteQuery(id);
    const status = await database.query(sql, data);

    return status[0].affectedRows === 0
      ? {
          isSuccess: false,
          result: null,
          message: `Failed to delete record ${id}`,
        }
      : {
          isSuccess: true,
          result: null,
          message: "Record successfully removed.",
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const getTransactionsController = async (req, res, variant) => {
  const id = req.params.id;
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await read(id, variant);
  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(200).json(result);
};

const postTransactionsController = async (req, res) => {
  const record = req.body;
  record.TransactionID = uuidv4();
  const { isSuccess, result, message: accessorMessage } = await create(record);
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
  } = await update(record, id);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

const deleteTransactionsController = async (req, res) => {
  const id = req.params.id;
  const { isSuccess, result, message: accessorMessage } = await delet3(id);

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
