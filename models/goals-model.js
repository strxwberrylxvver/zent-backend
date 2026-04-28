import { goalsSchema as schema } from "../validators/schemas.js";
 
const goalsModel = {
  schema,
  table: "savingsgoals",
  idField: "GoalID",
  fields: ["GoalID", "GoalName", "SavedAmount", "TargetAmount", "TargetDate", "UserID"],
 
  buildReadQuery(id, variant, filters = {}) {
    const table = "savingsgoals INNER JOIN users ON savingsgoals.UserID = users.UserID";
    const fields = [
      "savingsgoals.GoalID", "savingsgoals.GoalName", "savingsgoals.SavedAmount",
      "savingsgoals.TargetAmount", "savingsgoals.TargetDate", "savingsgoals.UserID",
      "CONCAT(FirstName,' ',LastName) AS UserName",
    ].join(", ");
 
    if (!variant && id) {
      return { sql: `SELECT ${fields} FROM ${table} WHERE savingsgoals.GoalID = :ID`, data: { ID: id } };
    }
 
    if (variant === "user") {
      const conditions = ["savingsgoals.UserID = :ID"];
      const data = { ID: id };
 
      if (filters.search) { conditions.push("savingsgoals.GoalName LIKE :search"); data.search = `%${filters.search}%`; }
 
      const sortField = { date: "savingsgoals.TargetDate", amount: "savingsgoals.TargetAmount", name: "savingsgoals.GoalName" }[filters.sort] ?? "savingsgoals.TargetDate";
      const order = filters.order === "asc" ? "ASC" : "DESC";
 
      return { sql: `SELECT ${fields} FROM ${table} WHERE ${conditions.join(" AND ")} ORDER BY ${sortField} ${order}`, data };
    }
 
    return { sql: `SELECT ${fields} FROM ${table}`, data: {} };
  },
};
 
export default goalsModel;