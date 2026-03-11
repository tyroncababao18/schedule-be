const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const ctrl = require("../controllers/scheduleWeeks.controller");

router.use(requireAuth);

router.get("/", ctrl.list);
router.post("/drop-next", ctrl.dropNext);
router.patch("/:id", ctrl.update);
router.post("/:id/publish", ctrl.publish);

module.exports = router;