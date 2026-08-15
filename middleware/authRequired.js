const jwt = require("jsonwebtoken");
require("dotenv/config");
function authRequired(req, res, next) {
  if (!req.headers.authorization)
    return res.status(401).json({ error: "No authorization token" });
  const token = req.headers.authorization.split(" ")[1];
  try {
    const verify = jwt.verify(token, process.env.MY_SECRET);

    req.userId = verify.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "request invalid" });
  }
}

module.exports = authRequired;
