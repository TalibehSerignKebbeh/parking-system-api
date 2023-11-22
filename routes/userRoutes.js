const express = require('express');
const { GetUsers, Register, GetMyProfile, AddUser,
    GetSingleUser, MakeUserAdminToGarage, SearchUsers,
    UserRoleStatusEdit,ChangeProfile, GetRecentlyAddedUsers, GetBlockAccounts
} = require('../controllers/userController');
const VerifyJwtToken = require('../middleware/verifyJwtToken');


const router = express.Router()


router.route('/').post(Register)
router.use(VerifyJwtToken)
router.route('/')
    .get(GetUsers)
    .post(Register)
    .put(AddUser)

router.route('/search').get(SearchUsers)
router.route("/profile")
    .get(GetMyProfile)
    .put(ChangeProfile)
router.route('/recent')
    .get(GetRecentlyAddedUsers)

router.route('/block')
    .get(GetBlockAccounts)
     
router.route("/:id")
    .get(GetSingleUser)
    .patch(MakeUserAdminToGarage)
    .put(UserRoleStatusEdit)



// router.route('/adminroutes') 
//         .post(AddUser)
 


module.exports = router;