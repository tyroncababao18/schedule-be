const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const ctrl = require("../controllers/userAssignments.controller");

router.use(requireAuth);
router.get("/", ctrl.list);
router.get("/departments", ctrl.allowedDepartments);
router.get("/users", ctrl.usersByDepartment);


module.exports = router;