// middleware/cors.js
const cors = require("cors");

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        // Allow Postman, server-to-server requests, and curl
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error("Blocked by CORS:", origin);

        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
    ],

    credentials: true,
};

module.exports = cors(corsOptions);