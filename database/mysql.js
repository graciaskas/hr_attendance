const mysql = require('mysql');
const env = require('dotenv');

env.config();

const { DB_NAME,DB_HOST,DB_USER,DB_PASS } = process.env;

module.exports = class Mysql {

  static connect() {
    try {
      // establish connection
      const db = mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
      });
      // connect to database
      db.connect((err) => {
        if (err) {
          throw err;
        }
        console.log('Database Connected');
      });
      return db;
    } catch (error) {
      console.log(error);
    }
  }
};
