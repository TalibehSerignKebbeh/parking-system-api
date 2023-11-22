module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('Addresses', {
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: false,
      },
  
  
    });

    Address.associate = (models) => {
        Address.belongsTo(models.Garages)
    }
    
    return Address
}