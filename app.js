const express = require("express");
const setupMiddleware = require("./middleware");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.get("/", (req, res) => {
    res.json({ ok: true, service: "schedule-be", version: "1.0.0" });
});

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

setupMiddleware(app);


// API ROUTES
app.use("/api", routes);


// ERROR HANDLER
app.use(notFound);
app.use(errorHandler);

module.exports = app;