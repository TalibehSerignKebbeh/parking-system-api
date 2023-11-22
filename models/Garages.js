module.exports = (sequelize, DataTypes) => {
   

  const Garages = sequelize.define("Garages", {
       id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "garage name must be supplied" },
                notEmpty: { msg: "garage name must not be an empty string" },
                min:5,max:150
            }
    },
         description: {
            type: DataTypes.STRING,
            allowNull: false,
    },
          address: {
            type: DataTypes.STRING,
             allowNull: false,
           validate: {
                notNull:{msg:"address is required"},
                notEmpty:{msg:"address cannot be empty"},
            }
    },
        latitude: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    }, 
        
    },{timestamps:true})

    Garages.associate = (models) => {
        Garages.hasMany(models.Bookings, {
          as: "Bookings",
          foreignKey:'GarageId'
        })
      
      Garages.belongsTo(models.Users, {
        as: "AddedByUser",
        foreignKey:"CreatedBy"
      })

      Garages.belongsTo(models.Users, {
        as: "UpdatedByUser",
        foreignKey:"UserId"
      })

      // to set a foreignKey on users table
      // for users who register for this garage
      Garages.hasMany(models.Users, {
        foreignKey: "RegisterGarageId",
        as:"RegisterGarage"
      })
       Garages.hasMany(models.Users, {
        foreignKey: "GarageId",
        as:"GarageAdmin"
       })
      
      // garage admins
       Garages.hasMany(models.Users, {
        foreignKey: "GarageId",
        as:"garageAdmins"
      })
      
      Garages.hasOne(models.Addresses)

      Garages.hasMany(models.ParkingSlots, {
        as: 'slots',
        foreignKey:"GarageId"
      })
      
       //  target garage association, by NotifiedGarageId
         //  as NotifiedGarage in the notification model
         //  for Garage where notification is shown
          Garages.hasMany(models.Notifications, {
             as: 'garageNotifications',
             foreignKey:"NotifiedGarageId"
          })
  }
  

 
         
    return Garages
}



// 13.4466992,-16.6959496
// 13.4533372,-16.6982336,