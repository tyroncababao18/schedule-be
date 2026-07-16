const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      store_id: decoded.store_id,
      role_code: decoded.role_code,
      demo: decoded.demo === true,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};