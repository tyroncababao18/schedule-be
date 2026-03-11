const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const departmentsController = require("../controllers/departments.controller");

router.use(requireAuth);

router.get("/", departmentsController.list);

module.exports = router;