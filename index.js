const express=require('express');
const path=require('path');

const cookieParser=require('cookie-parser');

const {redirectToLoggedUserOnly,checkAuth}=require('./middleware/auth')

const {connectToDB}=require('./connect')
const urlRoutes=require('./routes/url');
const URL=require('./model/url');
const staticRoute=require('./routes/staticRouter');
const UserRoute=require("./routes/user");


const app=express();
const port=8001;

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

connectToDB("mongodb://localhost:27017/short-url").then((err)=>console.log("mongodb connected"));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));




app.use('/url',redirectToLoggedUserOnly, urlRoutes);
app.use('/user',UserRoute);
app.use('/',checkAuth,staticRoute);
 
app.get('/test',async (req,res)=>{
     const allUrls= await URL.find({});
     return res.render("home",{
        urls:allUrls,
     });
});

app.get('/url/:shortId',async (req,res)=>{
    const shortId=req.params.shortId;
     const entry=await URL.findOneAndUpdate(
        {
            shortId
        },
        {
            $push:{
                visitHistory:{
                    timestapms:Date.now(),
                },
            },
        }
    );
 res.redirect(entry.redirectUrl);
});


app.listen(port,()=>{console.log(`Server started on port:${port}`)})