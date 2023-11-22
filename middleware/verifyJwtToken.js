const jwt = require('jsonwebtoken')


const VerifyJwtToken = async (req, res, next) => {

    const authHeader = req?.headers?.authorization || req?.headers?.Authorization;

    if (!authHeader?.startsWith("Bearer")) {
        return res.status(401).json({ message: `You are not authorized` })
    }
    const token = authHeader?.split(' ')[1];
    // jwt.TokenExpiredError()
    if (!token) {
        return res.status(401).json({ message: `Unauthorized no auth payload` })
    }

    jwt.verify(token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden", jwtError:err })
            // if (Object.values(BlockedStatus)?.includes(decoded?.AuthData?.status)) {
            //     return res.status(403).json({ message: "Forbidden user" })
            // }
            req.role = decoded?.AuthData?.role;
            req.user = decoded?.AuthData?.username;
            req.permissions = decoded?.AuthData?.permissions;
            req.garage = decoded?.AuthData?.garage;
            next()
            
        })
}


module.exports = VerifyJwtToken