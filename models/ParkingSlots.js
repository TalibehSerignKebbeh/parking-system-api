module.exports = (sequelize, DataTypes) => {
    const ParkingSlots = sequelize.define("ParkingSlots", {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
         number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        hourlyRate: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        dimension: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            // defaultValue: "user",
            allowNull: false,
            validate: {
                notNull: { msg: "parking slot type is required" },
                notEmpty: { msg: "parking slot type cannot be empty" },
                isIn: ['compact','regular',  'large']
            }
        },

        status: {
            type: DataTypes.ENUM,
            defaultValue: "available",
            values: ['occupied', 'available']
        },
        booked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, { timestamp: true })

    ParkingSlots.associate = (models) => {
        // ParkingSlots.hasMany(models.Bookings)
        ParkingSlots.belongsTo(models.Garages, {
      foreignKey: 'GarageId',
      as: 'garage',
    });
    ParkingSlots.hasMany(models.Bookings, {
      foreignKey: 'ParkingSlotId',
      as: 'bookings',
    });

        // ParkingSlots.hasMany(models.Bookings)
        ParkingSlots.belongsTo(models.Garages, {
            as: "slots",
          foreignKey:'GarageId'
        })
        ParkingSlots.belongsTo(models.Users, {
            as:"UpdatedBy",
            foreignKey:"UserId"
        })
        ParkingSlots.belongsTo(models.Users, {
            as:"AddedBy",
            foreignKey:"CreatedBy"
        })

        //  target parking space association, by NotifiedSlot
         //  as NotifiedBooking in the notification model
         //  for Booking where notification is shown
          ParkingSlots.hasMany(models.Notifications, {
             as: 'SlotNofications',
             foreignKey:"NotifiedSlotId"
          })

    }
    return ParkingSlots
}
// alter table parkingdb.parkingslots drop column BookingId