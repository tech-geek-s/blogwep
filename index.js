
var likes=0;
var title="";
var content=""
const express=require("express");
const bodyparser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
const request=require('request');

const app=express();

app.set('view engine', 'ejs')
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/blogwebdb",{useNewUrlParser:true});
const clientinfo={
  email:String,
  password:String
};
const blogdata={
  title:String,
  content:String
}
const BlogData=mongoose.model("BlogData",blogdata)
const Client = mongoose.model("Client",clientinfo)
app.get("/",function(req,res){

  res.render("home")
})
app.get("/signup",function(req,res){
  res.render("signup")
})
app.get("/signin",function(req,res){
  const var1="";
const notfound="not a valid user"
  res.render("signin",{var1:var1})
})
app.get("/blog",function(req,res){

  BlogData.find({},function(err,post){
          res.render("blog",{likes:likes, title:post, content:post})
  })

})
app.post("/blog",function(req,res){

 likes=likes+1

  res.render("blog",{likes:likes,title:title, content:content})
})
app.get("/blogsubmit",function(req,res){
  res.render("blogsubmit")
})
app.post("/blogsubmit",function(req,res){

  const newblog= new BlogData({
    title:req.body.blogtitle,
    content:req.body.content
  });
  newblog.save(function(err){
    if(!err){
      console.log("successfully added blog");
    }
    else{
      console.log(err)
    }
  })
        res.redirect("/blog")

})
app.post("/signup",function(req,res){
const  newclient = new Client({
  email:req.body.eml,
  password:req.body.pass1
});
newclient.save(function(err){
  if(!err){
    console.log("successfully inserted");
  }else{
    console.log(err);
  }
})

});
app.post("/signin",function(req,res){
  const var1=""
const notfound="not a valid user"
  const username=req.body.email;
  const password=req.body.password;
  Client.findOne({email:username},function(err,findclient){
    if(!err){
      if(findclient.password==password){
        console.log("found");
        res.render("home");
      }
      else{
        var1="notfound";
      res.render("signin",{var1:var1});
      }
    }

    else{
    console.log(err)
  }
  })
});

app.listen(3000,function(){
  console.log("server started")
})
