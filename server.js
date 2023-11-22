require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./models/index.js')
const { Server } = require('socket.io')
const { DataTypes, Sequelize, Model } = require('sequelize')
const VerifyJwtToken = require('./middleware/verifyJwtToken.js')

const GaragesModel = db.sequelize.models.Garages;
const BookingsModel = db.sequelize.models.Bookings;
const SlotsModel = db.sequelize.models.ParkingSlots;
const UsersModel = db.sequelize.models.Users;

const app = express()
const PORT = process.env.PORT || 4300

const expressServer = app.listen(PORT, () => {
    console.log(`web api server running on port ${PORT}`);
})

// class MyTalbe extends Model{ }
// MyTalbe.init({
//     columnA: {
//     type: Sequelize.BOOLEAN,
//     validate: {
//       is: ['[a-z]','i'],        // will only allow letters
//       max: 23,                  // only allow values <= 23
//       isIn: {
//         args: [['en', 'zh']],
//         msg: "Must be English or Chinese"
//       }
//     },
//     field: 'column_a'
//     // Other attributes here
//   },
//   columnB: Sequelize.STRING,
//   columnC: 'MY VERY OWN COLUMN TYPE'
// },)

// MyTalbe.findAndCountAll({
//     include: [{
//         where: {}, foreignKey: "", include: [{
//     where:{}, required:false
//         }]
//     }]
// })

// MyTalbe.aggregate()

app.use(cors({ origin: "*" }))
app.use(express.json({ limit: "300mb" }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
// app.use(bodyParser({extended:true, limit:"100mb"}))
// inject routes to express app

app.use("/api/v1/users", require('./routes/userRoutes.js'))
app.use("/api/v1/garages", require('./routes/garageRoutes.js'))
app.use("/api/v1/bookings", require('./routes/bookingRoutes.js'))
app.use("/api/v1/slots", require('./routes/slotsRoutes.js'))
app.use("/api/v1/auth", require('./routes/authRoutes.js'))

app.get('/api/v1/dash-recent',VerifyJwtToken,  async (req, res) => {
    const recentUsers = await UsersModel.
        findAll({
            limit: 5,
        order: [['createdAt', "DESC"]]

        })

    const blockUsers = await UsersModel.
        findAll({
            where: { status: 'block' },
        order: [['createdAt', "DESC"]]

        })
    const recentGarages = await GaragesModel.findAll({
        limit: 5,
        order: [['createdAt', "DESC"]]
    })

    const garageCount = await GaragesModel.count()

    const usersCount = await UsersModel.count()
    const activeUsersCount = await UsersModel.count({
        where: {
        status:'active'
        }
    })

    const blockUserCount = await UsersModel.count({
        where: {
        status:'block'
        }
    })
    

    return res.json({
        recentUsers,
        recentGarages,
        blockUsers,
        usersCount,
        activeUsersCount,
        blockUserCount,
        garageCount
    })
})



// setting up socket.io server

const io = new Server(expressServer, {
    cors: ['http://127.0.0.1:5173', 'http://localhost:3000'],

})


io.on(`connection`, socket => {
    console.log(`${socket.id?.slice(0, 5)} connected`);

    socket.on('joinGarage', (number, calback) => {
        // console.log("join garage");
        // console.log(number);
        socket.join(`garage${number}`)
        calback({
            ok: 'ok', status: "success",
            message: "connected to garage group"
        })
    })

    socket.on('new_booking', async ({ bookingId, garageId, slotId, username }) => {
        console.log(`new booking `);
        // const user = await UsersModel.findOne({ where: { username: username } })
        // const user = await UsersModel.findOne({ where: { username: username } })

        const booking = await BookingsModel.findByPk(bookingId, {
            include: [
                { model: UsersModel, as: "BookedByUser" },
                { model: UsersModel, as: "AcceptedByUser" },
                { model: GaragesModel, as: "garage" },
                { model: SlotsModel, as: "slot" },

            ]
        })

        // socket.broadcast.emit(`book_on_garage_${garageId}`)
        // socket.broadcast.emit(`book_on_space_${slotId}`)

        console.log('new booking');
        // socket.emit(`booking_added`, (booking))
        socket.broadcast.emit(`booking_added`, (booking))
        // io.emit(`booking_added`, (booking))
        // socket.broadcast.emit()
    })

    socket.on(`booking_event`, async ({ bookingId, }) => {
        console.log('booking event');
        const booking = await BookingsModel.findByPk(bookingId, {
            include: [
                { model: UsersModel, as: "BookedByUser" },
                { model: UsersModel, as: "AcceptedByUser" },
                { model: GaragesModel, as: "garage" },
                { model: SlotsModel, as: "slot" },

            ]
        })
        // socket.join()
        io.emit(`booking_event_${bookingId}`, (booking))
        socket.emit(``)
    })


})

io.on(`disconnection`, socket => {
    console.log(`disconneted ${socket?.id?.slice(0, 7)}`);

})
// db.sequelize.sync({  }).then(() => {
expressServer
// })

