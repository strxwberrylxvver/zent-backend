const userLinksModel = {
    table: "userlinks",
    idField: "LinkID",
    fields: ["LinkID", "LinkedByID", "StudentID", "LinkType"],
  
    buildReadQuery(id, variant) {
      switch (variant) {
        case "byLinker":
          return {
            sql: `SELECT ul.LinkID, ul.StudentID, ul.LinkType,
                         u.FirstName, u.LastName, u.Email, u.UserType
                  FROM userlinks ul
                  INNER JOIN users u ON ul.StudentID = u.UserID
                  WHERE ul.LinkedByID = :ID`,
            data: { ID: id },
          };
        case "byStudent":
          return {
            sql: `SELECT ul.LinkID, ul.LinkedByID, ul.LinkType
                  FROM userlinks ul WHERE ul.StudentID = :ID`,
            data: { ID: id },
          };
        default:
          return {
            sql: `SELECT * FROM userlinks WHERE LinkID = :ID`,
            data: { ID: id },
          };
      }
    },
  };
  
  export default userLinksModel;