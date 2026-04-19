const goalsModel = {
  table: "savingsgoals",
  idField: "GoalID",
  fields: ["GoalID", "GoalName", "SavedAmount", "TargetAmount", "TargetDate", "UserID"],

  buildReadQuery(id, variant) {
    const table = "savingsgoals INNER JOIN users ON savingsgoals.UserID = users.UserID";
    const fields = [
      "savingsgoals.GoalID",
      "savingsgoals.GoalName",
      "savingsgoals.SavedAmount",
      "savingsgoals.TargetAmount",
      "savingsgoals.TargetDate",
      "savingsgoals.UserID",
      "CONCAT(FirstName,' ',LastName) AS UserName",
    ].join(", ");

    switch (variant) {
      case "user":
        return {
          sql: `SELECT ${fields} FROM ${table} WHERE savingsgoals.UserID = :ID`,
          data: { ID: id },
        };
      default:
        return {
          sql: `SELECT ${fields} FROM ${table}${id ? " WHERE savingsgoals.GoalID = :ID" : ""}`,
          data: { ID: id },
        };
    }
  },
};

export default goalsModel;