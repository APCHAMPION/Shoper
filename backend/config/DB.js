const mongoose = require("mongoose");

const DBConnection = async ()=>{
    try{
        const data = await mongoose.connect(process.env.MONGODB_URI);
        if(data){
            console.log(data.connection.host);
        }
        
    }
    catch(error){
        console.log(error.message);
        process.exit();
    }

}

module.exports = DBConnection;