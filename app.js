const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const expreSession = require('express-session');
const cookieSession = require("cookie-session");

const cors = require('cors');
const expressLayouts = require("express-ejs-layouts");

const { logger } = require('./middlewares/Logger');
const { forwardAuth, requireAuth } = require('./middlewares/auth.middleware');


const app = express();

app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Check if is not production;
if (process.env.NODE_ENV !== 'production') {
  env.config();
  //Use express session;
  app.use(
  expreSession({
    secret: process.env.SESSION_SECRET='secret',
    resave: true,
    saveUninitialized: true,
    //cookie:{ maxAge: 6000 }
  })
);
}

// app.use(expressLayouts)
// app.set('layout', './Layouts/main');
app.set('view engine', 'ejs');
app.set('views', 'views');

app.set('trust proxy', 1);



app.use(bodyParser.urlencoded({ extended: false, limit: 1000000000 }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());


const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');
const employeeRoutes = require('./routes/employee');
const attendanceRoutes = require('./routes/attendance');
const departmentRoutes = require('./routes/department');
const userRoutes = require('./routes/user');
const { sysMeta } = require('./controllers/web.controllers');


app.use('/api', apiRoutes);
app.use('/', webRoutes);

app.use('/employees', requireAuth , sysMeta, employeeRoutes);
app.use('/attendances', requireAuth, sysMeta, attendanceRoutes);
app.use('/departments', requireAuth, sysMeta, departmentRoutes);
app.use('/users', requireAuth, sysMeta, userRoutes );


const PORT = process.env.PORT || 5000;


app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  res.render("error", {
    code: 404,
    content: `Sorry, We could not find the page you're trying to  reach !\t\t Make sure you didn't enter the URL manauly !`
  });
});

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
