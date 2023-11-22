 module.exports = (sequelize, DataTypes) => {

     const Notifications = sequelize.define("Notifications", {
        // any data to store for reference
         data: {
             type: DataTypes.JSON,
             defaultValue: {}
         },
        // name of model for which action was perform on
         model: {
             type: DataTypes.STRING,
         },
           read: {
               type: DataTypes.BOOLEAN,
             defaultValue:false  
         },
         message: {
              type: DataTypes.STRING,
             allowNull: true,
         }
     },
         { timestamps: true }
     )
     
     //  defining associations
     Notifications.associate = (models) => {
         
        //  Notifications.belongsToMany(models.Users, {
        //      as: 'Reads',
        //      foreignKey:"NotifiedUserUserId"
        //  })

         
         //  target user association, by NotifiedUserUserId
         //  as NotifiedUser in the notification model
         //  for user who should receive the notification
         
         Notifications.belongsTo(models.Users, {
             as: 'NotifiedUser',
             foreignKey:"NotifiedUserUserId"
         })

         
         //  target garage association, by ActionUserId
         //  as ActionUser in the notification model
         //  for Booking where notification is shown
          Notifications.belongsTo(models.Users, {
             as: 'ActionUser',
             foreignKey:"ActionUserId"
          })
         

          //  target garage association, by NotifiedGarageId
         //  as NotifiedGarage in the notification model
         //  for Garage where notification is shown
          Notifications.belongsTo(models.Garages, {
             as: 'NotifiedGarage',
             foreignKey:"NotifiedGarageId"
          })
         

         //  target garage association, by NotifiedBookingId
         //  as NotifiedBooking in the notification model
         //  for Booking where notification is shown
          Notifications.belongsTo(models.Bookings, {
             as: 'NotifiedBooking',
             foreignKey:"NotifiedBookingId"
          })
         

         //  target parking space association, by NotifiedSlot
         //  as NotifiedBooking in the notification model
         //  for Booking where notification is shown
          Notifications.belongsTo(models.ParkingSlots, {
             as: 'NotifiedSlot',
             foreignKey:"NotifiedSlotId"
          })
     }
     
     return Notifications
 }