const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mailgun = require('mailgun-js');
const { DOMAIN, DB_NAME }  = process.env;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

const MySQL = require('../database/mysql');
const { paginate, queryDBParams,millisecTotime } = require('../utils/utils');

// Students limit per section
const SECTION_LIMIT = 20;




exports.postForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).render('Admin/forgotPassword');
  }

  let errors = [];

  const sql1 = 'SELECT * from admin WHERE email = ?';
  const results = await queryDBParams(sql1, [email]);
  if (!results || results.length === 0) {
    errors.push({ msg: 'That email is not registered!' });
    res.status(401).render('Admin/forgotPassword', {
      errors,
    });
  }

  const token = jwt.sign(
    { _id: results[0].admin_id },
    process.env.RESET_PASSWORD_KEY,
    { expiresIn: '20m' }
  );

  const data = {
    from: 'noreplyCMS@mail.com',
    to: email,
    subject: 'Reset Password Link',
    html: `<h2>Please click on given link to reset your password</h2>
                <p><a href="${process.env.URL}/admin/resetpassword/${token}">Reset Password</a></p>
                <hr>
                <p><b>The link will expire in 20m!</b></p>
              `,
  };

  const sql2 = 'UPDATE admin SET resetLink = ? WHERE email = ?';
  db.query(sql2, [token, email], (err, success) => {
    if (err) {
      errors.push({ msg: 'Error In ResetLink' });
      res.render('Admin/forgotPassword', { errors });
    } else {
      mg.messages().send(data, (err, body) => {
        if (err) throw err;
        else {
          res.redirect('/admin/forgot-password');
        }
      });
    }
  });
};

// 1.7 Reset Password


exports.postResetPassword = (req, res, next) => {
  const { resetLink, password, confirmPass } = req.body;

  let errors = [];

  if (password !== confirmPass) {
    req.flash('error_msg', 'Passwords do not match!');
    res.redirect(`/admin/resetpassword/${resetLink}`);
  } else {
    if (resetLink) {
      jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, data) => {
        if (err) {
          errors.push({ msg: 'Token Expired!' });
          res.render('Admin/resetPassword', { errors });
        } else {
          const sql1 = 'SELECT * FROM admin WHERE resetLink = ?';
          db.query(sql1, [resetLink], async (err, results) => {
            if (err || results.length === 0) {
              throw err;
            } else {
              let hashed = await bcrypt.hash(password, 8);

              const sql2 = 'UPDATE admin SET password = ? WHERE resetLink = ?';
              db.query(sql2, [hashed, resetLink], (errorData, retData) => {
                if (errorData) {
                  throw errorData;
                } else {
                  req.flash(
                    'success_msg',
                    'Password Changed Successfully! Login Now'
                  );
                  res.redirect('/admin/login');
                }
              });
            }
          });
        }
      });
    } else {
      errors.push({ msg: 'Authentication Error' });
      res.render('Admin/resetPassword', { errors });
    }
  }
};






// 1.3 Dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    
    let sql = `
      SELECT 
        hr_attendances.id, hr_attendances.checkin, hr_attendances.checkout, 
        hr_attendances.worked_hours, hr_attendances.state,hr_attendances.employee_id,  
        (SELECT name from hr_employee WHERE hr_attendances.employee_id = hr_employee.id) as emp_name, 
        (SELECT name from hr_employee WHERE hr_attendances.approved_by = hr_employee.id) as emp_approved
      FROM  
        hr_attendances 
      JOIN 
        hr_employee 
      ON 
        hr_attendances.employee_id = hr_employee.id
    `;
    let attendances = await paginate(req, 'hr_attendances', sql);

    //If is the employee's dashboard
    if (req.user.role == 'employee') {
      attendances.data = attendances.data.filter(e => e.employee_id == req.user.employee_id);
    }

    res.render('dashboard',{
      user: req.user,
      page_name: 'overview',
      data: attendances.data,
      millisecTotime
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      code: 500,
      content: error.message || error
    })
  }
};


// 1.4 Logout
exports.getLogout = (req, res, next) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.cookie('session_id', '', { maxAge: 1 });
  res.redirect('/login');
};

exports.getIndex = (req, res, next) => {
  res.render('index');
};

exports.getLogin = (req, res, next) => {
  res.render('login', { error: {} });
};

exports.getLanding = (req, res, next) => {
  res.render('landing');
}

exports.getResetPassword = (req, res) => {
  res.render('reset');
};

exports.getError = (req, res, next) => {
  res.status(401).render('error', {
    code: 401,
    content: `Sorry, you are not authorized to access that resource! Please contact the System Adminstrator to help you achieve your goal.`
  });
};



