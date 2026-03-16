const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const shiftsController = require("../controllers/shifts.controller");

router.use(requireAuth);

router.get("/", shiftsController.list);
router.get("/conflicts", shiftsController.conflicts);

router.post("/", shiftsController.create);
router.patch("/:shiftId", shiftsController.update);
router.delete("/:shiftId", shiftsController.remove);


module.exports = router;