// require('dotenv').config();

const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { barCreate, paginate, queryDB, queryDBParams, fieldGet, datesInterval } = require("../utils/utils");

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
  let hasCheckOut = false;
  let t = null;

  
  if (data.length != 0) {
    canCheckOut = true;
    let currentTime = new Date();
    let { checkin, id } = data[0];
   
    
    let d = checkin.slice(0, 2);
    let m = checkin.slice(3, 5);
    let y = checkin.slice(6, 10);
    let time = checkin.slice(10, checkin.length);

    checkin = `${m}-${d}-${y} ${time}`;

    t = datesInterval(checkin, currentTime.toISOString());
    t.id = id;

    //If the user or employee has checked out;
    if (data[ 0 ].checkout != null) {
      hasCheckOut = true;
      res.render('error', {
        code: 403,
        content: 'You have Checked Out At ' + data[ 0 ].checkout
      });
    }
    
  }
  
  res.render('Attendance/kiosque', {
    page_name: null,
    appName: 'Attendances',
    appRootLocation: '/Attendances',
    barCreate,
    user: req.user,
    canCheckOut,
    t,
    checkin: data[ 0 ].checkin,
    hasCheckOut
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


exports.apiPost = async (req, res, next) => {
  try {

    //If an action is passed as on query paramater
    //Go to next controller or middleware;
    let { action } = req.query;
    if (action) {
      next();
      return;
    }
    
    let sql = "INSERT INTO hr_attendances SET ?";
    let params = { ...req.body, approved_by: null };

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

exports.apiPut = (req, res) => {
  try {
    let sql = 'UPDATE hr_attendances SET ? where id = '+req.body.id;
    queryDBParams(sql, req.body)
      .then(result => res.redirect("/attendances"))
      .catch(error => {
        console.log(error);
        res.render("error", {
          code: 500,
          content: error.message || error
        });
      });
  } catch (error) {
    console.log(error);
    res.render("error", {
      code: 500,
      content: error.message || error
    });
  }
}