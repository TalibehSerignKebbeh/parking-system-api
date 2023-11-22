module.exports = (sequelize, DataTypes) => {
  const Bookings = sequelize.define("Bookings",
    {
       id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
      isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false, defaultValue: false 
      },
      paidDate: {
        type: DataTypes.DATE,
        allowNull: true,
        // defaultValue: DataTypes.NOW
    },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
                notNull: { msg: "start time must be supplied" },
                notEmpty: { msg: "start time must not be an empty string" },
            }
        
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
                notNull: { msg: "end time must be supplied" },
                notEmpty: { msg: "end time must not be an empty string" },
            }
        
      },
      vehicleType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
                notNull: { msg: "vehicle type must be supplied" },
                notEmpty: { msg: "vehicle type must not be an empty string" },
                min:5,max:150
            }
    },
      status: {
            type: DataTypes.ENUM,
            allowNull: true,
            values: ['proccessing','accepted','cancell', 'rejected']
        },
      
  },
  
  
      {timestamps:true}
    )
  Bookings.associate = (models) => {
    Bookings.belongsTo(models.ParkingSlots, {
      as: "slot",
      foreignKey:"ParkingSlotId"
    })
    
 Bookings.belongsTo(models.ParkingSlots, {
      foreignKey: 'ParkingSlotId',
      as: 'bookings',
    });

    Bookings.belongsTo(models.Garages, {
      as: 'garage',
      foreignKey:'GarageId'
    });

    Bookings.belongsTo(models.Users, {
      as: "BookedByUser",
      foreignKey:"UserId"
    });
         
    Bookings.belongsTo(models.Users, {
        as:"AcceptedByUser",
         foreignKey: 'AcceptedById', // Set the foreign key name for the Users association
         required:false
    });

       Bookings.belongsTo(models.Users, {
        as:"RejectedBy",
         foreignKey: 'RejectedById', // Set the foreign key name for the Users association
         required:false
    });
         
    
    //  target booking association, by NotifiedBookingId
         //  as bookingNofications in the notification model
         //  for Booking where notification is shown
          Bookings.hasMany(models.Notifications, {
             as: 'bookingNofications',
             foreignKey:"NotifiedBookingId"
          })
         
  };
    return Bookings
}