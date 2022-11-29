const express = require("express");

const controller = require("../controllers/api.controllers");

const employee = require("../controllers/employee.controllers");
const attendance = require("../controllers/attendance.controllers");
const department = require("../controllers/department.controllers");

const { requireAuth, forwardAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// Login route
router.route("/login")
    .post(controller.postLogin);

    
//Reset route
router.route("/reset")
    .post((req, res) => {
        res.json({ ...req.body });      
    })


//Employee route
router.route("/employees")
    .get(requireAuth,employee.apiGet)
    .post(requireAuth,employee.apiPost, employee.apiPut)
    .post(requireAuth,employee.apiPut)
    .delete((req, res) => {
        res.json({ ...req.body });      
    })

//Department route
router.route("/departments")
    .get(requireAuth,department.apiGet)
    .post(requireAuth,department.apiPost)
    .put((req, res) => {
        res.json({ ...req.body });      
    })
    .delete((req, res) => {
        res.json({ ...req.body });      
    })


//attendance route
router.route("/attendances")
    .get(requireAuth,attendance.apiGet)
    .post(requireAuth,attendance.apiPost)
    .put((req, res) => {
        res.json({ ...req.body });      
    })
    .delete((req, res) => {
        res.json({ ...req.body });      
    })


module.exports = router;
