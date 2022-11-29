const express = require('express');
const controller = require('../controllers/attendance.controllers');

const { adminRoute, employeeRoute } = require('../middlewares/roles.middleware');
const { requireAuth, forwardAuth } = require('../middlewares/auth.middleware');

const router = express.Router();


//All get requets
router.get('/', [ requireAuth ], controller.index);
router.get('/kiosque', [ requireAuth, employeeRoute ], controller.kiosque);
router.get('/create', [ requireAuth, adminRoute ], controller.create);
router.get('/view/:id', [ requireAuth, adminRoute ], controller.view);


module.exports = router;