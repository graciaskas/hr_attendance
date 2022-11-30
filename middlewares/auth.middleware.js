require('dotenv').config();
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  dateStrings: 'date',
  database: DB_NAME,
});


const selectID = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT name FROM hr_users WHERE id = ?';
    db.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

exports.requireAuth = (req, res, next) => {
  try {
    
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.redirect('/login');
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, result) => {
      if (err) return res.redirect(403, '/login');
      
      const { user } = result;
      const data = await selectID(user.id);
        
      if (data.length === 0) {
        return res.redirect(403, '/unauthorized');  
      } 
        
      req.user = user;
      next();
      
    });

  } catch (error) {
    res.render('error', {
      code: 500,
      content: error.message || error
    })
  }
};


exports.forwardAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) next();

  jwt.verify(token, process.env.JWT_SECRET, async (err, result) => {
    if (err) {
      next();
    } else {
      const data = await selectID(result.user.id);
      if (data.length === 0) {
        next();
      } else {
        req.user = result.id;
        res.redirect('/dashboard');
      }
    }
  });
 
};


