const usersModel = {
  table: "users",
  idField: "UserID",
  fields: ["UserID", "FirstName", "LastName", "Email", "PasswordHash", "UserType"],

  buildReadQuery(id, variant) {
    switch (variant) {
      case "email":
        return {
          sql: "SELECT * FROM users WHERE Email = :ID",
          data: { ID: id },
        };
      default:
        return {
          sql: `SELECT UserID, FirstName, LastName, Email, UserType, CreatedAt FROM users${id ? " WHERE UserID = :ID" : ""}`,
          data: { ID: id },
        };
    }
  },
};

export default usersModel;