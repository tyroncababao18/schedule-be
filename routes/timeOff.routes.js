const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const ctrl = require("../controllers/timeOff.controller");

router.use(requireAuth);


 // /api/time-off
router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.patch("/:id", ctrl.update);

module.exports = router;