module.exports = (sequelize, DataTypes) => {

    const Users = sequelize.define("Users", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "name must be supplied" },
                notEmpty: { msg: "name must not be an empty string" }
                // sendValidateMessage:
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "username must be supplied" },
                notEmpty: { msg: "username must not be an empty string" },
                len: [5, 10],
            }

        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: { msg: "invalid email address" },
                notNull: { msg: "email must be supplied" },
                notEmpty: { msg: "email must not be an empty string" }
                // sendValidateMessage:
            }
        },
        isEmailVerify: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        telephone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "telephone must be supplied" },
                notEmpty: { msg: "telephone must not be an empty string" }
                // sendValidateMessage:
            }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "password must be supplied" },
                notEmpty: { msg: "password must not be an empty string" }
            }
        },
        birthday: {
            type: DataTypes.DATEONLY,
            allowNull: false,

        },
        permissions: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
         status: {
            type: DataTypes.STRING,
            defaultValue: "active",
            validate: {
                isIn: {
                    args: [['block', 'active']],
                    msg: 'invalid user status, either block or active',
                },
            }
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: "user",
            validate: {
                isIn: {
                    args: [['admin', 'user', 'manager']],
                    msg: 'Invalid role. Please choose from accepted values',
                },
            }
        }
    },
        {
            indexes: [
                // Define a composite index on column1 and column2
                {
                    name: 'username_email',
                    fields: ['username', 'email'],
                    unique: true, // You can specify unique or not, depending on your needs
                },
            ],

            timestamps: true
        }
    )

    Users.associate = (models) => {
        // to set the user who is the admin of the garage in the user model

        Users.belongsTo(models.Garages, {
            foreignKey: "GarageId",
            as:'garageAdmins',
        })
        Users.belongsTo(models.Garages, {
            foreignKey: "RegisterGarageId",
            as:'registeredUsers',
        })
        Users.hasMany(models.Bookings, {
            required: false
        })

        Users.hasOne(models.ParkingSlots, {
            as: "AddedBy",
            foreignKey: "CreatedBy"
        })
        Users.hasOne(models.ParkingSlots, {
            as: "UpdatedBy",
            foreignKey: "UserId"
        })

        Users.belongsTo(models.Garages, {
            foreignKey: "RegisterGarageId",
            as: "RegisteredGarage"
        })
        Users.hasOne(models.Garages, {
            foreignKey: "UserId",
            as: "UpdatedByUser",
        })
        Users.hasOne(models.Garages, {
            foreignKey: "CreatedBy",
            as: "AddedByUser"
        })

        Users.hasOne(models.Bookings, {
            as: "BookedByUser",
            foreignKey: "UserId"

        })
        Users.hasOne(models.Bookings, {
            as: "AcceptedByUser",
            foreignKey: 'AcceptedById', // Set the foreign key name for the Users association
            required: false
        })



         //  target user association, by NotifiedUserUserId
         //  as NotifiedUser in the notification model
         //  for user who should receive the notification
         
         Users.hasMany(models.Notifications, {
             as: 'UserNofications',
             foreignKey:"NotifiedUserUserId"
         })

         
         //  target garage association, by ActionUserId
         //  as ActionUser in the notification model
         //  for Booking where notification is shown
          Users.hasMany(models.Notifications, {
             as: 'PerformActions',
             foreignKey:"ActionUserId"
          })
    }
    return Users
}