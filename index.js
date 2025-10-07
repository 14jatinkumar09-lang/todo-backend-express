const express = require("express")
const mongoose = require("mongoose");
const app = express() ;
const cors = require("cors") ;
const dotenv = require("dotenv") ;
dotenv.config() ;

app.use(cors()) ;
app.use(express.json()) ;

const todoSchema = require("./db")
// body parse
// connection 

try {
    mongoose.connect(process.env.URI)
    console.log("db connected successfully") ;

} catch (error) {
    console.log(error) ;
    console.log("db not connected")
}

const Todos = mongoose.model("todos" , todoSchema ) ;

app.post("/addTodo" , async(req, res) => {
    const body = req.body ; 
    if( 
        !body ||
        !body.title ||
        !body.description 
    ) {
        return res.status(400).json({ msg: "all fields are required"}) ;
    }
    const todoChecking = await Todos.findOne({title : body.title}) ;
    if(todoChecking) {
        return res.status(400).json({msg : "todo already exists with this title"})
    }

    try {
        await Todos.create({
        title : body.title ,
        description : body.description ,
        todoStatus : false 
    })

    console.log("todo added successfully") ;

    } catch (error) {
        console.log("something went wrong todo not added")
    }

}) ;

app.get("/" , async(req,res) => {
    
    const allTodos = await Todos.find() ;
    if(!allTodos) {
        return res.status(400).json({msg:"somethingn went wrong"})
    }
    else {
        res.json({todos : allTodos})
    }
})

app.post("/deleteTodo" , async(req,res) => {
    const _id = req.body._id ;
    try {
        await Todos.updateOne({_id : _id} , {todoStatus : true})
        return res.json({msg : "todo status updated successfully"}) ;
    }
    catch(err) {
        return res.status(400).json({msg : "something went wrong"}) ;
    }
    
} )

app.get("/deleteAll" , async(req,res) => {
    try {
        await Todos.deleteMany({}) ; 
    console.log("all todos deleted successfully") ;
    return res.json({msg : "all todos deleted successfully"}) ;
    }
    catch(err) {
        return res.status(400).json({msg : "something went wrong"}) ;
    }} )

module.exports = app ;


