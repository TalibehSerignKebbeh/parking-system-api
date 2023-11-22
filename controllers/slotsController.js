const db = require('../models/index.js')
const { Op } = require('sequelize');
const SlotsModel = db.sequelize.models.ParkingSlots;
const UsersModel = db.sequelize.models.Users;
const GarageModel = db.sequelize.models.Garages;

// @private endpoint
// only access by admins
const AddSlot = async (req, res) => {

    // const UserId = req.params.user || req.query.user;

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

    const CreatedBy = theUser.id;

    const {
        hourlyRate, dimension, description, type, garageId, number
    } = req.body

    const errors = await getSlotsErrors({ hourlyRate, dimension, description, type, garageId, number })
    if (Object.values(errors).length) return res.status(400).json({ errors, status: "error" })

    try {
        await SlotsModel.create({
            hourlyRate, description,
            dimension, type, CreatedBy: CreatedBy,
            UserId: CreatedBy,
            GarageId: garageId,
            number
        })

        return res.json({ message: 'parking slot added' })
    } catch (error) {
        let errors = {}
        console.log(error);
        Object.entries(error).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;

            }
        })

        if (Object.values(errors).length) return res.status(400).json({ errors, status: 'error' })
        return res.status(500).json({ message: "internal server error occured", status: 'error' })
    }
}

const UpdateSpaceSlot = async (req, res) => {
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

    const CreatedBy = theUser.id;

    const slotId = req.query.id || req.params.id;

    if (isNaN(slotId) || !Number(slotId) > 0) {
        return res.status(400).json({ message: "invalid data " })
    }

    const selectedSlot = await SlotsModel.findByPk(slotId)

    if (!selectedSlot) {
        return res.status(400).json({ message: "space not found " })
    }


    const {
        hourlyRate, dimension, description, type, garageId, number, status
    } = req.body
    let errors = {}
    errors = await getUpdateSlotsErrors({
        id: slotId, hourlyRate, dimension,
        description, type, garageId, number, status
    })
    if (Object.values(errors).length) return res.status(400).json({ errors, status: "error" })

    try {
        const updated = await SlotsModel.update(
            {
                hourlyRate, dimension, description, type, garageId, number, status
            }, { where: { id: slotId } })
        return res.json({ message: "space update" })
    } catch (error) {
        errors = {}
        // console.log(error);
        Object.entries(error).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;

            }
        })

        if (Object.values(errors).length) return res.status(400).json({ errors, status: 'error' })
        return res.status(500).json({ message: "internal server error occured", status: 'error' })
    }

}

const GetSlot = async (req, res) => {
    // const slots = await SlotsModel.findAll()
    // await Promise.all(slots.map(async (slot) => {
    //     await SlotsModel.update(
    //         { CreatedBy: slot.UserId },{where:{CreatedBy: null}})
    //     return null
    // }))

    const id = req.query.id || req.params.id;
    if (!id || isNaN(id))
        return res.status(400).json({ message: "invalid slot id" })

    // console.log(db.sequelize.models.Users)
    const slot = await SlotsModel.findByPk(id,
        {
            include: [
                { model: db.sequelize.models.Users, as: "AddedBy" },
                { model: db.sequelize.models.Users, as: "UpdatedBy" },
                { model: db.sequelize.models.Garages, as: "" }
            ],
        })
    if (slot) return res.json({ slot })
    return res.status(400).json({ message: "slot not found" })
}

const GetSlots = async (req, res) => {

    const page = req.query.page || req.params.page || 0;
    const pageSize = req.query.pageSize || req.params.pageSize || 10

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
        const slots = await SlotsModel.findAll()
        if (!slots?.length) return res.status(400).json({ message: 'data not found' })
        return res.json({ slots: slots })
    } catch (error) {
        return res.status(500).json({ message: "internal server error occured", status: 'error' })

    }

}


const GetGarageSlots = async (req, res) => {
    const garageId = req.params.garage || req.query.garage


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
        const slots = await
            db.sequelize.models.
                ParkingSlots.findAll({

                    where: { GarageId: garageId }
                },
                    {
                        include: [
                            { model: db.sequelize.models.Users, as: "AddedBy" },
                            { model: db.sequelize.models.Users, as: "UpdatedBy" },
                            {
                                model: db.sequelize.models.Bookings,
                                as: "bookings",
                                foreignKey: "ParkingSlotId",
                                required: false,
                                // order: [["id", "DESC"]],
                                where: {
                                    [Op.or]: [
                                        {
                                            startTime: {
                                                [Op.gt]: new Date(),
                                            },
                                        },
                                        {
                                            endTime: {
                                                [Op.gt]: new Date(),
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    })
        if (!slots?.length) return res.status(400).json({ message: 'data not found' })

        return res.json({ slots: slots })
    } catch (error) {
        return res.status(500).json({ message: "internal server error occured", status: 'error' })

    }

}



const getSlotsErrors = async (slotObject) => {
    let errors = {}
    const { hourlyRate, dimension, description, type, garageId, number } = slotObject;
    if (!garageId) {
        errors.garageId = "garage is required"
    }
    else if (isNaN(garageId) || !Number(garageId) > 0) {
        errors.garageId = "invalid garage id"
    } else {
        const garage = await db.sequelize.models.Garages.findByPk(garageId)
        if (!garage) errors.garageId = "garage not found"
    }
    if (!number) {
        errors.number = "slot number is required"
    }
    else if (isNaN(number) || !Number(number) > 0) {
        errors.number = "invalid slot number"
    } else {
        const existingNumber = await SlotsModel.findOne({
            where: {
                number: number, garageId: garageId
            }
        })
        if (existingNumber) errors.number = "slot space number already exist for garage"
    }

    if (!hourlyRate) {
        errors.hourlyRate = "hourlyRate is required"
    }
    else if (isNaN(hourlyRate) || !Number(hourlyRate) > 0) {
        errors.hourlyRate = "invalid slot rate"
    }
    if (!dimension || !dimension.length) {
        errors.dimension = "dimension is required"
    }
    if (!description || !description.length) {
        errors.description = "description is required"
    }
    if (!type || !type.length) {
        errors.type = "type is required"
    }

    return errors;
}


const getUpdateSlotsErrors = async (slotObject) => {
    let errors = {}
    const { id, hourlyRate, dimension, description, type, garageId, number, status } = slotObject;

    if (!status) {
        errors.status = 'status is required'
    } else if (!['occupied', 'available']?.includes(status)) {
        errors.status = 'invalid status'
    }
    if (!garageId) {
        errors.garageId = "garage is required"
    }
    else if (isNaN(garageId) || !Number(garageId) > 0) {
        errors.garageId = "invalid garage id"
    } else {
        const garage = await db.sequelize.models.Garages.findByPk(garageId)
        if (!garage) errors.garageId = "garage not found"
    }

    // validate the space number
    if (!number) {
        errors.number = "slot number is required"
    }
    else if (isNaN(number) || !Number(number) > 0) {
        errors.number = "invalid slot number"
    } else {
        const existingNumber = await SlotsModel.findOne({
            where: {
                number: number, garageId: garageId,
                id: {
                    [Op.not]: id
                }
            }
        })

        if (existingNumber) errors.number = "slot space number already exist for garage"
    }

    if (!hourlyRate) {
        errors.hourlyRate = "hourlyRate is required"
    }
    else if (isNaN(hourlyRate) || !Number(hourlyRate) > 0) {
        errors.hourlyRate = "invalid slot rate"
    }
    if (!dimension || !dimension.length) {
        errors.dimension = "dimension is required"
    }
    if (!description || !description.length) {
        errors.description = "description is required"
    }
    if (!type || !type.length) {
        errors.type = "type is required"
    }

    return errors;
}

module.exports = {
    AddSlot,
    GetSlots, GetGarageSlots,
    GetSlot, UpdateSpaceSlot
}