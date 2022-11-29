const path = require('path');
const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cors = require('cors');
const methodOverride = require('method-override');

const { logger } = require('./middlewares/Logger');
const { forwardAuth, requireAuth  } =  require('./middlewares/auth.middleware');

const sql = require('./database/mysql');

env.config();
const app = express();

app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(methodOverride('_method'));

// sql.connect();

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(
  session({
    secret: process.env.SESSION_SECRET='secret',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());


const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');
const employeeRoutes = require('./routes/employee');
const attendanceRoutes = require('./routes/attendance');
const departmentRoutes = require('./routes/department');
const userRoutes = require('./routes/user');


app.use('/api', apiRoutes);
app.use('/', webRoutes);

app.use('/employees', requireAuth , employeeRoutes);
app.use('/attendances', requireAuth, attendanceRoutes);
app.use('/departments', requireAuth, departmentRoutes);
app.use('/users', requireAuth, userRoutes );


const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  res.render("error", {
    code: 404,
    content: "Sorry, We could not find the page you're trying to  reach!<br>couldn't find what you're looking for"
  });
});

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
