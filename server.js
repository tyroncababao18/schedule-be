require("dotenv").config();
const app = require("./app");
const { startCron } = require("./jobs/cron");
const { enforceScheduleWeeks } = require("./jobs/enforceScheduleWeeks");

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`API running on http://localhost:${PORT}`);
  await enforceScheduleWeeks();
  startCron();
});