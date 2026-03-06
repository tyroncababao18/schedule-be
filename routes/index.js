const router = require("express").Router();

router.get("/health", (req, res) => res.json({ ok: true }));

router.use("/auth", require("./auth.routes"));
router.use("/shifts", require("./shifts.routes"));


module.exports = router;