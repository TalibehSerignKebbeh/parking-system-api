 const vehicleTypes = ['compact', 'regular', 'large']
 const allowedRoles = ['admin', 'user']
const allowedStatus = ['active', 'block']


const bookingStatus = {
    proccessing: 'proccessing',
    accepted: 'accepted', cancell: 'cancell',
    rejected:'rejected'
}
 
module.exports = {
    allowedRoles, allowedStatus, vehicleTypes,
bookingStatus}