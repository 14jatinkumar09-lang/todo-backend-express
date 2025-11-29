const jwt = require("jsonwebtoken");


const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;   // 🔥 get token from cookie

        if (!token) {
            return res.status(401).json({ msg: "Unauthorized / Please Login again " });
        }

        // Verify token
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)
        if(!decoded) return ;
        req._id = decoded._id ;
 
        

        next(); // 🟢 continue to the next route
    } catch (error) {
        console.error(error);
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
};

module.exports = auth;