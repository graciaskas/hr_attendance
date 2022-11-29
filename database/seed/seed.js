const mysql = require('mysql');
const env = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid').v4;

env.config();
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'node-attendance',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Mysql Connected');
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
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};



const reset = async () => {
  try {
    await new Promise((r) => setTimeout(r, 2000)); // wait for mysql connection
    await zeroParamPromise('SET FOREIGN_KEY_CHECKS = 0');
    for (let i = 0; i < relations.length; ++i) {
      await zeroParamPromise('TRUNCATE TABLE ' + relations[i]);
      console.log(relations[i] + ' truncated');
    }
    
    await zeroParamPromise('SET FOREIGN_KEY_CHECKS = 1');

    // 1.Add Admin
    const hashedPassword = await bcrypt.hash('sysadmin96', 8);
    await queryParamPromise('insert into hr_users set ?', {
      // admin_id: uuidv4(),
      name: 'Gracias Kasongo',
      login:'gracias',
      email: 'info@zeslap.com',
      password: hashedPassword,

    });


    // 2.Add Departments
    for (let i = 0; i < department_data.length; ++i) {
      await queryParamPromise(
        'insert into hr_departments set ?',
        departments[i]
      );
    }

    console.log('departments added');
    

    // 5.Add Employees
    for (let i = 0; i < studentsData.length; ++i) {
      let currentStudent = studentsData[i];
      const hashedPassword = await bcrypt.hash('iloveyoustudent', 8);
      currentStudent = {
        s_id: uuidv4(),
        ...currentStudent,
        password: hashedPassword,
      };
      await queryParamPromise('insert into student set ?', currentStudent);
    }
    console.log('students added');
  } catch (err) {
    throw err;
  } finally {
    process.exit();
  }
};

reset();
