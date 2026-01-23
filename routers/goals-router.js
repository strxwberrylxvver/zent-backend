import { Router } from "express";
import database from "../database.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const formatRecordForDatabase = (record) => {
  const formattedRecord = { ...record };
  if (formattedRecord.Date) {
    formattedRecord.Date = new Date(formattedRecord.Date)
      .toISOString()
      .split("T")[0];
  }

  return formattedRecord;
};

const read = async (query) => {
  try {
    const [result] = await database.query(query.sql, query.data);
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

const buildSetFields = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ","),
    "SET"
  );

const createGoals = async (createQuery) => {
  try {
    const status = await database.query(createQuery.sql, createQuery.data);
    const readQuery = buildGoalsReadQuery(status[0].insertId, null);
    const { isSuccess, result, message } = await read(readQuery);

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

const updateGoals = async (updateQuery) => {
  try {
    const status = await database.query(updateQuery.sql, updateQuery.data);
    const readQuery = buildGoalsReadQuery(updateQuery.data.GoalID, null);
    const { isSuccess, result, message } = await read(readQuery);

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

const deleteGoals = async (deleteQuery) => {
  try {
    const status = await database.query(deleteQuery.sql, deleteQuery.data);

    return status[0].affectedRows === 0
      ? {
          isSuccess: false,
          result: null,
          message: `Failed to delete record : Record not found.`,
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

const buildGoalsReadQuery = (id, variant) => {
  let sql = "";
  let table =
    "savingsgoals INNER JOIN users ON savingsgoals.UserID=users.UserID";
  let fields = [
    "GoalID",
    "GoalName",
    "SavedAmount",
    "TargetAmount",
    "TargetDate",
    "CONCAT(FirstName,' ',LastName) AS UserName",
  ];

  switch (variant) {
    case "user":
      sql = `SELECT ${fields.join(
        ","
      )} FROM ${table} WHERE savingsgoals.UserID = :ID`;
      break;
    default:
      sql = `SELECT ${fields.join(",")} FROM ${table} `;
      if (id) sql += ` WHERE GoalID = :ID`;
  }
  return { sql, data: { ID: id } };
};

const buildGoalsCreateQuery = (record) => {
  const table = "savingsgoals";
  const fields = [
    "GoalID",
    "GoalName",
    "SavedAmount",
    "TargetAmount",
    "TargetDate",
    "UserID",
  ];

  const columns = fields.join(", ");
  const placeholders = fields.map((f) => `:${f}`).join(", ");
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  return { sql, data: formatRecordForDatabase(record) };
};

const buildGoalsUpdateQuery = (record, id) => {
  const table = "savingsgoals";

  const mutableFields = [
    "GoalName",
    "SavedAmount",
    "TargetAmount",
    "TargetDate",
    "UserID",
  ];
  const formattedRecord = formatRecordForDatabase(record);
  const keys = mutableFields.filter((f) => record[f] !== undefined);
  const setClause = keys.map((f) => `${f} = :${f}`).join(", ");
  const sql = `UPDATE ${table} SET ${setClause} WHERE GoalID = :GoalID`;
  return { sql, data: { ...formattedRecord, GoalID: id } };
};

const buildGoalsDeleteQuery = (id) => {
  const sql = `DELETE FROM savingsgoals WHERE GoalID = :GoalID`;
  return { sql, data: { GoalID: id } };
};

const getGoalsController = async (req, res, variant) => {
  const id = req.params.id;
  const query = buildGoalsReadQuery(id, variant);
  const { isSuccess, result, message: accessorMessage } = await read(query);
  if (!isSuccess) return res.status(400).json({ message: accessorMessage });

  res.status(200).json(result);
};

const postGoalsController = async (req, res) => {
  const record = req.body;
  record.GoalID = uuidv4();
  const query = buildGoalsCreateQuery(record);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await createGoals(query);
  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(201).json(result);
};

const putGoalsController = async (req, res) => {
  const id = req.params.id;
  const record = req.body;

  const query = buildGoalsUpdateQuery(record, id);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await updateGoals(query);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

const deleteGoalsController = async (req, res) => {
  const id = req.params.id;

  const query = buildGoalsDeleteQuery(id);
  const {
    isSuccess,
    result,
    message: accessorMessage,
  } = await deleteGoals(query);

  if (!isSuccess) return res.status(404).json({ message: accessorMessage });
  res.status(200).json(result);
};

router.get("/users/:id", (req, res) => getGoalsController(req, res, "user"));
router.get("/:id", (req, res) => getGoalsController(req, res, null));
router.get("/", (req, res) => getGoalsController(req, res, null));

router.post("/", postGoalsController);
router.put("/:id", putGoalsController);
router.delete("/:id", deleteGoalsController);

export default router;
