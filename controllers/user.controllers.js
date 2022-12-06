// require('dotenv').config();

const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { barCreate, queryDBParams, hashPassword, queryDB, paginate } = require("../utils/utils");


exports.index = async (req, res, next) => {
  try {
    let sql = 'select * from hr_users';
    let { data, meta } = await paginate(req,'hr_users',sql);

    res.render("User/index", {
      page_name: null,
      appName: 'Users',
      barCreate,
      data,
      meta,
      user: req.user,
      sys_meta: req.sys_meta
    });
  } catch (error) {
    console.log(error);
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
    user: req.user,
    sys_meta: req.sys_meta
  });
}

exports.view = async (req, res, next) => {
  try {
    let { id } = req.params || null;
    if (!id && isNaN(id)) throw Error("invalid type parameter !");

    let data = await queryDB('select * from hr_users where id = ' + id);

    
    res.render("User/view", {
      page_name: null,
      appName: 'Users',
      appRootLocation: '/users',
      barCreate,
      data: data[ 0 ],
      user: req.user,
      sys_meta: req.sys_meta
    });
      
  } catch (error) {
    console.log(error);
    res.render("error", {
      code: 500,
      content: error.message || error
    });
  }
}


//All API  requets
exports.apiPost = async (req, res, next ) => {
  try {
    
    //If update requested
    let { action } = req.query;
    if (action && action == 'update') {
      next();
      return;
    }

    const hashedPassword = await hashPassword(req.body.password); 
    //If selected related employee
    //Set user as employee
    if (req.body.employee_id != null) {
      req.body.is_employee = 1;
    }
    //Assign password value to hashed password;
    req.body.password = hashedPassword;

    let sql = ` INSERT INTO hr_users SET ?`;
    
    //execute query
    queryDBParams(sql, req.body)
      .then(result => res.redirect("/users"))
      .catch( err => {
        if (err) {
          res.render('User/create', {
            error: err.message || err,
            ...req.body,
            page_name: 'Users',
            user: req.user,
            sys_meta: req.sys_meta,
            req
          });
        }
      });    
  } catch (error) {
    console.log(error);
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
}

exports.apiPut = (req, res, next) => {
  try {
    let sql = 'UPDATE hr_users SET ? WHERE id = ' + req.body.id;

    queryDBParams(sql, [ req.body ])
      .then(result => res.redirect("/users"))
      .catch(error => {
        console.log(error);
        res.render("error", {
          code: 500,
          content: error.message || error
        })
      })
  } catch (error) {
    console.log(error);
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
}