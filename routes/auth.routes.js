const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const requireAuth = require("../middleware/requireAuth")

router.post("/login", authController.login);

router.get("/me", requireAuth, authController.me)

router.post("/demo", authController.demo);

module.exports = router;