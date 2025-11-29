const dotenv = require("dotenv") ;
dotenv.config() ;
const express = require("express")
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors") ;
const bcrypt = require('bcrypt')
const app = express() ;
const jwt = require('jsonwebtoken')
app.use(cookieParser());


 app.use(cors({
  origin: 'http://localhost:5173' , //'https://todo-frontend-react-production.vercel.app'
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
})); 
 

app.use(express.json()) ;

const todoSchema = require("./db");
const auth = require("./auth");

// body parse
// connection 


    try {
     mongoose.connect(process.env.URI) ;
    console.log("db connected successfully") ;

} catch (error) {
    console.log(error) ;
    console.log("db not connected")
}


const Todos = mongoose.model("todos" , todoSchema ) ;


app.post('/register' , async(req,res) =>{ 
    const { userName , password } = req.body ;
    
        if(!userName || !password) {
            return res.status(401).json({
                msg : "all fields are required" 
            });
        
        }
        const userExist = await Todos.findOne({userName}) ;

        if(userExist) { 
             return res.status(401).json({
                msg : "User already exist with this username" 
            });
        }

        const hashPassword = await bcrypt.hash (password , 10 ) ;

        const user = await Todos.create({ userName , password : hashPassword }) ;
        
        const data = {
            _id : user._id
        } ;


        const token = jwt.sign(data, process.env.JWT_SECRET , {expiresIn : process.env.JWT_EXPIRE}) ;

        

        res.cookie("token", token, {
    // httpOnly: true,     // prevents JS access → secure
    // secure: true,       // only on https (enable in production)
    // sameSite: "strict", // prevents CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});
     
        res.status(200).json({
            success : true , 
            responseData : {
                message : "registered successfully " ,
                    user , token
            } ,
    
            })
 })






app.post('/login' , async(req,res) =>{ 
    const { userName , password } = req.body ;
    
        if(!userName || !password) {
            return res.status(401).json({
                msg : "all fields are required" 
            });
        
        }
        const userExist = await Todos.findOne({userName}) ;
        if(!userExist) { 
             return res.status(401).json({
                msg : "invalid user Name or password" 
            });
        }
        const validPassword = await bcrypt.compare(password , userExist.password) ;
        if(!validPassword) {
            return res.status(401).json({
                msg : "invalid userName or password" 
            });
        }
        const data = {
            _id : userExist._id
        } ;
        const token = jwt.sign(data, process.env.JWT_SECRET , {expiresIn : process.env.JWT_EXPIRE}) ;

        res.cookie("token", token, {
    // httpOnly: true,     // prevents JS access → secure
    // secure: true,       // only on https (enable in production)
    // sameSite: "strict", // prevents CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000 // 7 days
});
     
        res.status(200).json({
            success : true , 
            responseData : {
                message : "logged in " ,
                    userExist , token
            } ,
    
            })
 })

app.post("/addTodo" , auth ,  async(req, res) => {
    const body = req.body ; 
    if( 
        !body ||
        !body.name ||
        !body.password 
    ) {
        return res.status(400).json({ msg: "all fields are required"}) ;
    }
    const user = await Todos.findOne({_id : req._id}) ;

    

    if(!user) {
        return res.status(400).json({msg : "something went password not saved"})
    }
    
    const unique = user.files.some( file => file.name === body.name); 
    if(unique) {
        return res.status(400).json({msg : "Password already exist with this name"})
    }

    try {
        user.files.push(req.body) ;
    await user.save() ;

    // console.log("Password Saved Successfully") ;
res.json({msg:"Password Saved Successfully"}) ;
    } catch (error) {
        res.json({error , msg:"something went password not saved" })
        // console.log("something went password not saved") ;
    }

}) ;

app.get("/" , async(req,res) => {
    
    const allTodos = await Todos.findOne({name : req._id}) ;
    if(!allTodos) {
        return res.status(400).json({msg:"somethingn went wrong"})
    }
    else {
        res.json({todos : allTodos.files})
    }
    
})

// app.post("/deleteTodo" , async(req,res) => {
//     const _id = req.body._id ;
//     try {
//         await Todos.updateOne({_id : _id} , {todoStatus : true})
//         return res.json({msg : "update successful"}) ;
//     }
//     catch(err) {
//         return res.status(400).json({msg : "something went wrong"}) ;
//     }
    
// } )

// app.get("/deleteAll" , async(req,res) => {
//     try {
//         await Todos.deleteMany({}) ; 
//     console.log("all todos deleted successfully") ;
//     return res.json({msg : "all todos deleted successfully"}) ;
//     }
//     catch(err) {
//         return res.status(400).json({msg : "something went wrong"}) ;
//     }} )



app.listen(8000);
module.exports = app ;


