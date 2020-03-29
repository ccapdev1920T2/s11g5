const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RoundRoomSchema = new Schema({
    motion: {type: String, required: true},
    roomno: {type: String, required: true, max: 32},
});


// Export the model
module.exports = mongoose.model('RoundRoom', RoundRoomSchema);
