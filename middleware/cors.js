const cors = require("cors");

const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const corsOptions =
    allowedOrigins.length === 0
        ? {}
        : {
            origin(origin, cb) {
                if (!origin) return cb(null, true); 
                if (allowedOrigins.includes(origin)) return cb(null, true);
                return cb(new Error("Not allowed by CORS"));
            },
            credentials: true,
        };

module.exports = cors(corsOptions);