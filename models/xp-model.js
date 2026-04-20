const xpModel = {
    table: "xp",
    idField: "UserID",
    fields: ["UserID", "CurrentXP", "Level"],
  
    buildReadQuery(id) {
      return {
        sql: `SELECT xp.UserID, CurrentXP, Level, CONCAT(FirstName,' ',LastName) AS UserName
              FROM xp INNER JOIN users ON xp.UserID = users.UserID
              WHERE xp.UserID = :ID`,
        data: { ID: id },
      };
    },
  };
  
  export default xpModel;