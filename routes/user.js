const express = require('express');
const controller = require('../controllers/user.controllers');

const { adminRoute, commonRoute } = require('../middlewares/roles.middleware');
const { requireAuth, forwardAuth } = require('../middlewares/auth.middleware');

const router = express.Router();


//All get requets
router.get('/', [ requireAuth, adminRoute ], controller.index);
router.get('/create', [ requireAuth, adminRoute ], controller.create);
router.get('/view/:id', [ requireAuth, commonRoute ], controller.view);
router.get('/update/:id', [ requireAuth, adminRoute ], controller.update);

//All post requets
router.post('/', [ requireAuth, adminRoute ], controller.postCreate);




module.exports = router;