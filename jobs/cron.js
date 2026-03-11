const cron = require("node-cron");
const { enforceScheduleWeeks } = require("./enforceScheduleWeeks");

function startCron() {
  cron.schedule(
    "0 2 * * 6",
    async () => {
      try {
        await enforceScheduleWeeks();
      } catch (e) {
        console.error("[cron] enforceScheduleWeeks failed:", e);
      }
    },
    { timezone: "America/Chicago" }
  );

  console.log("[cron] scheduled enforceScheduleWeeks (Sat 2:00 AM CT)");
}

module.exports = { startCron };