const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const ctrl = require("../controllers/requests.controller");

router.use(requireAuth);

// GET /api/requests/summary?store_id=1
router.get("/summary", ctrl.summary);

module.exports = router;