const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/knex.js");

async function getUserContext(user_id) {
  const row = await db("user_assignments as ua")
    .join("roles as r", "r.id", "ua.role_id")
    .select("ua.store_id", "r.code as role_code")
    .where("ua.user_id", user_id)
    .whereNull("ua.end_date")
    .orderBy("ua.start_date", "desc")
    .first();

  return row || null;
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await db("users").where({ email }).first();
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash || "");
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const ctx = await getUserContext(user.id);
    if (!ctx) return res.status(403).json({ message: "No active assignment for this user" });

    const token = jwt.sign(
      { sub: user.id, email: user.email, store_id: ctx.store_id, role_code: ctx.role_code },
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
        store_id: ctx.store_id,
        role_code: ctx.role_code,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const user = await db("users as u")
      .select("u.id", "u.first_name", "u.last_name", "u.email", "u.status")
      .where("u.id", userId)
      .first();

    if (!user) return res.status(404).json({ message: "User not found" });

    const assignment = await db("user_assignments as ua")
      .join("roles as r", "r.id", "ua.role_id")
      .select("ua.store_id", "ua.department_id", "ua.role_id", "r.code as role_code")
      .where("ua.user_id", userId)
      .whereNull("ua.end_date")
      .orderBy("ua.start_date", "desc")
      .first();

    res.json({
      user: {
        ...user,
        store_id: assignment?.store_id || null,
        department_id: assignment?.department_id || null,
        role_id: assignment?.role_id || null,
        role_code: assignment?.role_code || null,
      },
    });
  } catch (err) {
    next(err);
  }
};