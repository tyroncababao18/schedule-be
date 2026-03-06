const express = require("express");
const helmet = require("helmet");
const fileUpload = require("express-fileupload");

const corsMiddleware = require("./cors");

function setupMiddleware(app) {
    app.use(helmet());

    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true }));

    app.use(corsMiddleware);

    app.use(
        fileUpload({
            useTempFiles: true,
            tempFileDir: "/tmp",
            limits: { fileSize: 10 * 1024 * 1024 },
            abortOnLimit: true,
            safeFileNames: true,
            preserveExtension: true,
        })
    );
}

module.exports = setupMiddleware;