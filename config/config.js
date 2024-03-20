var mongoose = require('mongoose');
const url = "mongodb+srv://prafullbind:prafull123@bind.jltdd5u.mongodb.net/notify?retryWrites=true&w=majority"

const mongoConfig = async() => {
    try{
    const connection = await mongoose.connect(url);
    // return connection.connection.db;
    if(connection){
        console.log("DB connected")
    }
    else{
        console.log("DB not connected");
    }
}
catch(ex){
    console.log(ex);
}
};

module.exports = mongoConfig;