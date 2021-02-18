module.exports = {
  getDBConnectionString: function() {
    var mongoose = require('mongoose');
    if (process.env.CURRENT_ENVIRONMENT === 'TEST') {
        mongoose.connect('mongodb://localhost/bntee-dev', {useNewUrlParser: true, useUnifiedTopology: true});  
    } else {
        mongoose.connect('mongodb://localhost/bntee', {useNewUrlParser: true, useUnifiedTopology: true});
    }
    var db = mongoose.connection;
    return mongoose;
  }
}