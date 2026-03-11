const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const ctrl = require("../controllers/users.controller");

router.use(requireAuth);

router.get("/", ctrl.listByStore);

module.exports = router;