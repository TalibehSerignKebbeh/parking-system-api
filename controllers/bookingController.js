const db = require('../models/index.js')
const { Op } = require('sequelize')
const GaragesModel = db.sequelize.models.Garages;
const BookingsModel = db.sequelize.models.Bookings;
const SlotsModel = db.sequelize.models.ParkingSlots;
const UsersModel = db.sequelize.models.Users;
const { bookingStatus } = require('../data.js')



const BookSlotFor = async (req, res) => {
    const user = req.user;
    const {
        startTime, endTime, vehicleType,
        slotId, GarageId, targetUser
    } = req.body;

    const errors = {};
    const userBooking = await UsersModel.findOne({
        where: {
            username: user
        }
    })
    if (!userBooking) {
        return res.status(400).json({ message: 'unauthorized' })
    }

    const UserId = userBooking.id;

    if (!startTime || !startTime?.length) {
        errors['startTime'] = "start time is required"
    }

    if (!endTime || !endTime?.length) {
        errors['endTime'] = "end time is required"
    }

    if (!slotId) {
        errors['slot'] = "parking slot is required"
    } else if (!Number(slotId) > 0) {
        errors['slot'] = "invalid parking slot id"
    }

    if (!GarageId) {
        errors['garage'] = "garage is required"
    } else if (!Number(GarageId) > 0) {
        errors['garage'] = "invalid garage id"
    }

    if (!targetUser) {
        errors['user'] = "user id is required"
    } else if (!Number(targetUser) > 0) {
        errors['user'] = "invalid user id"
    }

    if (Object.values(errors)?.length) {
        return res.status(400).json({ errors: errors })
    }

    // const selectedSlot = await SlotsModel.findByPk(slotId);
    // if (!selectedSlot) {
    //     errors['slot'] = "parking slot not found"
    // }

    try {
        const newBooking = await BookingsModel.create({
            startTime, endTime, vehicleType,
            GarageId: GarageId,
            UserId, ParkingSlotId: slotId
        })
        return res.json({
            message: "booking registered",
            id: newBooking?.id
        })
    } catch (errorsData) {
        Object.entries(errorsData).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                // console.log(valueObject[1][0]);
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;
            }
        })
        if (Object.values(errors).length) return res.status(400).json({ errors, status: 'error' })
        return res.status(500).json({ message: "internal server error occured", status: 'error' })


    }
}

const BookParkingSlot = async (req, res) => {
    const user = req.user;
    const {
        startTime, endTime, vehicleType,
        slotId, GarageId
    } = req.body;

    const errors = {};
    const userBooking = await UsersModel.findOne({
        where: {
            username: user
        }
    })
    if (!userBooking) {
        return res.status(400).json({ message: 'unauthorized' })
    }

    const UserId = userBooking.id;

    if (!startTime || !startTime?.length) {
        errors['startTime'] = "start time is required"
    }

    if (!endTime || !endTime?.length) {
        errors['endTime'] = "end time is required"
    }

    if (!slotId) {
        errors['slot'] = "parking slot is required"
    } else if (!Number(slotId) > 0) {
        errors['slot'] = "invalid parking slot id"
    }

    if (!GarageId) {
        errors['garage'] = "garage is required"
    } else if (!Number(GarageId) > 0) {
        errors['garage'] = "invalid garage id"
    }

    if (Object.values(errors)?.length) {
        return res.status(400).json({ errors: errors })
    }

    // const selectedSlot = await SlotsModel.findByPk(slotId);
    // if (!selectedSlot) {
    //     errors['slot'] = "parking slot not found"
    // }

    try {
        const newBooking = await BookingsModel.create({
            startTime, endTime, vehicleType,
            GarageId: GarageId,
            UserId, ParkingSlotId: slotId
        })
        return res.json({
            message: "booking registered",
            id: newBooking?.id
        })
    } catch (errorsData) {
        Object.entries(errorsData).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                // console.log(valueObject[1][0]);
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;
            }
        })
        if (Object.values(errors).length) return res.status(400).json({ errors, status: 'error' })
        return res.status(500).json({ message: "internal server error occured", status: 'error' })


    }
}


const AcceptBooking = async (req, res) => {
    const user = req.user;
    const BookingId = req.query.id || req.params.id;

    const theUser = await UsersModel.findOne({
        where: {
            username: user
        }
    });
    if (!theUser) return res.status(400).json({ message: "unauthorized request" })


    const booking = await BookingsModel.findByPk(BookingId);

    if (!booking) return res.status(400).json({ message: "data not found" })

    const updatedBooking = await BookingsModel.update({ AcceptedById: theUser.id, status: 'accepted' },
        { where: { id: BookingId } })
    if (updatedBooking) return res.json({ message: "booking accepted" })

    res.status(400).json({ message: "unexpected error occurred" })
}


const CancellBooking = async (req, res) => {
    const user = req.user
    const BookingId = req.query.id || req.params.id;

    const theUser = await UsersModel.findOne({
        where: {
            username: user
        }
    });
    if (!theUser) return res.status(400).json({ message: "unauthorized request" })


    const booking = await BookingsModel.findByPk(BookingId);

    if (!booking) return res.status(400).json({ message: "data not found" })

    const updatedBooking = await BookingsModel.update({ status: 'cancell' },
        { where: { id: BookingId } })
    if (updatedBooking) return res.json({ message: "booking cancell" })

    res.status(400).json({ message: "unexpected error occurred" })
}

const RejectBooking = async (req, res) => {
    const user = req.user;
    const BookingId = req.query.id || req.params.id;

    const theUser = await UsersModel.findOne({
        where: {
            username: user
        }
    });
    if (!theUser) return res.status(400).json({ message: "unauthorized request" })


    const booking = await BookingsModel.findByPk(BookingId);

    if (!booking) return res.status(400).json({ message: "data not found" })

    const updatedBooking = await BookingsModel.update(
        { RejectedById: theUser.id, status: 'rejected' },
        { where: { id: BookingId } })
    if (updatedBooking) return res.json({ message: "booking rejected" })

    res.status(400).json({ message: "unexpected error occurred" })
}


const RegisterPayment = async (req, res) => {
    const user = req.user
    const BookingId = req.query.id || req.params.id;
    const theUser = await UsersModel.findOne({
        where: {
            username: user
        }
    });
    if (!theUser) return res.status(400).json({ message: "unauthorized request" })


    const booking = await BookingsModel.findByPk(BookingId);

    if (!booking) return res.status(400).json({ message: "data not found" })

    //     isPaid
    // paidDate
    const { isPaid, paidDate } = req.body

    const updatedBooking = await BookingsModel.update(
        { isPaid: isPaid, paidDate: paidDate },
        { where: { id: BookingId } })
    if (updatedBooking) return res.json({ message: "booking payment updated" })

    res.status(400).json({ message: "unexpected error occurred" })
}

const GetBookings = async (req, res) => {
    const page = req.query.page || req.params.page || 0;
    const pageSize = req.query.pageSize || req.params.pageSize || 10


    const bookings = await BookingsModel.findAll({
        limit: +pageSize,
        offset: (+page * +pageSize),
        include: [
            { model: UsersModel, as: "BookedByUser" },
            { model: UsersModel, as: "AcceptedByUser" },
            { model: GaragesModel, as: 'garage' },
            { model: SlotsModel, as: "slot" },

        ]
    })
    if (!bookings?.length) return res.status(400).json({ message: 'data not found' })

    return res.json({
        bookings: bookings,
        page, pageSize
    })

}

const GetBookingsForGarage = async (req, res) => {
    const id = req.query.id || req.params.id;

    const page = req.query.page || req.params.page || 0;
    const pageSize = req.query.pageSize || req.params.pageSize || 10


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

    if (!id || Number(id) <= 0) {
        return res.status(400).json({ message: "invalid data" })
    }
    const total = await BookingsModel.count({where:{GarageId:id}})
    const bookings = await BookingsModel.findAll(
        {
            limit: +pageSize,
            offset: (+page * +pageSize),
            where: { GarageId: id },
            order: [["id", "DESC"]],

            include: [
                { model: UsersModel, as: "BookedByUser" },
                { model: UsersModel, as: "AcceptedByUser" },
                { model: GaragesModel, as: "garage" },
                { model: SlotsModel, as: "slot" },

            ]
        })
    if (!bookings.length) return res.status(400).json({ message: "data not found" })

    return res.json({
        bookings, page: +page,
        pageSize: +pageSize,
        total: +total
    })

}

const GetBookingsForSlot = async (req, res) => {
    const id = req.query.id || req.params.id;

    const page = req.query.page || req.params.page || 0;
    const pageSize = req.query.pageSize || req.params.pageSize || 10

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

    if (!id || Number(id) <= 0) {
        return res.status(400).json({ message: "invalid data" })
    }

    const bookings = await BookingsModel.findAll(
        {
            limit: +pageSize,
            offset: (+page * +pageSize),
            where: { ParkingSlotId: id }
        }, {
        include: [
            { model: UsersModel, as: "BookedByUser" },
            { model: UsersModel, as: "AcceptedByUser" },
            { model: GaragesModel },
            { model: SlotsModel, as: "slot" },

        ]
    })
    if (!bookings.length) return res.status(400).json({ message: "data not found" })

    return res.json({ bookings, page, pageSize })

}

const GetUserBookings = async (req, res) => {
    //  const id = req.query.id || req.params.id;
    console.log("user bookings");

    const page = req.query.page || req.params.page || 0;
    const pageSize = req.query.pageSize || req.params.pageSize || 10

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
    const total = await BookingsModel.count({
    where: { UserId: theUser.id }})
    const bookings = await BookingsModel.findAll(
        {
            limit: +pageSize,
            offset: (+page * +pageSize),
            where: { UserId: theUser.id },
            order: [["id", "DESC"]],

            include: [
                { model: UsersModel, as: "BookedByUser" },
                { model: UsersModel, as: "AcceptedByUser" },
                { model: GaragesModel, as: "garage" },
                { model: SlotsModel, as: "slot" },

            ]
        })
    // if (!bookings.length) return res.status(400).json({ message: "data not found in database" })

    return res.json({
        bookings, page: +page,
        pageSize: +pageSize,
        total: +total
    })

}

const GetSingleBooking = async (req, res) => {
    const id = req.query.id || req.params.id;

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

    if (!id || Number(id) <= 0) {
        return res.status(400).json({ message: "invalid data" })
    }

    const booking = await BookingsModel.findByPk(id, {
        include: [
            { model: UsersModel, as: "BookedByUser" },
            { model: UsersModel, as: "AcceptedByUser" },
            { model: GaragesModel, as: "garage" },
            { model: SlotsModel, as: "slot" },

        ]
    })
    if (!booking) return res.status(400).json({ message: "data not found" })

    return res.json({ booking })

}

// @private for admins only and users who 
// admins to a garage.
// @params: date
// calculating booking stats for a given day 
const GetBookingsForDay = async (req, res) => {


    const GarageId = req.query.id || req.params.id
    const dayDate = req.query.date || req.params.date
    if (!dayDate) {
        return res.status(400).json({ message: "date not supplied" })
    }
    const startOfDay = new Date(dayDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(dayDate)
    endOfDay.setHours(23, 59, 59, 999)

    //    console.dir(BookingsModel?.aggregate);

    let bookings = []
    // check if garage is supplied and do the fetching for the garage 
    if (GarageId && Number(GarageId) > 0) {

        bookings = await BookingsModel.findAll({
            where: {
                [Op.and]: {
                    GarageId: {
                        [Op.eq]: GarageId,
                    },
                    [Op.or]: {
                        startTime: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        endTime: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                    }
                }

            },
            include: [
                { model: UsersModel, as: "BookedByUser" },
                { model: UsersModel, as: "AcceptedByUser" },
                { model: GaragesModel, as: "garage" },
                { model: SlotsModel, as: "slot" },

            ]
        })
    } else {
        // no garage supplied
        bookings = await BookingsModel.findAll({
            where: {

                [Op.or]: {
                    startTime: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                    endTime: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                }

            },
            include: [
                { model: UsersModel, as: "BookedByUser" },
                { model: UsersModel, as: "AcceptedByUser" },
                { model: GaragesModel, as: "garage" },
                { model: SlotsModel, as: "slot" },

            ]
        })
    }


    const totalMoneyForDay =
        bookings?.reduce(
            (total, booking) => {

                const bookingBeginTimeForDay = new Date(booking?.startTime).getTime() > startOfDay.getTime() ?
                    new Date(booking?.startTime).getTime() : startOfDay.getTime()

                const bookingEndTimeForDay = new Date(booking?.endTime).getTime() <= endOfDay.getTime() ?
                    new Date(booking?.endTime).getTime() : endOfDay.getTime()

                const bookingHours = bookingEndTimeForDay - bookingBeginTimeForDay;

                return total + (bookingHours * booking?.slot?.hourlyRate)

            }, 0
        )

    const receivedAmount =
        bookings?.reduce(
            (total, booking) => {
                if (booking?.status !== bookingStatus.accepted) return 0;
                const bookingBeginTimeForDay = new Date(booking?.startTime).getTime() > startOfDay.getTime() ?
                    new Date(booking?.startTime).getTime() : startOfDay.getTime()

                const bookingEndTimeForDay = new Date(booking?.endTime).getTime() <= endOfDay.getTime() ?
                    new Date(booking?.endTime).getTime() : endOfDay.getTime()

                const bookingHours = bookingEndTimeForDay - bookingBeginTimeForDay;

                return total + (bookingHours * booking?.slot?.hourlyRate)

            }, 0
        )

    return res.json({
        bookings, expectedAmount: totalMoneyForDay,
        receivedAmount: receivedAmount
    })

}


// @private for admins only and users who 
// @params: startDate & endDate
// admins to a garage
// calculate stats between dates,
// use for calculating statistics 
// for a week, month and year as well
const GetBookingsBetweenDates = async (req, res) => {
    const GarageId = req.query.id || req.params.id

    const { startDate, endDate } = req.query;

    const startOfTime = new Date(startDate)
    const endOfTime = new Date(endDate)


    let bookings = []
    // check if garage is supplied and do the fetching for the garage 
    if (GarageId && Number(GarageId) > 0) {

        bookings = await BookingsModel.findAll({
            where: {
                [Op.and]: {
                    GarageId: {
                        [Op.eq]: GarageId,
                    },
                    [Op.or]: {
                        startTime: {
                            [Op.between]: [startOfTime, endOfTime],
                        },
                        endTime: {
                            [Op.between]: [startOfTime, endOfTime],
                        },
                    }
                }

            },
            include: [
                { model: UsersModel, as: "BookedByUser" },
                { model: UsersModel, as: "AcceptedByUser" },
                { model: GaragesModel, as: "garage" },
                { model: SlotsModel, as: "slot" },

            ]
        })
    } else {
        // no garage supplied
        bookings = await BookingsModel.findAll({
            where: {

                [Op.or]: {
                    startTime: {
                        [Op.between]: [startOfTime, endOfTime],
                    },
                    endTime: {
                        [Op.between]: [startDate, endOfTime],
                    },
                }

            },
            include: [
                { model: UsersModel, as: "BookedByUser" },
                { model: UsersModel, as: "AcceptedByUser" },
                { model: GaragesModel, as: "garage" },
                { model: SlotsModel, as: "slot" },

            ]
        })
    }

    const totalMoneyForDay =
        bookings?.reduce(
            (total, booking) => {

                const bookingBeginTimeForDay = new Date(booking?.startTime).getTime() > startOfTime.getTime() ?
                    new Date(booking?.startTime).getTime() : startOfTime.getTime()

                const bookingEndTimeForDay = new Date(booking?.endTime).getTime() <= endOfTime.getTime() ?
                    new Date(booking?.endTime).getTime() : endOfTime.getTime()

                const bookingHours = bookingEndTimeForDay - bookingBeginTimeForDay;

                return total + (bookingHours * booking?.slot?.hourlyRate)

            }, 0
        )

    const receivedAmount =
        bookings?.reduce(
            (total, booking) => {
                if (booking?.status !== bookingStatus.accepted) return 0;
                const bookingBeginTimeForDay = new Date(booking?.startTime).getTime() > startOfTime.getTime() ?
                    new Date(booking?.startTime).getTime() : startOfTime.getTime()

                const bookingEndTimeForDay = new Date(booking?.endTime).getTime() <= endOfTime.getTime() ?
                    new Date(booking?.endTime).getTime() : endOfTime.getTime()

                const bookingHours = bookingEndTimeForDay - bookingBeginTimeForDay;

                return total + (bookingHours * booking?.slot?.hourlyRate)
            }, 0
        )

    return res.json({
        bookings, expectedAmount: totalMoneyForDay,
        receivedAmount: receivedAmount
    })


}


// @private for garage admins to get statistics 
const GetGarageBookingsStats = async (req, res) => {
    const GarageId = req.query.id || req.params.id
    const today = new Date()
    const startOfDay = today.setHours(0, 0, 0, 0)
    const endOfDay = today.setHours(23, 59, 59, 999)

    const bookingsCountToday = await
        BookingsModel.count({
            where: {
                [Op.and]: {
                    GarageId: GarageId,
                    [Op.or]: {
                        startTime: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        endTime: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                    }
                }
            }
        })

}



module.exports = {
    BookSlotFor, BookParkingSlot, CancellBooking,
    AcceptBooking,
    RejectBooking, RegisterPayment,
    GetBookings, GetSingleBooking,
    GetBookingsForGarage,
    GetBookingsForSlot,
    GetUserBookings, GetBookingsForDay,
    GetBookingsBetweenDates
}