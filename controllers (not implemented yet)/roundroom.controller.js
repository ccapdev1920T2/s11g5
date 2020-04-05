const RoundRoom = require('../models/roundroom.model');

exports.roundRoom_create = function (motion, roomNo) {
    let RoundRoom = new RoundRoom(
        {
            motion:motion,
            roomNo:roomNo
        }
    );

    RoundRoom.save(function (err) {
        if (err) {
            return next(err);
        }
        console.log('round room added successfully')
    })
};

exports.roundRoom_details = function(){
  RoundRoom.findOne({}, function(err, roundRoom){
    if (err) return next(err);
    return roundRoom;
  });
}
