const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/knex.js");

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await db("users").where({ email }).first();
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const ok = await bcrypt.compare(password, user.password_hash || "");
        if (!ok) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { sub: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            },
        });
    } catch (err) {
        console.log(err)
        next(err);
    }
};