const fs = require("fs");
const path = require("path");
const bcrypt = require('bcryptjs');
const PDF = require("html-pdf");
const ejs = require("ejs");

const MySQL = require('../database/mysql');
let db = MySQL.connect();

//Hash password function
const hashPassword = (password) => {
   return new Promise((resolve, reject) => {
    bcrypt.hash(password, 8, function (err, hashedPassword) {
      if (err) return reject(err);
      return resolve(hashedPassword);
    });
  });
};




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


exports.toLocalDate = (date) => { 
    let date_converted = new Date(date);
    if (date instanceof Date && !isNaN(date)){
        throw Error(`Invalid date given ${date}`);
    } else {
        return date_converted.toLocaleString();
    }
}

/**
 * Convert string date to valid string date format
 * @param {*} datestring Date string not in format mm/dd/yy h:m:i
 * @returns Date string in format mm-dd-yy h:m:i
 */
const toIsoDateString = (datestring) => {
    let d = datestring.slice(0, 2);
    let m = datestring.slice(3, 5);
    let y = datestring.slice(6, 10);
    let time = datestring.slice(10, datestring.length);

    return `${m}-${d}-${y} ${time}`;
};

/**
 * Convert milliseconds to time
 * @param {*} milliseconds milliseconds
 * @returns time to format h:m:i
 */
exports.millisecTotime = (milliseconds) => {
   
    if (typeof milliseconds == undefined || milliseconds == null ||  isNaN(milliseconds)) {
        throw Error('Invalid argument passed !');
    } 
    if (isNaN(milliseconds)) throw Error('Argument should be number !');
    
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds %= 60;
    minutes %= 60;

    if (seconds < 10) seconds = '0'+seconds;
    if (minutes < 10) minutes = '0'+minutes;
    if (hours < 10) hours = '0'+hours;

    return `${hours}:${minutes}:${seconds}`;
}


exports.datesIntMilliseconds = (dateOne, dateTwo) => {
    dateOne = new Date(toIsoDateString(dateOne));
    dateTwo = new Date(toIsoDateString(dateTwo));

    //Check if dates are valid dates;
    if ( !(dateOne instanceof Date && !isNaN(dateOne)) || !(dateTwo instanceof Date && !isNaN(dateTwo))) {
        throw Error("Only valid dates are accepted !");
    }
    //Get time difference milliseconds
    let milleseconds = dateTwo.getTime() - dateOne.getTime();

    //Check if date two greater that date one
    if(milleseconds < 0) throw Error("Second date must be greater than first date!");
    
    return milleseconds;
}

/**
 * Get interval between two given date time
 * @param {*} dateOne argument date one
 * @param {*} dateTwo argument date two
 * @returns date interval object including days, hours, minutes and second.
*/
const datesInterval = (dateOne, dateTwo) => {
   if (!dateOne && !dateTwo) throw Error("Arguments missed");
    try {

       //Create date instances;
        let dOne = new Date(dateOne);
        let dTwo = new Date(dateTwo);


        //Get the date difference
        let difference = dTwo.getTime() - dOne.getTime();
        // Get seconds;
        let seconds = Math.floor(difference / (1000));
        //Get minutes;
        let min = Math.floor(seconds / 60);
        // Get hours;
        let hours = Math.floor(min / 60);
        // Get days;
        let days = Math.floor(hours / 24);
        
        seconds %= 60;
        min %= 60;
        
        return {
            days,
            hours,
            min,
            seconds
        }
    } catch (error) {
        throw Error(error);
    }
}

//--> https://graciaskas96.hashnode.dev/


exports.paginate = function (req, tableName, sql) {
    return new Promise(async (resolve, reject) => {
        try {
            let { page, limit } = req.query;
            let total = await query(`select count(*) as total from ${tableName}`);
            
            let itemsPerPage = parseInt(limit) || 9;
            let total_pages = Math.ceil(total[ 0 ].total / itemsPerPage);
            let currentPage = 1;
            
            if (page) {
                if (!isNaN(page)) {
                    currentPage = parseInt(page);
                    if (page > total_pages) {
                        currentPage = total_pages;
                    }
                } else {
                    reject("Invalid parameter passed");
                }
            }

            let start = (currentPage - 1) * itemsPerPage;

            if (sql) { // If any SQL Query provided;
                sql = `${sql}  ORDER BY ${tableName}.id DESC LIMIT  ${start},${itemsPerPage}`;
            } else {
                sql = `select * from ${tableName} ORDER BY id DESC LIMIT  ${start},${itemsPerPage}`
            }
                       
            db.query(sql, (err, data) => {
                if (!err) {
                    resolve({
                        data,
                        meta: {
                            items_onpage: itemsPerPage,
                            total_items: total[0].total,
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
};

exports.generatePDF = ( fileName, data, reportName, res ) => {
    try {
        let template = path.join(__dirname, '..', `views/Reports/${fileName}`);
        let output = path.join(__dirname, '..', `reports/pdf/${reportName}.pdf`);

		//-- render dynamicaly an ejs file 
        ejs.renderFile(template, { ...data, reportName }, (err, result) => {
            if (err) throw err;
			let options = { "format": 'A4' };
            PDF //create pdf usign html-pdf
                .create(result, options)
                .toFile(output, function (error, data) {
                    if (err) throw error;
                    res.download(output);
                });
		});
	} catch (error) {
		console.log(error);
        return res.json({
            message: error.message,
            stack: error.stack
        });
	}
};

exports.barCreate = (options) => {
    
    //Destructure options
    let { appName, create, meta, reports = [] } = options;

    /**Next page number **/
    let nextPage = meta.current_page + 1;
    if (nextPage > meta.total_pages) nextPage = meta.total_pages;
    
    /** Previous page number **/
    let prevPage = meta.current_page - 1;
    if (prevPage < 0 || prevPage == 0) prevPage = 1;
    

    let reportList = reports.map(report => {
        let item = `
            <li>
                <a  
                    class="dropdown-item"
                    data-bs-toggle="modal"
                    role="button"
                    data-bs-target="#${report.modal}">
                    ${report.name}
                </a>
            </li>
        `;
        return item;
    });


    return `
        <div class="col-12 mb-3">
                <div class="d-flex flex-wrap align-items-center justify-content-between bg-white rounded shadow-default p-3">
            
                    <h5 class='text-secondary text-raleway' style='margin-bottom:2px'>
                        <a href='/'><i class='fa fa-home'></i></a> /
                        <a href="/${appName.toLowerCase()}">${appName}</a> /
                        ${create == true ? `<a href="${appName.toLowerCase()}/create">Create</a>` : ''}
                    </h5>
            
            
                    <div class="pagination" role="list">
                        <li class="page-item dropdown">
                            <a to="#" class="page-link dropdown-toggle" id="dropdownFilters" data-bs-toggle="dropdown">
                                <i class='fa fa-filter'></i> Filter
                            </a>

                            <ul class="dropdown-menu p-4 shadow-default border-0 rounded w-auto" aria-labelledby="dropdownFilters">
                                <li><a href="#" class="dropdown-item">All</a></li>
                                <li><a href="#" class="dropdown-item">Archived</a></li>
                                <li><a href="#" class="dropdown-item">Not activated</a></li>
                                <li><a class='dropdown-item'><i class='fa fa-plus-circle'></i> Custom filter</a></li> 
                            </ul>
                        </li>

                        <li class="page-item">
                            <a to="?view=grid" class="page-link">
                                <i class='fa fa-bars'></i> Group
                            </a>
                        </li>
                        
                        <li class="page-item dropdown">
                            <a class="page-link dropdown-toggle" id="rprts" data-bs-toggle="dropdown" role="button">
                                <i class='fa fa-file-pdf'></i> Reports
                            </a>
                            <ul class="dropdown-menu p-3 shadow-default border-0 rounded w-auto" aria-labelledby="rprts">
                                ${reportList.toString().replace(","," ")}
                            </ul>
                        </li>
                    </div>
            
                    <div class='pagination' role="list">
                        <li class="page-item">
                            <a href="#" class='page-link input'>
                                <input type="number" value='${meta.current_page}' />
                            </a>
                        </li>
            
                        <li class="page-item">
                            <a href="#" class='page-link'>${meta.total_pages}</a>
                        </li>
            
                        <li class="page-item">
                            <a href="?page=${prevPage}" class='page-link'>
                                <i class="fa fa-chevron-circle-left"></i>
                            </a>
                        </li>
            
                        <li class="page-item">
                            <a href="?page=${nextPage}" class='page-link'>
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
exports.hashPassword = hashPassword;
exports.datesInterval = datesInterval;
exports.toIsoDateString = toIsoDateString;
