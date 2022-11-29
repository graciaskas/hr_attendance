// require('dotenv').config();

const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { barCreate, queryDBParams, hashPassword, queryDB } = require("../utils/utils");


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
    });
  }
}

exports.update = async (req, res) => {
    try {
      let { id } = req.params || null;
      if (!id && isNaN(id)) throw Error("invalid type parameter !");

      let data = await queryDB('select * from hr_users where id = ' + id);
      
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
            user: req.user
          });
        }
      });    
  }catch(error) {
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
}