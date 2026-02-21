const model = {};
model.table = "savingsgoals";
model.fields = [
  "GoalID",
  "GoalName",
  "SavedAmount",
  "TargetAmount",
  "TargetDate",
  "savingsgoals.UserID",
];

model.idField = "GoalID";

model.buildReadQuery = (id, variant) => {
  const resolvedTable =
    "savingsgoals INNER JOIN users ON savingsgoals.UserID=users.UserID";
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
      )} FROM ${resolvedTable} WHERE savingsgoals.UserID = :ID`;
      break;
    default:
      sql = `SELECT ${resolvedfields.join(",")} FROM ${resolvedTable} `;
      if (id) sql += ` WHERE GoalID = :ID`;
  }
  return { sql, data: { ID: id } };
};

export default model;
