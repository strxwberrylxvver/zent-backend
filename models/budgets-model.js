import { budgetsSchema as schema } from "../validators/schemas.js";
 
const budgetsModel = {
  schema,
  table: "budgets",
  idField: "BudgetID",
  fields: ["BudgetID", "BudgetName", "UsedAmount", "TotalAmount", "BudgetDate", "UserID", "CategoryID"],
 
  buildReadQuery(id, variant, filters = {}) {
    const table = "budgets INNER JOIN users ON budgets.UserID = users.UserID";
    const fields = [
      "budgets.BudgetID", "budgets.BudgetName", "budgets.UsedAmount",
      "budgets.TotalAmount", "budgets.BudgetDate", "budgets.UserID",
      "budgets.CategoryID", "CONCAT(FirstName,' ',LastName) AS UserName",
    ].join(", ");
 
    if (!variant && id) {
      return { sql: `SELECT ${fields} FROM ${table} WHERE budgets.BudgetID = :ID`, data: { ID: id } };
    }
 
    if (variant === "user") {
      const conditions = ["budgets.UserID = :ID"];
      const data = { ID: id };
 
      if (filters.month)  { conditions.push("DATE_FORMAT(budgets.BudgetDate, '%Y-%m') = :month"); data.month = filters.month; }
      if (filters.search) { conditions.push("budgets.BudgetName LIKE :search"); data.search = `%${filters.search}%`; }
 
      const sortField = { date: "budgets.BudgetDate", amount: "budgets.TotalAmount", name: "budgets.BudgetName" }[filters.sort] ?? "budgets.BudgetDate";
      const order = filters.order === "asc" ? "ASC" : "DESC";
 
      return { sql: `SELECT ${fields} FROM ${table} WHERE ${conditions.join(" AND ")} ORDER BY ${sortField} ${order}`, data };
    }
 
    return { sql: `SELECT ${fields} FROM ${table}`, data: {} };
  },
};
 
export default budgetsModel;