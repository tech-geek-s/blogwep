

const express=require("express");
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
const request=require('request');
const session=require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const app=express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "our littel secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/blogwebdb",{useUnifiedTopology: true, useNewUrlParser:true});
mongoose.set("useCreateIndex", true);

const inc= "";
var likes=0;
let clientStatus = ""
let logButton = ""

const clientSchema= new mongoose.Schema({
  email: String,
  password: String
});
const blogdataSchema=new mongoose.Schema({
  title:String,
  content:String
});
const answersSchema = new mongoose.Schema({
  description: String,
  code: String
});

const QuestionsSchema=new mongoose.Schema({
  title: String,
  description: String,
  code: String,
  answers: [answersSchema]
});

clientSchema.plugin(passportLocalMongoose);

const Client = new mongoose.model("Client",clientSchema);
const BlogData= new mongoose.model("BlogData",blogdataSchema);
const Answer = new mongoose.model("Answer", answersSchema);
const Question =new mongoose.model("Question",QuestionsSchema);

passport.use(Client.createStrategy());

passport.serializeUser(function(client, done) {
  done(null, client.id);
});

passport.deserializeUser(function(id, done) {
  Client.findById(id, function(err, client) {
    done(err, client);
  });
});

app.get("/",function(req,res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("home", {clientStatus: clientStatus, logButton: logButton});
} else {
  clientStatus = "/signup"
  logButton = "signup"
    res.render("home", {clientStatus: clientStatus, logButton: logButton});
}
})


app.get("/signup",function(req,res){
  clientStatus = "/signin"
  logButton = "SignIn"
  res.render("signup", {clientStatus: clientStatus, logButton: logButton})
})


app.get("/signin",function(req,res){
  clientStatus = "/signup"
  logButton = "SignUp"
  res.render("signin",{var1:inc, clientStatus: clientStatus, logButton: logButton})
})


app.get("/questions", function(req,res){

  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    Question.find(function(err, foundQuestions){
      if(!err){
        res.render("questions", {questions: foundQuestions, clientStatus: clientStatus, logButton: logButton});
      } else {
        res.send(err);
      }
    })
   
} else {
  clientStatus = "/signin"
  logButton = "SignIn"
  Question.find(function(err, foundQuestions){
    if(!err){
      res.render("questions", {questions: foundQuestions, clientStatus: clientStatus, logButton: logButton});
    } else {
      res.send(err);
    }
  })
    
}
})

app.get("/ask_question", function(req,res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("ask_question", {clientStatus: clientStatus, logButton: logButton});
} else {
  clientStatus = "/signin"
  logButton = "SignIn"
    res.render("signin", {var1:inc,clientStatus: clientStatus, logButton: logButton});
}
 
})

app.post("/ask_question", function (req, res) {

  const newQuestion = new Question({
     title: req.body.questionTitle,
     description: req.body.questionContent,
     code: req.body.questionCode
  });

  newQuestion.save(function(err){
    if(!err){
      console.log("Succesflly added question");
    } else {
      console.log(err);
    }
  })
res.redirect("/questions");
});

app.get("/blog",function(req,res){

  if(req.isAuthenticated()){
    clientStatus = "logout"
    logButton = "Logout"
    BlogData.find({},function(err,foundPost){
      res.render("blog",{likes:likes, title:foundPost.title, content:foundPost.content, BlogData: foundPost, clientStatus: clientStatus, logButton: logButton})
})

} else {
  clientStatus = "login"
  logButton = "Login"
  BlogData.find({},function(err,foundPost){
    res.render("blog",{likes:likes, title:foundPost.title, content:foundPost.content, BlogData: foundPost, clientStatus: clientStatus, logButton: logButton})
})

}
})
app.post("/blog",function(req,res){
  if(req.isAuthenticated()){
     likes=likes+1
     BlogData.find({},function(err,foundPost){
     res.render("blog",{likes:likes, title:foundPost.title, content:foundPost.content, BlogData: foundPost})
    })
  } else {
    res.redirect("/signin");
  }
})

app.get("/blogsubmit",function(req,res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("blogsubmit", {clientStatus: clientStatus, logButton: logButton});
} else {
  clientStatus = "/signup"
  logButton = "signup"
  res.render("signin", {var1:inc, clientStatus: clientStatus, logButton: logButton});
}
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
        res.redirect("blog")

})



app.post("/signup",function(req,res){
  Client.register({username :req.body.username}, req.body.password,function(err,user){
    if(err){
      console.log(err);
    res.redirect("signup");
  }else{
    passport.authenticate("local")(req, res, function(){
      res.redirect("blog");
    })
  }
})
});



app.post("/signin",function(req,res){
  const client = new Client({
    email: req.body.username,
    password: req.body.password
})

req.login(client, function(err){
    if(err){
        console.log(err);
    }else {
        passport.authenticate("local")(req, res,function(){
            res.redirect("blog");
        })
    }
})
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})



app.get("/:questionTitle", function(req,res){

  const questionTitle = req.params.questionTitle;

  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    Question.findOne({title: questionTitle}, function(err, foundQuestion){
      if(foundQuestion){
        res.render("singleQuestion",{_id: foundQuestion._id, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers, clientStatus: clientStatus, logButton: logButton})
      } else {
        console.log(err);
      }
    })
} else {
  clientStatus = "/signup"
  logButton = "signup"
  Question.findOne({title: questionTitle}, function(err, foundQuestion){
    if(foundQuestion){
      res.render("singleQuestion",{_id: foundQuestion._id, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers, clientStatus: clientStatus, logButton: logButton})
    } else {
      console.log(err);
    }
  })
}

 
})

app.post("/:questionId", function(req, res){

  const questionId = req.params.questionId;
  const newAnswer = new Answer({
    description: req.body.answerDescription,
    code: req.body.answerCode
  })

  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    Question.findOne({_id: questionId}, function(err, foundQuestion){
      if(foundQuestion){
        foundQuestion.answers.push(newAnswer);
        foundQuestion.save();
        res.render("singleQuestion",{_id: questionId, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers, clientStatus: clientStatus, logButton: logButton})
      } else {
        res.send(err);
      }
    }) 

} else {
  clientStatus = "/signup"
  logButton = "signup"
  Question.findOne({_id: questionId}, function(err, foundQuestion){
    if(foundQuestion){
      foundQuestion.answers.push(newAnswer);
      foundQuestion.save();
      res.render("singleQuestion",{_id: questionId, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers, clientStatus: clientStatus, logButton: logButton})
    } else {
      res.send(err);
    }
  }) 
}   
})

app.listen(3000,function(){
  console.log("server started")
})
