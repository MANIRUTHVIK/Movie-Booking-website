const tokenVerificationLogger = (req, res, next) => {
  // Check for token in Authorization header first
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  // If no token in header, check cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      error: "Authorization token missing. Please login again.",
    });
  }

  req.token = token;
  next();
};

module.exports = tokenVerificationLogger;
