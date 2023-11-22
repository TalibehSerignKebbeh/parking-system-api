const express = require('express');
const { BookSlotFor,
    AcceptBooking, CancellBooking,
    RejectBooking,GetSingleBooking,
    GetBookingsForGarage, GetBookingsForSlot,
    GetUserBookings, GetBookings, BookParkingSlot,
    RegisterPayment, GetBookingsForDay, GetBookingsBetweenDates, 
} =
    require('../controllers/bookingController');
const VerifyJwtToken = require('../middleware/verifyJwtToken');


const router = express.Router()

router.use(VerifyJwtToken)
router.route("/")
    .get(GetBookings)
    .post(BookParkingSlot)
    .put(BookSlotFor)
    
router.route("/user").get(GetUserBookings)

router.route("/:id")
    .get(GetSingleBooking)
    .put(AcceptBooking)
    .patch(RejectBooking)
    .post(CancellBooking)
    

router.route("/:id/payment").post(RegisterPayment)

      
router.route("/slot/:id").get(GetBookingsForSlot)
router.route("/garage/:id").get(GetBookingsForGarage)

router.route('/stats/day').get(GetBookingsForDay)
router.route('/stats/duration').get(GetBookingsBetweenDates)


module.exports = router;