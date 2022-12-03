// require('dotenv').config();

const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MySQL = require('../database/mysql');

const { barCreate, paginate, queryDB, queryDBParams, fieldGet, generatePDF } = require("../utils/utils");


exports.index = async (req, res, next) => {
  try {

    let sql = `
      SELECT 
        hr_employee.id,hr_employee.name,hr_employee.mobile_phone,hr_employee.job_title,
        hr_employee.email, 
        (SELECT name FROM hr_departments WHERE hr_employee.department_id = hr_departments.id) AS dep_name 
      FROM hr_employee JOIN hr_departments ON hr_employee.department_id = hr_departments.id`;
    
    let { data, meta } = await paginate(req, 'hr_employee', sql);
    
    res.render("Employee/index", {
      page_name: null,
      appName: 'Employees',
      appRootLocation: '/employees',
      barCreate,
      data,
      meta,
      user: req.user,
      req
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

  res.render("Employee/create", {
    page_name: null,
    appName: 'Employees',
    appRootLocation: '/employees',
    barCreate,
    user: req.user,
    error: null

  });
}

exports.view = async (req, res, next) => {
  try {
    let { id } = req.params || null;
    //if not a valid number id provided on the query parameter
    if (!id && isNaN(id)) throw Error("invalid type parameter !");

    //Check if user request his employee profile if not return authorized
    if (id != req.user.employee_id && req.user.role == 'employee'){
      return res.redirect(401,"/unauthorized");
    }

    
    let data = await queryDB('select * from hr_employee where id = ' + id);
      
    res.render("Employee/view", {
      page_name: null,
      appName: 'Employees',
      appRootLocation: '/employees',
      barCreate,
      data: data[ 0 ],
      user: req.user,
      error: null
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

        let data = await queryDB('select * from hr_employee where id = ' + id);
        
        res.render("Employee/update", {
          page_name: null,
          appName: 'Employees',
          appRootLocation: '/employees',
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


//All api route requets
exports.apiGet = async (req, res) => {
  try {
    let data = [];
    let { q } = req.query;

    if (q) {
      data = await queryDB(`select id,name from hr_employee where name like '%${q}%'`);
    } else {
      data = await paginate(req, 'hr_employee');
    }
    return res.json(data);
  }catch(error) {
   return res.json(error);
  }
}

exports.apiPost = async (req, res,next) => {
  try {
    //If an action is passed as on query paramater
    //Go to next controller or middleware;
    let { action } = req.query;
    if (action) {
      next();
      return;
    }

    let sql = "INSERT INTO hr_employee SET ?";
    //execute query
    await queryDBParams(sql, req.body);
    res.redirect('/employees');
  }catch(error) {
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
}

exports.apiPut = async (req, res, next) => {
  try {  
    //If an action is passed as on query paramater
    //Go to next controller or middleware;
    let { action } = req.query;
    if (action == 'report') {
      next();
      return;
    }
    let sql = `UPDATE hr_employee SET ? WHERE id = ${req.body.id}`;
    //execute query
    await queryDBParams(sql, req.body);
    res.redirect('/employees');
  } catch (error) {
    console.log(error);
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
}

exports.apiReport = async (req, res) => {
  try {
      //SQL QUERY
    const sql = `
      SELECT 
        hr_employee.id, hr_employee.name, hr_employee.roll_no, 
        hr_employee.job_title, hr_employee.mobile_phone,hr_employee.email,
        (SELECT name from hr_departments WHERE hr_employee.department_id = hr_departments.id) as dep_name 
      FROM
        hr_employee
      JOIN 
        hr_departments 
      ON 
        hr_employee.department_id = hr_departments.id
      ORDER BY hr_employee.name ASC
    `;
    
    let data = await queryDB(sql);
    let meta = {
      ...req.body,
      user: await fieldGet(req.user.id, 'name', 'hr_users'),
      time: new Date().toLocaleString()
    };

    //Generate PDF
    generatePDF('employees_list.ejs', { data, meta }, 'Employee list', res);

  } catch (error) {
    console.log(error);
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
}