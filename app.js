const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const expressLayouts = require("express-ejs-layouts");

const { logger } = require('./middlewares/Logger');
const { forwardAuth, requireAuth  } =  require('./middlewares/auth.middleware');


env.config();
const app = express();

app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// app.use(expressLayouts)
// app.set('layout', './Layouts/main');
app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(
  session({
    secret: process.env.SESSION_SECRET='secret',
    resave: true,
    saveUninitialized: true,
    //cookie:{ maxAge: 6000 }
  })
);



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
