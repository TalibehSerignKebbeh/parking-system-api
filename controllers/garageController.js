const db = require('../models/index.js')
const { Op } = require('sequelize'); // Import the Sequelize operators
const GarageModel = db.sequelize.models.Garages
const SlotsModel = db.sequelize.models.ParkingSlots


const AddGarage = async (req, res) => {
    const { name, description, latitude, longitude, address } = req.body

    const user = req.user
     if (!user || !user?.length) {
       return res.status(400).json({ message: "unauthorized user" }) 
    }
 const theUser = await db.sequelize
        .models.Users.findOne({
            where: {
            username : user
        }}); 
    if(!theUser) return res.status(400).json({ message: "unauthorized user" })

    try {
        const newGarage = await db.sequelize
            .models.Garages.create(
                {
                    name, description, address, latitude, longitude,
                    CreatedBy: theUser.id,
                    UserId:theUser.id
                })
        return res.json({ message: "garage added", status: "success" })
        
    } catch (errorsData) {
        let errors ={}
         Object.entries(errorsData).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                // console.log(valueObject[1][0]);
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;

            }
         })
        if(Object.values(errors).length)  return res.status(400).json({errors, status:'error'})
      return res.status(500).json({message: "internal server error occured", status:'error'})

    }

}




const GetGarages = async (req, res) => {

    //     const user = req.user
    //      if (!user || !user?.length) {
    //        return res.status(400).json({ message: "unauthorized user" }) 
    //     }
    //      if (!user || !user?.length) {
    //        return res.status(400).json({ message: "unauthorized user" }) 
    //     }
    //  const theUser = await db.sequelize
    //         .models.Users.findOne({
    //             where: {
    //             username : user
    //         }}); 
    //     if(!theUser) return res.status(400).json({ message: "unauthorized user" })

    
  
    // const page = req.query.page || req.params.page || 0;
    // const pageSize = req.query.pageSize || req.params.pageSize || 10
    // Op.or
    
    const searchKey = req.query.searchKey || ''
    
  const garages = await db.sequelize.models.Garages.findAll({
    where: {
    [Op.or]: [
          { name: { [Op.like]: `%${searchKey}%` } },
          { address: { [Op.like]: `%${searchKey}%` } },
          { description: { [Op.like]: `%${searchKey}%` } },
        ],
  },
  include: [
    {
      model: db.sequelize.models.Users,
      as: "AddedByUser",
      foreignKey: "CreatedBy",
      required:false,
    },
    {
      model: db.sequelize.models.Users,
      as: "UpdatedByUser",
      foreignKey: "UserId",
      required:false,
    },
     {
      model: db.sequelize.models.Users,
      as: "garageAdmins",
       foreignKey: "GarageId",
      required:false,
    },
    {
      model: db.sequelize.models.ParkingSlots,
      as: "slots",
      foreignKey: "GarageId",
      required:false,
      include: [
        {
          model: db.sequelize.models.Bookings,
              as: "bookings",
              foreignKey: "ParkingSlotId",
          required: false,
          order: [["id", "DESC"]],
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
    },
  ],
});


  return res.json({
    garages: garages,
    // page: +page,
    // pageSize: +pageSize,
    status: "success"
  })

}

const GetOneGarage = async (req, res) => {

//     const user = req.user
//      if (!user || !user?.length) {
//        return res.status(400).json({ message: "unauthorized user" }) 
//     }
//  const theUser = await db.sequelize
//         .models.Users.findOne({
//             where: {
//             username : user
//         }}); 
//     if(!theUser) return res.status(400).json({ message: "unauthorized user" })

    
    const id = req.params.id || req.query.id;

    if (isNaN(id) || !Number(id) > 0) {
        return res.status(400).json({message:"invalid data "})
    }

    const garage = await db.sequelize.models.Garages.findByPk(id, {
        include: [
    {
      model: db.sequelize.models.Users,
      as: "AddedByUser",
      foreignKey: "CreatedBy",
        },
    {
      model: db.sequelize.models.Users,
      as: "garageAdmins",
       foreignKey: "GarageId",
      required:false,
    },
    {
      model: db.sequelize.models.Users,
      as: "UpdatedByUser",
      foreignKey: "UserId",
        },
    
    {
      model: db.sequelize.models.ParkingSlots,
      as: "slots",
      foreignKey: "GarageId",
      include: [
        {
          model: db.sequelize.models.Bookings,
              as: "bookings",
              foreignKey: "ParkingSlotId",
          required: false,
         
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
    },
  ],
    });
   if (!garage) {
      return res.status(400).json({message:"data not found", status:"error"})
  }
    return res.json({garage})
    
}


const GetGarageForManager = async (req, res) => {

    const user = req.user
     if (!user || !user?.length) {
       return res.status(400).json({ message: "unauthorized user" }) 
    }
 const theUser = await db.sequelize
        .models.Users.findOne({
            where: {
            username : user
        }}); 
    if(!theUser) return res.status(400).json({ message: "unauthorized user" })

    
    const id = req.params.id || req.query.id;

    if (isNaN(id) || !Number(id) > 0) {
        return res.status(400).json({message:"invalid data "})
    }

    const garage = await db.sequelize.models.Garages.findByPk(id, {
        include: [
    {
      model: db.sequelize.models.Users,
      as: "AddedByUser",
      foreignKey: "CreatedBy",
        },
     {
      model: db.sequelize.models.Users,
      as: "garageAdmins",
      foreignKey: "GarageId",
    },
    {
      model: db.sequelize.models.Users,
      as: "UpdatedByUser",
      foreignKey: "UserId",
        },
     {
      model: db.sequelize.models.Bookings,
      as: "Bookings",
       foreignKey: "GarageId",
       order: [["id", "DESC"]], // Sort Bookings by createdAt in descending order
      limit: 10, 
    },
    {
      model: db.sequelize.models.ParkingSlots,
      as: "slots",
      foreignKey: "GarageId",
      include: [
        {
          model: db.sequelize.models.Bookings,
              as: "bookings",
              foreignKey: "ParkingSlotId",
          required: false,
           include: [
            {
              model: db.sequelize.models.Users,
                as: "BookedByUser",
            foreignKey: "UserId"
            },
            { 
              model: db.sequelize.models.Users,
              as: "AcceptedByUser",
              foreignKey: 'AcceptedById',
             },
            //  {
            //    model: SlotsModel, as: "slot",
            //    foreignKey: "ParkingSlotId"
            //  }
          ],
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
    },
  ],
    });
   if (!garage) {
      return res.status(400).json({message:"data not found", status:"error"})
  }
    return res.json({garage})
    
}

const DeleteOneGarage = async (req, res) => {
    const user = req.user
    if (!user || !user?.length) {
       return res.status(400).json({ message: "unauthorized user" }) 
    }
 const theUser = await db.sequelize
        .models.Users.findOne({
            where: {
            username : user
            }
        }); 
    
    if(!theUser) return res.status(400).json({ message: "unauthorized user" })

    
}


const EditGarage = async (req, res) => {
    const { name, description, latitude, longitude, address } = req.body
  const garageId = req.query.id || req.params.id;
   if (isNaN(garageId) || !Number(garageId) > 0) {
        return res.status(400).json({message:"invalid data "})
    }
    const user = req.user
     if (!user || !user?.length) {
       return res.status(400).json({ message: "unauthorized user" }) 
    }
 const theUser = await db.sequelize
        .models.Users.findOne({
            where: {
            username : user
        }}); 
    if(!theUser) return res.status(400).json({ message: "unauthorized user" })
   console.log(theUser.id);
  const garage = await await GarageModel.findByPk(garageId);
  if (!garage) {
       return res.status(400).json({ message: "garage not found" }) 
  }
    try {
        const updatedGarage = await GarageModel.update(
                {
            name: name, description: description,
            address:address, latitude:latitude,
            longitude:longitude,
                    UserId:theUser.id
          }, {
            where: {
                    id: garageId
                  }
        })
      console.log(updatedGarage);
        return res.json({ message: "garage updated successfully", status: "success" })
        
    } catch (errorsData) {
        let errors ={}
         Object.entries(errorsData).map((valueObject) => {
            if (valueObject[0] === 'errors') {
                // console.log(valueObject[1][0]);
                const errorPath = valueObject[1][0]['path']
                const errMsg = valueObject[1][0]['message']
                errors[errorPath] = errMsg;

            }
         })
        if(Object.values(errors).length)  return res.status(400).json({errors, status:'error'})
      return res.status(500).json({message: "internal server error occured", status:'error'})

    }

}

const GetRecentlyAddedGarages = async (req, res) => {
  
  const garages = await GarageModel.findAll({
    limit: 10,
    order:[['createdAt', "DESC"], ["id", "DESC"]]
  })

  return res.json({garages:garages})
}

module.exports = {
    AddGarage,EditGarage,
    GetGarages,
    GetOneGarage,
  DeleteOneGarage,
  GetGarageForManager,
    GetRecentlyAddedGarages
}