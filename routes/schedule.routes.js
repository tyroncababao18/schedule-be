const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const ctrl = require("../controllers/schedule.controller");

router.use(requireAuth);

router.get("/week", ctrl.getWeek);

module.exports = router;