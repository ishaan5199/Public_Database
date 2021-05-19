const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({path:"./config.env"});
const path = require("path");
const mongoose = require("mongoose"); 
const { start } = require("repl");

const PORT = process.env.PORT || 8000;

// mongoose
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true, useUnifiedTopology: true}).catch((e)=>{
    console.log(e.message);
});

// Error checking for connection to mongoDB
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});


// Defining a Schema
const people = mongoose.Schema({
    name:String,
    phone:String,
    email:String,
    address:String,
    pass:String
});

const Contact = mongoose.model("contact",people);

// Express related stuff
app.use("/public",express.static("./Public"));
app.use(express.urlencoded({extended:false}));

// Pug specific stuff
app.set("view engine","pug");
app.set("views",path.join(__dirname,"views"));

// ENDPOINTS

/* Home Page */
app.get("/",(req,res)=>{
    res.status(200).render("welcome.pug");
});

app.get("/create_user",(req,res)=>{
    res.status(200).render("create_user.pug");
}); 

app.get("/login",(req,res)=>{
    res.status(200).render("login.pug");
});

app.get("/home",(req,res)=>{
    res.status(200).render("home.pug");
});

app.post("/welcome",(req,res)=>{
    Contact.findOne(req.body,(err, contacts)=>{
        if(err){
            return res.status(400).send("Login Failed!");
        }
        // console.log(contacts);
        if(!contacts){
            return res.status(200).render("login.pug",{message:"Invalid Login Credentials"});
        }
        res.status(200).render("home.pug",{greet:`Welcome ${contacts.name}`});
    })
});

/* User Creation */
app.post("/new_user",(req,res)=>{
    // console.log(req.body);
    let Data = new Contact(req.body);
    Data.save().then(()=>{
        console.log(req.body);
        res.status(200).render("home.pug",{greet:`Welcome ${Data.name}`});
    }).catch((e)=>{
        res.status(404).send(e.message);
    });
    
});

/* Info retrieval */
app.get("/search",(req,res)=>{
    let request = req.query;
    // console.log(request);
    let KEY = Object.keys(request)[0];
    let Start = Object.values(request)[0];
    // console.log(KEY);
    // console.log(Start);
    Contact.find({[KEY]: {$regex: '.*' + Start, $options: 'i'} }, function(err, contacts){           // imp
        let details = contacts;
        if(err){
            // onsole.log(err);
            return res.status(400).send("Request Failed!");
        }
        if(details.length==0){
            return res.status(200).render("search_result.pug",{tf:false,title:"Global Search",heading:"No match found :("});
        }
        // console.log(details);
        res.status(200).render("search_result.pug",{tf:true,title:"Global Search",heading:"Search Successful",value:details});
    })
});

/* Info Updation */
app.post("/up",(req,res)=>{
    console.log(req.body);
    
    //Contact.updateOne({name:``})
});

/* User Deletion */
app.delete("/del",(req,res)=>{

});

/* PORT Listen */
app.listen(PORT,()=>{
    console.log(`Server listening to port ${PORT}...`);
});