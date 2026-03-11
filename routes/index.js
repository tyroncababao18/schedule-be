const router = require("express").Router();

router.get("/health", (req, res) => res.json({ ok: true }));

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./users.routes"));
router.use("/shifts", require("./shifts.routes"));
router.use("/departments", require("./departments.routes"))
router.use("/schedule", require("./schedule.routes"))
router.use("/user-assignments", require("./userAssignments.routes"));
router.use("/schedule-weeks", require("./scheduleWeeks.routes"));


module.exports = router;