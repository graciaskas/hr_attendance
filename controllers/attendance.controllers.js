const path = require("path");
const fs = require("fs");
const PDF = require("html-pdf");
const ejs = require("ejs");

const { barCreate, paginate, queryDB, queryDBParams, fieldGet, datesInterval, toLocalDate, toIsoDateString, generatePDF, datesIntMilliseconds, millisecTotime } = require("../utils/utils");


exports.index = async (req, res, next) => {
  try {
    let sql = `
      SELECT 
        hr_attendances.id, hr_attendances.checkin, hr_attendances.checkout, 
        hr_attendances.worked_hours, hr_attendances.state, hr_attendances.employee_id, 
        (SELECT name from hr_employee WHERE hr_attendances.employee_id = hr_employee.id) as emp_name, 
        (SELECT name from hr_employee WHERE hr_attendances.approved_by = hr_employee.id) as emp_approved
      FROM 
        hr_attendances 
      JOIN 
        hr_employee 
      ON 
        hr_attendances.employee_id = hr_employee.id
    `;

    let { data, meta } = await paginate(req, 'hr_attendances', sql);

    /** If requested for one employee's attendances */
    let { eq } = req.query;
    if (eq && !isNaN(eq)) {
      data = data.filter(item => item.employee_id == eq); 
    }

    //If is the employee's dashboard
    if (req.user.role == 'employee') {
      data = data.filter(e => e.employee_id == req.user.employee_id);
    }
    
    res.render("Attendance/index", {
      page_name: null,
      appName: 'Attendances',
      appRootLocation: '/attendances',
      barCreate,
      data,
      meta,
      user: req.user,
      req,
      millisecTotime
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
          user: req.user,
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
      });
    }
}

exports.kiosque = async (req, res) => {

  try {

  //if is not an employee
    if (req.user.employee_id == "" || req.user.employee_id == null) {
      return res.render("error", {
        code: 401,
        content: "You are not allowed to access this resource ! \n Only employee are allowed !"
      });
    }

  //Get the lastest attendance from this user employee
  let sql = 'SELECT * FROM hr_attendances WHERE employee_id = ? order by id desc limit 1';
  let data = await queryDBParams(sql, req.user.employee_id);
    
  let canCheckOut = false;
  let hasCheckOut = false;

  let t = null;

  //If has attendee
  if (data.length > 0) {
    //Desctructure data
    let { checkin, checkout, id, state } = data[ 0 ];
    let currentTime = new Date();  //Current date time;

    //Convert checkin date to corresponding date format;
    checkin = toIsoDateString(checkin);

    //Interval between checkin and current date time;
    t = datesInterval(checkin, currentTime.toISOString());
    t.id = id;
    
    //If has not checked out yet
    if (state == 'draft' && checkout == null) {
      canCheckOut = true; //Can checkout;
    
    //If has not checked out
    } else  if (checkout != null) {
      hasCheckOut = true;

      /*** 
       * If it is not the same day 
       * 
      */
      checkout = new Date(toIsoDateString(checkout));
      //Checkout to current timed seconds difference;
      let checkoutToNowDiffSec = Math.floor((currentTime - checkout) / 1000);
      //Get days form checkoutToNowDiffSec;
      let days = Math.round(checkoutToNowDiffSec / (60 * 60 * 24));

      if (days != 0) {
        canCheckOut = false;
        hasCheckOut = false;

        return res.render('Attendance/kiosque', {
          user: req.user,
          canCheckOut,
          t,
          checkin: data.length && data[ 0 ].checkin || null,
          hasCheckOut
        });
      }


      res.status(403).render('error', {
        code: 403,
        content: 'You have already Checked Out today At ' + data[ 0 ].checkout
      });
      return;
    }

  } else {
    canCheckOut = false;
    hasCheckOut = false;
  }

    return res.render('Attendance/kiosque', {
      user: req.user,
      canCheckOut,
      t,
      checkin: data.length ? data[ 0 ].checkin : null,
      hasCheckOut
    });


  } catch (error) {
    console.log(error);
    res.render('error', {
      code: 500,
      content: error.message || error
    });
  }
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

exports.apiPut = (req, res, next) => {
  try {
    
    let { action } = req.query;
    if (action) {
      if (action != 'update') {
        next();
        return;
      }
    }

    /** 
     * Try to get work time if checked out 
     * */
    let { checkin, checkout, id, employee_id } = req.body;
    
    //Get time difference in milliseconds
    let milleseconds = datesIntMilliseconds(checkin, checkout);

    //Set work hours in milliseconds
    req.body.worked_hours = milleseconds;

    let sql = 'UPDATE hr_attendances SET ? where id = '+id;
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


exports.apiReport = async (req, res, next) => {
  try {

    //If query action is not a report action next the middleware; 
    let { action } = req.query;
    if (action) {
      if (action != 'report') {
        next();
        return;
      }
    }

    /** Check required fields **/
    let { checkin, checkout, state } = req.body;

    if ((checkin.value == "" || checkout.value == "")) {
      return res.redirect('/attendances/?error=required fields');
    } 


    //SQL QUERY
    const sql = `
      SELECT 
        hr_attendances.id, hr_attendances.checkin, hr_attendances.checkout, hr_attendances.worked_hours, hr_attendances.state, hr_attendances.employee_id, 
        (SELECT name from hr_employee WHERE hr_attendances.employee_id = hr_employee.id) as emp_name, 
        (SELECT name from hr_employee WHERE hr_attendances.approved_by = hr_employee.id) as emp_approved
      FROM
        hr_attendances
      JOIN hr_employee ON hr_attendances.employee_id = hr_employee.id`;
    
    let data = await queryDB(sql);

    /** If user is an employee and has employee role only  or only user's attendances */
    if (req.user.role == 'employee' || req.body.only_user ) {
      data = data.filter(elm => elm.employee_id == req.user.employee_id);
    }
  
    /** Try to get the records responding to the request criteria **/
    const getResults = async () => {
      
      let results = [];
      const req_checkin = new Date(checkin);
      const req_checkout = new Date(checkout);

      data.filter(record => {
        //Database checkin <=> checkout converted to date instances
        const db_checkin = new Date(toIsoDateString(record.checkin));
        let db_checkout = null;

        if (record.checkout != null) {
          db_checkout = new Date(toIsoDateString(record.checkout));
        }
        
        //if record's checkin date includes the user's checkin interval
        if (db_checkin >= req_checkin && record.state == state ) {
          //The if record checkout is less than user's checkout request
          if (db_checkout <= req_checkout) { 
            results.push(record);
          } else if (db_checkout == null) {
            results.push(record);
          }
        }

      });

      return results;
    };

 
    let results = await getResults();

    let meta = {
      ...req.body,
      user: await fieldGet(req.user.id, 'name', 'hr_users'),
      time: new Date().toLocaleString()
    };

    //Generate PDF
    generatePDF(
      'attendances_list.ejs',
      { data: results, meta, millisecTotime },
      'Attendances list',
      res
    );
    

  } catch (error) {
    console.log(error);
    res.render("error", {
      code: 500,
      content: error.message || error
    });
  }
}