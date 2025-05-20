const jwt = require("jsonwebtoken");
const JWT_SECRET = "project";

const fetchuser = (req, res, next) => {
  // Get the token from the request header
  const token = req.header("auth-token");
  
  // Check if token exists
  if (!token) {
    console.log("No authentication token provided");
    return res.status(401).json({ 
      success: false,
      error: "Please authenticate using a valid token" 
    });
  }

  try {
    // Verify the token
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    
    // Log the user data for debugging
    console.log("User authenticated:", req.user);
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return res.status(401).json({ 
      success: false,
      error: "Please authenticate using a valid token" 
    });
  }
};

module.exports = fetchuser;