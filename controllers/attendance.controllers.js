// require('dotenv').config();

const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { barCreate, paginate, queryDB, queryDBParams, fieldGet } = require("../utils/utils");

exports.index = async (req, res, next) => {
  try {
    let sql = `
      SELECT hr_attendances.id, hr_attendances.checkin, hr_attendances.checkout, hr_attendances.worked_hours, hr_attendances.state, (SELECT name from hr_employee WHERE hr_attendances.employee_id = hr_employee.id) as emp_name, 
      (SELECT name from hr_employee WHERE hr_attendances.approved_by = hr_employee.id) as emp_approved FROM hr_attendances join hr_employee on hr_attendances.employee_id = hr_employee.id
    `;

    let data = await paginate(req, 'hr_attendances', sql);
    
    res.render("Attendance/index", {
      page_name: null,
      appName: 'Attendances',
      appRootLocation: '/attendances',
      barCreate,
      data: data.data,
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
  res.render("Attendance/create", {
    page_name: null,
    appName: 'Attendances',
    appRootLocation: '/attendances',
    barCreate,
    user: req.user,
    error: null
  });
}

exports.view = async (req, res, next) => {
    try {
        let { id } = req.params || null;
        if (!id && isNaN(id)) throw Error("invalid type parameter !");

        let data = await queryDB('select * from hr_attendances where id = ' + id);
        res.render("Attendance/view", {
            page_name: null,
            appName: 'Attendances',
            appRootLocation: '/attendances',
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

        let data = await queryDB('select * from hr_attendances where id = ' + id);
        
        res.render("Attendance/update", {
            page_name: null,
            appName: 'Attendances',
            appRootLocation: '/Attendances',
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

exports.kiosque = async (req, res) => {
  let sql = 'SELECT * FROM hr_attendances WHERE employee_id = ? and state = "draft" order by id desc limit 1';
  let data = await queryDBParams(sql, req.user.employee_id);
  let canCheckOut = false;
  
  if (data.length != 0) {
    canCheckOut = true;
    let worked_hours = '';
    let  checkin  = new Date(data[0].create_date);
    console.log(checkin.to);
  }
  
  res.render('Attendance/kiosque', {
    page_name: null,
    appName: 'Attendances',
    appRootLocation: '/Attendances',
    barCreate,
    user: req.user,
    canCheckOut
  });
}


//-------All api route requets
exports.apiGet = async (req, res) => {
  try {
    let data = [];
    let { q } = req.query;

    if (q) {
      data = await queryDB(`select id,name from hr_attendances where name like '%${q}%'`);
    } else {
      data = await paginate(req, 'hr_attendances');
    }
    return res.json(data);
  }catch(error) {
   return res.json(error);
  }
}


exports.apiPost = async (req, res) => {
  try {
    
    let sql = "INSERT INTO hr_attendances SET ?";
    let params = { ...req.body, approved_by: null };

    console.log(req.body.checkin);

    // return res.json(req.body);

    queryDBParams(sql, params)
      .then(success => res.redirect('/attendances'))
      .catch(err => {
        console.log(err);
        res.render('Attendance/create', {
          error: err.message || err,
          ...req.body,
          page_name: 'Attendances',
          user: req.user
        });
      });
  
  } catch (error) {
    console.log(error);
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
}