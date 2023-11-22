const db = require('../models/index.js')
const bcrypt = require('bcrypt')
const { Op } = require('sequelize')

const UsersModel = db.sequelize.models.Users
const GaragesModel = db.sequelize.models.Garages
// const bcrypt = require("bcrypt")

const { allowedRoles, allowedStatus } = require('../data.js')

const { validateEmail, validatePassword } = require('../helpers methods/validations.js')




// post method
// @private endpoint
// user create accounts
// with the ability to make him manager to a garage
const AddUser = async (req, res) => {

    const user = req.user
    if (!user || !user?.length) {
        return res.status(400).json({ message: "unauthorized user" })
    }
    const theUser = await UsersModel.findOne({
        where: {
            username: user
        }
    });
    if (!theUser) return res.status(400).json({ message: "unauthorized user" })


    const { name, username, email, telephone,
        password, confirmPassword, birthday, permissions,
        role, GarageId }
        = req.body;

    let errors = {}
    const confirmPasswordError = !confirmPassword ? "confirmPassword is required" : (confirmPassword !== password) ? 'confirmPassword must equals password' : ''
    if (confirmPasswordError?.length) errors.confirmPassword = confirmPasswordError;

    const passwordError = !password ? "password is required"
        : password?.length < 5 ? "password length should be greater 5 characters"
            : password?.length > 15 ? "password length should be less than 15 characters"
                : ''
    if (passwordError?.length) errors.password = passwordError;

    const errorsMessages = Object.values(errors)
    if (errorsMessages.length) {
        return res.status(400).json({ errors })
    }

    let salt = bcrypt.genSaltSync(6);

    let hashPassword = bcrypt.hashSync(password, salt);

    try {
        const newUser = await UsersModel.create({
            name, email, username, role,
            telephone, birthday, password: hashPassword,
            permissions, GarageId: Number(GarageId) || 0
        })
        return res.json({ message: 'user registerd' })

    } catch (errorsData) {
        Object.entries(errorsData).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;
            }
        })
        if (Object.values(errors).length) return res.status(400).json({ errors, status: 'error' })

        return res.status(500).json({ message: "internal server error occured", status: 'error' })

    }
}  //end of register endpoint 



// post method
// @public endpoint
// user create accounts
const Register = async (req, res) => {

    const { name, username, email, telephone,
        password, confirmPassword, birthday, role }
        = req.body;

    let errors = {}
    const confirmPasswordError = !confirmPassword ? "confirmPassword is required" : (confirmPassword !== password) ? 'confirmPassword must equals password' : ''
    if (confirmPasswordError?.length) errors.confirmPassword = confirmPasswordError;

    const passwordError = !password ? "password is required"
        : password?.length < 5 ? "password length should be greater 5 characters"
            : password?.length > 15 ? "password length should be less than 15 characters"
                : ''
    if (passwordError?.length) errors.password = passwordError;

    const errorsMessages = Object.values(errors)
    if (errorsMessages.length) {
        return res.status(400).json({ errors })
    }


    let salt = bcrypt.genSaltSync(6);

    let hashPassword = bcrypt.hashSync(password, salt);
    try {
        const newUser = await UsersModel.create({
            name, email, username,
            telephone, birthday, password: hashPassword,
            role: role?.length ? role : 'user'
        })
        // console.log(newUser);
        return res.json({ message: 'user registerd' })

    } catch (errorsData) {
        Object.entries(errorsData).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                console.log(valueObject[1][0]);
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                console.log(typeof valueObject[1][0].value);
                errors[errorPath] = errMsg;

            }
        })
        if (Object.values(errors).length) return res.status(400).json({ errors, status: 'error' })
        return res.status(500).json({ message: "internal server error occured", status: 'error' })

    }
    console.log(`what do we have success or errors state \n`, newUser);
}  //end of register endpoint



// @private get endpoint
// for admins
const GetUsers = async (req, res) => {
    //     const user = req.user
    //      if (!user || !user?.length) {
    //        return res.status(400).json({ message: "unauthorized user" }) 
    //     }
    //  const theUser = await db.sequelize
    //         .models.Users.findOne({
    //             where: {
    //             username : user
    //         }}); 
    //     if(!theUser) return res.status(400).json({ message: "unauthorized user" })

    try {
        const page = req.query.page || req.params.page || 0
        const pageSize = req.query.pageSize || req.params.pageSize || 10
        const usersCount = await UsersModel.count();

        const users = await UsersModel.
            findAll({
                limit: +pageSize,
                offset: (+page * +pageSize),

            })

        return res.json({
            users: users,
            total: usersCount, page: +page,
            pageSize: +pageSize
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server error occured",
            error,
            status: 'error'
        })

    }

}


// @private get endpoint
// for admins
const GetRecentlyAddedUsers = async (req, res) => {
    const user = req.user
    if (!user || !user?.length) {
        return res.status(400).json({ message: "unauthorized user" })
    }
    const theUser = await db.sequelize
        .models.Users.findOne({
            where: {
                username: user
            }
        });
    if (!theUser) return res.status(400).json({ message: "unauthorized user" })

    try {

        const users = await UsersModel.
            findAll({
                limit: 5,
            })

        return res.json({
            users: users
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server error occured",
            error,
            status: 'error'
        })

    }

}

// @private get endpoint
// for admins
const GetBlockAccounts = async (req, res) => {
    const user = req.user
    if (!user || !user?.length) {
        return res.status(400).json({ message: "unauthorized user" })
    }
    const theUser = await db.sequelize
        .models.Users.findOne({
            where: {
                username: user
            }
        });
    if (!theUser) return res.status(400).json({ message: "unauthorized user" })

    try {

        const users = await UsersModel.
            findAll({
                where: {
                   status:"block" 
                }
            })

        return res.json({
            users: users
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server error occured",
            error,
            status: 'error'
        })

    }

}




// @private endpoint
// get method
const GetMyProfile = async (req, res) => {
    console.log("get your profile endpoint");
    const user = req.user
    if (!user || !user?.length) {
        return res.status(400).json({ message: "unauthorized user" })
    }
    const theUser = await UsersModel.findOne({
        where: {
            username: user
        }

    });
    if (!theUser) return res.status(400).json({ message: "account missing" })


    return res.json({ profile: theUser })
}


// post method
// @private endpoint

const ChangeProfile = async (req, res) => {

    const user = req.user
    if (!user || !user?.length) {
        return res.status(400).json({ message: "unauthorized user" })
    }
    const theUser = await UsersModel.findOne({
        where: {
            username: user
        }
    },
    );
    if (!theUser) return res.status(400).json({ message: "unauthorized user" })



    const { name, username, email, telephone,
        password, confirmPassword, birthday
    }
        = req.body;
    console.log(`password = ${password}, confirmPassword = ${confirmPassword}`);

    let errors = {}
    const confirmPasswordError = (password && !confirmPassword) ?
        "confirmPassword is required" : (confirmPassword !== password)
            ? 'confirmPassword must equals password' : ''
    if (confirmPasswordError?.length) errors.confirmPassword = confirmPasswordError;

    const passwordError = (password && !validatePassword(password)) ?
        "password is invalid" : ""

    if (passwordError?.length) errors.password = passwordError;


    const emailError = !email ? 'email is required'
        : !validateEmail(email) ? 'invalid email' : ''
    if (emailError) errors.email = emailError;

    // returning any validation errors for now
    const errorsMessages = Object.values(errors)
    if (errorsMessages.length) {
        return res.status(400).json({ errors })
    }
    // checking for dupicated email
    const existingUser = await UsersModel.findOne({ where: { email: email } })

    if (existingUser && (existingUser.id !== theUser.id)) {
        if (emailError) errors.email = "email already exist";
        const errorsMessages = Object.values(errors)
        if (errorsMessages.length) {
            return res.status(400).json({ errors })
        }
    }



    let hashPassword = theUser.password;
    if (validatePassword(password)) {
        let salt = bcrypt.genSaltSync(6);
        hashPassword = bcrypt.hashSync(password, salt)
    }
    try {
        await UsersModel.update({
            name, email, username,
            telephone, birthday, password: hashPassword,
        },
            { where: { id: theUser.id } })
        // console.log(newUser);
        return res.json({ message: 'profile updated' })

    } catch (errorsData) {
        Object.entries(errorsData).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;
            }
        })
        if (Object.values(errors).length) return res.status(400).json({ errors, status: 'error' })
        return res.status(500).json({ message: "internal server error occured", status: 'error' })

    }
    console.log(`what do we have success or errors state \n`, newUser);
}
//end of change profle endpoint 


// @private endpoint
// get method
const GetSingleUser = async (req, res) => {
    const id = req.query.id || req.params.id

    const theUser = await UsersModel.findByPk(id,
        {
            include: [
                { model: GaragesModel, as: "RegisterGarage" },
                { model: GaragesModel, as: "GarageAdmin" }
            ]
        });
    if (!theUser) return res.status(400).json({ message: "unauthorized user" })

    if (!user) return res.status(400).json({ message: "data not found" })
    return res.json({ user: theUser })
}

// @private endpoint
// get method
const MakeUserAdminToGarage = async (req, res) => {
    const userId = req.query.id || req.params.id
    const user = req.user
    if (!user || !user?.length) {
        return res.status(400).json({ message: "unauthorized user" })
    }
    const theUser = await UsersModel.findOne({
        where: {
            username: user
        }
    });
    if (!theUser) return res.status(400).json({ message: "unauthorized user" })

    if (!Number(userId) && Number(userId) > 0) {
        return res.status(400).json({ message: 'invalid data' })
    }

    const selectedUser = await UsersModel.findByPk(userId);
    if (!selectedUser) {
        return res.status(400).json({ message: 'user not found' })
    }

    const { GarageId } = req.body;

    let errors = {}
    if (!Number(userId) && Number(userId) > 0) errors['GarageId'] = 'garage is not properly supplied'
    if (Object.values(errors)?.length) {
        return res.status(400).json({ errors: errors })
    }
    const selectedGarage = await GaragesModel.findByPk(GarageId);
    if (!selectedGarage) {
        return res.status(400).json({ message: 'garage not found' })
    }

    try {
        const updated = await UsersModel.update(
            { GarageId: GarageId },
            { where: { id: userId } }
        )
        console.log(updated);
        return res.json({ message: "admin added successfully" })
    } catch (error) {
        console.log(error);
        Object.entries(error).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;
            }
        })
        if (Object.values(errors).length) return res.status(400).json({ errors, status: 'error' })

        return res.status(500).json({ message: "some internal server error occured", status: 'error' })

    }

}


// @private endpoint
// get method
const UserRoleStatusEdit = async (req, res) => {
    const userId = req.query.id || req.params.id
    const user = req.user
    if (!user || !user?.length) {
        return res.status(400).json({ message: "unauthorized user" })
    }
    const theUser = await UsersModel.findOne({
        where: {
            username: user
        }
    });
    if (!theUser) return res.status(400).json({ message: "unauthorized user" })

    if (!Number(userId) && Number(userId) > 0) {
        return res.status(400).json({ message: 'invalid data params' })
    }



    const { role, status } = req.body;

    let errors = {}

    if (!role) {
        errors.role = 'role is required'
    } else if (!allowedRoles?.includes(role)) errors.role = 'invalid role'

    if (!status) {
        errors.status = 'status is required'
    } else if (!allowedStatus?.includes(status)) errors.status = 'invalid status'


    if (Object.values(errors)?.length) {
        return res.status(400).json({ errors: errors })
    }
    const selectedUser = await UsersModel.findByPk(userId);
    if (!selectedUser) {
        return res.status(400).json({ message: 'user not found' })
    }

    try {
        const updated = await UsersModel.update(
            { status, role },
            { where: { id: userId } }
        )
        console.log(updated);
        return res.json({ message: "user update successfully" })
    } catch (error) {

        Object.entries(error).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;
            }
        })
        if (Object.values(errors).length) return res.status(400).json({ errors, status: 'error' })

        return res.status(500).json({ message: "some internal server error occured", status: 'error' })

    }

}

const SearchUsers = async (req, res) => {
    try {
        const searchKey = req.query.searchKey;

        // Check if searchKey is provided
        if (!searchKey) {
            return res.status(400).json({ error: 'Search key is required.' });
        }

        // Perform a search query using Sequelize
        const users = await UsersModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchKey}%` } },
                    { username: { [Op.like]: `%${searchKey}%` } },
                    { email: { [Op.like]: `%${searchKey}%` } },
                    { telephone: { [Op.like]: `%${searchKey}%` } },
                ],
            },
        });

        return res.json({ users });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    Register, AddUser,
    GetUsers, GetMyProfile, ChangeProfile,
    GetSingleUser,
    MakeUserAdminToGarage,
    SearchUsers, UserRoleStatusEdit,
    GetRecentlyAddedUsers,
    GetBlockAccounts
}