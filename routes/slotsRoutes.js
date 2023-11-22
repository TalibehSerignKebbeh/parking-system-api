const express = require('express')

const { AddSlot,
    GetGarageSlots,
    GetSlots,GetSlot,UpdateSpaceSlot } = require('../controllers/slotsController')
const VerifyJwtToken = require('../middleware/verifyJwtToken')


const router = express.Router()

router.use(VerifyJwtToken)
router.route('/')
    .get(GetSlots)
    .post(AddSlot)
router.route('/:id')
    .get(GetSlot)
    .put(UpdateSpaceSlot)

router.route("/garage/:garage")
    .get(GetGarageSlots)




module.exports = router;