const config = require("config");

function admin(req, res, next) {
  if (!config.get("requiresAuth")) return next();
  if (!req.user.isAdmin) return res.status(403).send("Access Denied.");
  next();
}

module.exports = admin;
