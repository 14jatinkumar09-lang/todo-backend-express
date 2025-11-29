const mongoose = require("mongoose") ;

const todoSchema = new mongoose.Schema({
    userName : {
        type : String , 
        unique : true ,
        required  : true
    } ,
    password : {
        type : String , 
        required  : true
    } , 
    files : [{
        name : String ,
        password : String ,
    }] ,
        
} , {timestamps : true   })


module.exports = todoSchema ;