const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const mailgun = require('mailgun-js');
const { queryDB, queryDBParams } = require('../utils/utils');

const { DOMAIN, DB_NAME }  = process.env;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });




exports.postLogin = (req, res, next) => {

  try {


    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).render('index', {
        error: {
          type: 'danger',
          message: "Please fill in all the fields !"
        }
      });
    }

    let sql = 'SELECT * FROM hr_users WHERE email = ?';

    queryDBParams(sql, [ email ])
      .then(async results => {
        
        if (results.length === 0) {
          return res.status(401).render('login', {
            error: {
              type: 'danger',
              message: "We could not find this account !"
            },
            ...req.body
          });

        } else {
          const user = results[ 0 ];
          
          //decrypt and compare password with hashed db password
          bcrypt.compare(password, user.password, (e, result) => {
            if (e) { console.log(e); } else {
              console.log(result, password, user.password);
            }
          });

          // if (!decrypt) {
          //   return res.status(401).render('login', {
          //     error: 'Incorrect password'
          //   });
          // }



          const token = jwt.sign({
            user: {
              id: user.id,
              name: user.name,
              role: user.roles,
              employee_id: user.employee_id
            }
          }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
          });

          res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
          });

          if (user.roles != 'employee') {
            res.redirect('/dashboard');
          } else {
            res.redirect('/attendances');
          }
        }
      })
      .catch(e => {
        console.log(e);
      })
  } catch (err) {
    console.log(error);
    res.render('error', {
      code: 500,
      content: err.message || err
    })
  }
};


