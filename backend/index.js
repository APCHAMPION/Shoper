const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const DBConnection = require("./config/DB");
const Product = require("./models/Product-model");
const UserSchema = require('./models/User-model');
const { error } = require("console");
const { errorMonitor } = require("events");

require("dotenv").config();
const app = express();
const PORT = 4000;
DBConnection();


app.use(express.json());
app.use(cors());

// API creation
app.get("/", (req, res) => {
  res.send("app is running");
});

// Image storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/image");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'upload' directory
app.use('/image', express.static(path.join(__dirname, 'upload/image')));

app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${PORT}/image/${req.file.filename}`,
  });
});

// Add product endpoint
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id = 1;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("saved");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Remove product endpoint
app.post("/removeproduct", async (req, res) => {
  const p = await Product.findOneAndDelete({ id: req.body.id });
  console.log("removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Get all products endpoint
app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  console.log("all products fetched");
  res.send(products);
});


//creating endpot for register the user
app.post("/signup",async (req,res)=>{
    let check = await UserSchema.findOne({email : req.body.email});
    if(check){
        return res.status(400).json({success:false,error:"User exist with this email address"});
    }
    let cart ={}
    for(let i=0; i<300; i++){
        cart[i] = 0;
    }

    const user = await UserSchema.create({
        username : req.body.username,
        email : req.body.email,
        password : req.body.password,
        cartData : cart,
    });

    const data = {
        user : {
            id : user.id
        }
    }

    const token = jwt.sign(data,"my_secret");
    res.json({success:true,token});
})

//creating login Api

app.post("/login",async(req,res)=>{
    const user = await UserSchema.findOne({email:req.body.email});
    if(user){
        const passCompare = req. body.password === user.password;
        if (passCompare) {
            const data ={
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'my_secret');
            res. json ({success: true, token}) ;
        }
        else{
            res.json({success : false,errors : "Wrong Password"});
        }
    }
    else{
        res.json({success:false, errors : "Wrong Email Id"});
    }
})

app.listen(PORT, (err) => {
  if (!err) {
    console.log(`app is running at ${PORT}`);
  } else {
    console.log(`Error ${err}`);
  }
});
