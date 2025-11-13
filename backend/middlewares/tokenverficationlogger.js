const tokenVerificationLogger = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    req.token = token;
  } else {
    res
      .status(401)
      .json({
        error: "Authorization header missing or malformed or token missing",
      });
    return;
  }
  next();
};

module.exports = tokenVerificationLogger;
