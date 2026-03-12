const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const ctrl = require("../controllers/swaps.controller");

router.use(requireAuth);

 // /api/swaps?store_id=1&status=pending
router.get("/", ctrl.list);

module.exports = router;