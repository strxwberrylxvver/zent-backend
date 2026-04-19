const budgetsModel = {
  table: "budgets",
  idField: "BudgetID",
  fields: ["BudgetID", "BudgetName", "UsedAmount", "TotalAmount", "BudgetDate", "budgets.UserID", "budgets.CategoryID"],

  buildReadQuery(id, variant) {
    const table = "budgets INNER JOIN users ON budgets.UserID = users.UserID";
    const fields = [
      this.idField,
      ...this.fields,
      "CONCAT(FirstName,' ',LastName) AS UserName",
    ].join(", ");

    switch (variant) {
      case "user":
        return {
          sql: `SELECT ${fields} FROM ${table} WHERE budgets.UserID = :ID`,
          data: { ID: id },
        };
      default:
        return {
          sql: `SELECT ${fields} FROM ${table}${id ? " WHERE BudgetID = :ID" : ""}`,
          data: { ID: id },
        };
    }
  },
};

export default budgetsModel;