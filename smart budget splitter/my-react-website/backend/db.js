import sqlite3 from 'sqlite3';

const sqliteDriver = sqlite3.verbose();
const db = new sqliteDriver.Database('./db.sqlite');

// Initialize the database (create the table if it doesn't exist)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS journeys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      startLocation TEXT NOT NULL,
      endLocation TEXT NOT NULL,
      distance REAL NOT NULL,
      mpg REAL NOT NULL,
      fuelCost REAL NOT NULL,
      date TEXT NOT NULL
    )
  `);
});


// Export CRUD functions

export const addJourney = async ({ userId, startLocation, endLocation, distance, mpg, fuelCost, date }) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO journeys (userId, startLocation, endLocation, distance, mpg, fuelCost, date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, startLocation, endLocation, distance, mpg, fuelCost, date],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, userId, startLocation, endLocation, distance, mpg, fuelCost, date });
      }
    );
  });
};

export const getJourneys = async (userId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM journeys WHERE userId = ? ORDER BY date DESC`,
      [userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
};

export const updateJourney = async ({ id, userId, distance, mpg, fuelCost, date }) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE journeys SET distance = ?, mpg = ?, fuelCost = ?, date = ? WHERE id = ? AND userId = ?`,
      [distance, mpg, fuelCost, date, id, userId],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0 ? { id, userId, distance, mpg, fuelCost, date } : null);
      }
    );
  });
};

export const deleteJourney = async (id, userId) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM journeys WHERE id = ? AND userId = ?`, [id, userId], function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
};

export { db };
