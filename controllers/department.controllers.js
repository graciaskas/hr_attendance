// require('dotenv').config();

const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { barCreate, queryDB, queryDBParams, paginate } = require("../utils/utils");


exports.index = async (req, res, next) => {
  try {
    let sql = `
      SELECT 
        hr_departments.name AS dep_name, 
        hr_departments.id AS dep_id , 
        hr_departments.code AS dep_code, 
        hr_employee.name AS emp_name,
        (SELECT COUNT(*) FROM hr_employee WHERE department_id = dep_id) AS dep_emp
      FROM hr_departments 
      JOIN hr_employee ON hr_departments.manager_id = hr_employee.id;
    `;

    let data = await queryDB(sql);
    console.log(data);
    res.render("Department/index", {
      page_name: null,
      appName: 'Departments',
      appRootLocation: '/departments',
      barCreate,
      data,
      user:req.user
    });
  } catch (error) {
    res.render("error", {
      code: 500,
      content: error.message || error
    });
  }
}



exports.create = (req, res, next) => {
  res.render("Department/create", {
    page_name: null,
    appName: 'Departments',
    appRootLocation: '/Departments',
    barCreate,
    user: req.user,
    error: null
  });
}

exports.view = async (req, res, next) => {
    try {
        let { id } = req.params || null;
        if (!id && isNaN(id)) throw Error("invalid type parameter !");

        let data = await queryDB('select * from hr_departments where id = ' + id);

        res.render("Department/view", {
          page_name: null,
          appName: 'Departments',
          appRootLocation: '/departments',
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

        let data = await queryDB('select * from hr_Department where id = ' + id);
        
        res.render("Department/update", {
          page_name: null,
          appName: 'Departments',
          appRootLocation: '/Departments',
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

//----All api requets
exports.apiGet = async (req, res) => { 
  try {
    let data = [];
    let { q } = req.query;

    if (q) {
      data = await queryDB(`select id,name from hr_departments where name like '%${q}%'`);
    } else {
      data = await paginate(req, 'hr_departments');
    }
    return res.json(data);
  }catch(error) {
   return res.json(error);
  }
} 

exports.apiPost = async (req, res) => {
  console.log(req.body);
  try {
    let sql = `INSERT INTO hr_departments SET ? `;
    //execute query
    queryDBParams(sql, req.body)
      .then(result => res.redirect('/Departments'))
      .catch(err => { 
        res.render('Department/create', {
          error: err.message || err,
          ...req.body,
          user: req.user,
          page_name: 'Departments'
        });
      })
  }catch(error) {
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
}