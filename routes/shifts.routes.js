const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const shiftsController = require("../controllers/shifts.controller");

router.use(requireAuth);

router.get("/", shiftsController.list);

router.post("/", shiftsController.create);

router.patch("/:shiftId", shiftsController.update);

router.delete("/:shiftId", shiftsController.remove);

router.post("/:shiftId/assignments", shiftsController.addAssignment);

router.delete("/:shiftId/assignments/:assignmentId", shiftsController.removeAssignment);

module.exports = router;