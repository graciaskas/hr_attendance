const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const MySQL = require('../database/mysql');
let db = MySQL.connect();
// Database query promise
const query = (sql) => {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

// Database query with parameters promise
const queryDBParams = (sql, queryParam) => {
  return new Promise((resolve, reject) => {
    db.query(sql, queryParam, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

//Get table row field value according to given row id 
const fieldGet = (id, field, tableName) => {
    return new Promise((resolve, reject) => {
        let sql = `select ${field} from ${tableName} where id= ?`;
        db.query(sql, [id],(err, results) => {
        if (err) return reject(err);
        return resolve(results[0][field]);
        });
    });
};



exports.paginate = function (req, tableName,sql) {
    return new Promise(async (resolve, reject) => {
        try {
            let { pg, lim } = req.query;
            let total = await query(`select count(*) as total from ${tableName}`);
            
            let itemsPerPage = parseInt(lim) || 24;
            let total_pages = Math.ceil(total[0].total / itemsPerPage);
            let currentPage = 1;
            
            if (pg) {
                if (!isNaN(pg)) {
                    currentPage = parseInt(pg);
                    if (pg > total_pages) {
                        currentPage = total_pages;
                    }
                }else {
                    reject("Invalid parameter passed");
                }
            } 

            let start = (currentPage - 1) * itemsPerPage;

            if (sql) { // If any SQL Query provided;
                sql = `${sql}  ORDER BY id DESC LIMIT  ${start},${itemsPerPage}`;
            } else {
                sql = `select * from ${tableName} ORDER BY id DESC LIMIT  ${start},${itemsPerPage}`
            }
                       
            db.query(sql, (err, data) => {
                if (!err) {
                    resolve({
                        data,
                        meta: {
                            total_items: data.length,
                            items_onpage: itemsPerPage,
                            current_page: currentPage,
                            total_pages
                        }
                    });
                    return;
                }
                reject(err);
            });
           

        } catch (error) {
            reject(error);
        }
    })
} 

exports.barCreate = (options) => {
    
    const { appName, appRootLocation, create } = options;
    return `
        <div class="col-12 mb-3">
                <div class="d-flex flex-wrap align-items-center justify-content-between bg-white rounded shadow-default p-3">
            
                    <h5 class='text-secondary text-raleway' style='margin-bottom:2px'>
                        <a href='/'><i class='fa fa-home'></i></a> /
                        <a href="/${appName.toLowerCase()}">${appName}</a> /
                        ${ create ==  true? `<a href="${appName.toLowerCase()}/create">Create</a>`:''}
                    </h5>
            
            
                    <div class="pagination" role="list">
                        <li class="page-item dropdown">
                            <a to="#" class="page-link dropdown-toggle" id="dropdownFilters" data-bs-toggle="dropdown">
                                <i class='fa fa-filter'></i> Filter
                            </a>
                            <ul class="dropdown-menu p-4 shadow-default border-0 rounded w-auto" aria-labelledby="dropdownFilters">
                                <li>
                                    <a href="#" class="dropdown-itemx">All</a>
                                </li>
                                <li>
                                    <a href="#" class="dropdown-itemx">Archived</a>
                                </li>
                                <li>
                                    <a href="#" class="dropdown-itemx">Not activated</a>
                                </li>
                                <li>
                                    <a class='dropdown-itemx'><i class='fa fa-plus-circle'></i> Custom filter</a>
                                </li>
                            </ul>
                        </li>
                        <li class="page-item">
                            <a to="?view=grid" class="page-link">
                                <i class='fa fa-bars'></i> Group by
                            </a>
                        </li>
                    </div>
            
                    <div class='pagination' role="list">
                        <li class="page-item">
                            <a href="#" class='page-link input'>
                                <input type="number" defaultValue={data.length} />
                            </a>
                        </li>
            
                        <li class="page-item">
                            <a href="#" class='page-link'>02</a>
                        </li>
            
                        <li class="page-item">
                            <a href="#" class='page-link'>
                                <i class="fa fa-chevron-circle-left"></i>
                            </a>
                        </li>
            
                        <li class="page-item">
                            <a href="#" class='page-link'>
                                <i class="fa fa-chevron-circle-right"></i>
                            </a>
                        </li>
            
            
                        <li class="page-item" key={id}>
                            <a href='?view=th' class="page-link">
                                <i class='fa fa-th'></i>
                            </a>
                        </li>
            
                        <li class="page-item">
                            <a href='?view=list' class="page-link">
                                <i class='fa fa-list'></i>
                            </a>
                        </li>
            
            
                    </div>
            
            
                </div>
            </div>
    `
}

exports.queryDB = query;
exports.queryDBParams = queryDBParams;
exports.fieldGet = fieldGet; 
