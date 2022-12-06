const express = require("express");
const controller = require("../controllers/web.controllers");

const { adminRoute } = require("../middlewares/roles.middleware");
const { requireAuth, forwardAuth } = require("../middlewares/auth.middleware");

const router = express.Router();
// router.get('/', controller.getLanding);

router.get("/", forwardAuth, controller.getIndex);

router.get("/login", forwardAuth, controller.getLogin);

router.get("/unauthorized", controller.getError);

// 1.3 Dashboard
router.get("/dashboard", requireAuth, controller.sysMeta, controller.getDashboard);

// 1.4 Logout
router.get("/logout", controller.getLogout);

// Reset password
router.get("/reset", controller.getResetPassword);



module.exports = router;
