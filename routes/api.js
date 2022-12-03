const express = require("express");

const controller = require("../controllers/api.controllers");

const employee = require("../controllers/employee.controllers");
const attendance = require("../controllers/attendance.controllers");
const department = require("../controllers/department.controllers");
const user = require("../controllers/user.controllers");

const { requireAuth, forwardAuth } = require("../middlewares/auth.middleware");
const { adminRoute, userRoute } = require("../middlewares/roles.middleware");

const router = express.Router();

// Login route
router.route("/login").post(controller.postLogin);

    
//Reset route
router.route("/reset")
    .post((req, res) => {
        res.json({ ...req.body });      
    })


//Employee route
router.route("/employees")
    .get([ requireAuth, userRoute, employee.apiGet ])
    .post([ requireAuth, userRoute, employee.apiPost, employee.apiPut, employee.apiReport ])
    .delete((req, res) => {
        res.json({ ...req.body });      
    })

//Department route
router.route("/departments")
    .get(requireAuth, userRoute, department.apiGet)
    .post(requireAuth, userRoute, department.apiPost,  department.apiPut, department.apiReport)
    .delete((req, res) => {
        res.json({ ...req.body });      
    })


//attendance route
router.route("/attendances")
    .get([ requireAuth,attendance.apiGet ])
    .post([ requireAuth, userRoute, attendance.apiPost, attendance.apiPut, attendance.apiReport ])
    .delete((req, res) => {
        res.json({ ...req.body });      
    })

//
router.route("/users")
    .post([ requireAuth, adminRoute ], user.apiPost, user.apiPut)


module.exports = router;
