# Notification Model specification

1. [] has a nullable target USER reference as "NotiAssociatedUser"
2. [] has a reference to the user who perform the action as "ActionUser"
3. [] has a nullable target BOOKING reference as "AssociatedBooking"
4. [] has a nullable target GARAGE reference as "AssociatedGarage"
5. [] has a nullable target parking slot reference
6. [] has a string name for the model it is associated with, one (User,Garage, Booking, Space)
7. [] has a message to illustrate the action perform
