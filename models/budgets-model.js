const model = {};
model.table = "budgets";
model.fields = [
  "BudgetID",
  "BudgetName",
  "UsedAmount",
  "TotalAmount",
  "BudgetDate",
  "budgets.UserID",
  "budgets.CategoryID",
];

model.idField = "BudgetID";

model.buildReadQuery = (id, variant) => {
  const resolvedTable =
    "budgets INNER JOIN users ON budgets.UserID=users.UserID";
  const resolvedfields = [
    model.idField,
    ...model.fields,
    "CONCAT(FirstName,' ',LastName) AS UserName",
  ];
  let sql = "";

  switch (variant) {
    case "user":
      sql = `SELECT ${resolvedfields.join(
        ","
      )} FROM ${resolvedTable} WHERE budgets.UserID = :ID`;
      break;
    default:
      sql = `SELECT ${resolvedfields.join(",")} FROM ${resolvedTable} `;
      if (id) sql += ` WHERE BudgetID = :ID`;
  }
  return { sql, data: { ID: id } };
};

export default model;
