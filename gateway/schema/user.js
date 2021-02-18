const {getDBConnectionString} = require('./common');


const mongoose = getDBConnectionString()

var user = new mongoose.Schema({
  username: String,
  password: String,
  token: String,
  expires_in: Date,
});

