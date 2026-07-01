const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // Header se token lo
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided",
      });
    }

    // Token verify karo
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // User id request mein save karo
    req.user = decoded;

    next();

  } catch (error) {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = auth;