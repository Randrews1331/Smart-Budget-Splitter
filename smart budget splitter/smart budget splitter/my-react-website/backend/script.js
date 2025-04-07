import { db } from "./db.js";

// Query and display all journeys
db.all("SELECT * FROM journeys", [], (err, rows) => {
  if (err) {
    console.error("Error fetching journeys:", err);
  } else {
    if (rows.length === 0) {
      console.log("No journeys found in the database.");
    } else {
      console.log("Journeys found in the database:", rows);
    }
  }
});
