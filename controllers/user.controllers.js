// require('dotenv').config();

const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { barCreate } = require("../utils/utils");


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  dateStrings: 'date',
  database: process.env.DB_NAME,
});

// Database query promises
const zeroParamPromise = (sql) => {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};


const queryParamPromise = (sql, queryParam) => {
  return new Promise((resolve, reject) => {
    db.query(sql, queryParam, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

exports.index = async (req, res, next) => {
  try {
    let data = await zeroParamPromise('select * from hr_users');
    res.render("User/index", {
        page_name: null,
        appName: 'Users',
        appRootLocation: '/users',
        barCreate,
        data,
        user:req.user
    });
  } catch (error) {
    res.render("error", {
        code: 500,
        content: error.message || error
    })
  }
}



exports.create = (req, res, next) => {
  res.render("User/create", {
    page_name: null,
    appName: 'Users',
    appRootLocation: '/users',
    barCreate,
    error: null,
    user:req.user
  });
}

exports.view = async (req, res, next) => {
    try {
        let { id } = req.params || null;
        if (!id && isNaN(id)) throw Error("invalid type parameter !");

        let data = await zeroParamPromise('select * from hr_users where id = ' + id);
        
        res.render("User/view", {
            page_name: null,
            appName: 'Users',
            appRootLocation: '/users',
            barCreate,
            data: data[ 0 ],
            user:req.user
        });
        
    } catch (error) {
        res.render("error", {
            code: 500,
            content: error.message || error
        })
    }
}

exports.update = async (req, res) => {
    try {
        let { id } = req.params || null;
        if (!id && isNaN(id)) throw Error("invalid type parameter !");

        let data = await zeroParamPromise('select * from hr_users where id = ' + id);
        
        res.render("Update/update", {
            page_name: null,
            appName: 'Users',
            appRootLocation: '/users',
            barCreate,
            data: data[ 0 ],
            user:req.user
        });
        
    } catch (error) {
        res.render("error", {
            code: 500,
            content: error.message || error
        })
    }
}

//All post requets
exports.postCreate = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    let sql = `
      insert into hr_users(name, email, login,password,roles,create_user) 
      values(
        "${req.body.name}",
        "${req.body.email}",
        "${req.body.login}",
        "${hashedPassword}",
        "${req.body.role}",
         "${req.user.id}"
      );
    `;
    
    //execute query
    db.query(sql , (err, result) => {
      if (err) {
        res.render('User/create', {
          error: err.message || err,
          ...req.body,
            page_name: 'Users',
          user: req.user
        });
      } else {
       res.redirect("/users")
      }
    });
    
  }catch(error) {
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
}