const express = require("express");
const app = express();
const path = require("path");
const { Collection } = require("mongoose");
const port = process.env.PORT || 8000;
const templatepath = path.join(__dirname, "../template");
const logIncollection = require("./db/conn");
require("./db/conn");
const hbs = require("hbs");
require('dotenv').config();

const { generateToken, authenticate } = require('../utils/auth');




const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));

app.use(express.static('public'));//this

app.use(express.json());

app.set("view engine", "hbs");
app.set("views", templatepath);

app.use(express.static('template'));//this
// app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({extended:false}))

app.get("/", (req, res) => {
  res.sendFile(path.join(static_path, "index.html"));
});

app.get("/login", (req, res) => {
  res.render("signup");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/logout", (req, res) => {
  // Clear the session or cookies here
  res.redirect("/");
});

// app.post("/signup",async(req,res)=>{
//   const data={
//      name:req.body.name,
//      password:req.body.password
     
//   }
// await logIncollection.insertMany([data])

// res.render("dashboard")
// })
app.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  
  if (password !== confirmPassword) {
    return res.send("Passwords do not match!");
  }

  const data = { name, email, password };

  try {
    const user = await logIncollection.insertMany([data]);
    const token = await generateToken(user[0]);

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    });

    res.render('dashboard', { user: data });
  } catch (err) {
    res.status(500).send("Error signing up");
  }
});


// app.post("/login",async(req,res)=>{
  
//   try{const check=await logIncollection.findOne({name:req.body.name})
// if(check.password==req.body.password){
//   res.render("dashboard")
// }
// else{
//   res.send("Wrong password")
// }
// }
// catch
// {
//  res.send("Wrong credentials")
// }
// })
// app.post("/login", async (req, res) => {
//   try {
//     const check = await logIncollection.findOne({ email: req.body.email });
//     if (check && check.password === req.body.password) {
//      res.render("dashboard", { user: data });
//     } else {
//       res.send("Wrong email or password");
//     }
//   } catch {
//     res.send("Wrong credentials");
//   }
// });

app.post("/login", async (req, res) => {
  try {
    const check = await logIncollection.findOne({ email: req.body.email });

    if (!check || check.password !== req.body.password) {
      return res.status(401).send("Invalid email or password");
    }

    const token = await generateToken(check);

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    });

    res.render('dashboard', { user: check });
  } catch (err) {
    console.error(err);
  }
});


// app.get("/",(req,res)=>{
//      res.send("hello NAINA  ")
// });

app.listen(port, () => {
  console.log(`Server is running at PORT  ${port}`);
});


