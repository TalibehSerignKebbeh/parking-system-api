const db = require('../models/index')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const Login = async (req, res) => {
    const { username, password } = req.body
    // console.log(`values `, username, password);
    if (!username?.length || !password?.length) {
        return res.status(400).json({message:"both username and password are required"})
    }

    const user = await db.sequelize.models.Users.findOne({
        where: {
        username
        }
    })
    
    if(!user) return res.status(400).json({message:"invalid username or password"})
    
    const passwordMatch = await bcrypt.compareSync(password, user.password)

    if(!passwordMatch) return res.status(400).json({message:"invalid username or password"})
    
    const token = jwt.sign(
        {
        "AuthData": {
                email: user?.email,
                username: user?.username,
                role: user?.role,
                garage: user?.GarageId,
                registeredGarage: user?.RegisterGarageId,
                permissions:user?.permissions
        }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
    )


     const refreshToken = jwt.sign({
        "username": user.username
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d', }
    )

    res.cookie('jwt', refreshToken, {
        maxAge: 24 * 60 * 60 * 1000 * 7,
         httpOnly: true,
        secure: true,
        sameSite: 'none',
    })

    return res.json({
        message: "login success",
    token: token})
}


const Logout = async (req, res) => {

    const cookies = req.cookies
    
    if (!cookies?.jwt) return res.sendStatus(204) //No content

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

    res.json({ message: 'Cookie cleared' })
}



module.exports = {Login, Logout}