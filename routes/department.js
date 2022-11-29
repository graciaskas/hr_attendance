const express = require('express');
const controller = require('../controllers/department.controllers');

const { adminRoute } = require('../middlewares/roles.middleware');
const { requireAuth, forwardAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

//All get requets
router.get('/', [ requireAuth ], controller.index);
router.get('/create', [ requireAuth, adminRoute ], controller.create);
router.get('/view/:id', [ requireAuth, adminRoute ], controller.view);
router.get('/update/:id', [ requireAuth, adminRoute ], controller.update);


module.exports = router;