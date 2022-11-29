const express = require('express');
const controller = require('../controllers/employee.controllers');

const { adminRoute, userRoute, employeeRoute } = require('../middlewares/roles.middleware');
const { requireAuth, forwardAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

//All get requets
router.get('/', [ requireAuth, userRoute, adminRoute ], controller.index);
router.get('/create', [ requireAuth, adminRoute ], controller.create);
router.get('/view/:id', [ requireAuth ], controller.view);
router.get('/update/:id', [ requireAuth, adminRoute ], controller.update);


module.exports = router;