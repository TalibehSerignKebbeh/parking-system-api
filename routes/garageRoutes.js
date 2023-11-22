const express = require('express');
const { AddGarage, GetGarages,
    GetOneGarage,DeleteOneGarage, EditGarage, GetGarageForManager, GetRecentlyAddedGarages,
} = require('../controllers/garageController');

const VerifyJwtToken = require("../middleware/verifyJwtToken")

const router = express.Router()


router.route('/').get(GetGarages)
router.route('/recent').get(GetRecentlyAddedGarages)
router.route("/:id")
    .get(GetOneGarage)
router.use(VerifyJwtToken)
router.route("/:id/manager")
    .get(GetGarageForManager)
router.route('/')
     .post(AddGarage)
router.route("/:id")
    .delete(DeleteOneGarage)
    .put(EditGarage)
    



module.exports = router;