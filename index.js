

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

const inc= "";
var likes=0;

const clientinfo={
  email:String,
  password:String
};
const blogdata={
  title:String,
  content:String
}

const answersSchema = {
  description: String,
  code: String
}

const QuestionsSchema={
  title: String,
  description: String,
  code: String,
  answers: [answersSchema]
}

const Client = mongoose.model("Client",clientinfo)
const BlogData=mongoose.model("BlogData",blogdata)
const Answer = mongoose.model("Answer", answersSchema)
const Question = mongoose.model("Question",QuestionsSchema);


app.get("/",function(req,res){
  res.render("home")
})


app.get("/signup",function(req,res){
  res.render("signup")
})


app.get("/signin",function(req,res){
  res.render("signin",{var1:inc})
})


app.get("/questions", function(req,res){
  Question.find(function(err, foundQuestions){
    if(!err){
      res.render("questions",{questions: foundQuestions});
    } else {
      res.send(err);
    }
  })
})

app.get("/ask_question", function(req,res){
  res.render("ask_question");
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

  BlogData.find({},function(err,foundPost){
          res.render("blog",{likes:likes, title:foundPost.title, content:foundPost.content, BlogData: foundPost})
  })

})
app.post("/blog",function(req,res){

 likes=likes+1

 BlogData.find({},function(err,foundPost){
  res.render("blog",{likes:likes, title:foundPost.title, content:foundPost.content, BlogData: foundPost})
})
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

  const username=req.body.email;
  const password=req.body.password;
  Client.findOne({email:username},function(err,findclient){
    if(!err){
      if(findclient.password==password){
        console.log("found");
        res.render("home");
      }
      else{
        inc="notfound";
      res.render("signin",{var1:inc});
      }
    }

    else{
    console.log(err)
  }
  })
});



app.get("/:questionTitle", function(req,res){
  const questionTitle = req.params.questionTitle;
  Question.findOne({title: questionTitle}, function(err, foundQuestion){
    if(foundQuestion){
      res.render("singleQuestion",{_id: foundQuestion._id, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers})
    } else {
      console.log(err);
    }
  })
})

app.post("/:questionId", function(req, res){

  const questionId = req.params.questionId;
  const newAnswer = new Answer({
    description: req.body.answerDescription,
    code: req.body.answerCode
  })
  
  Question.findOne({_id: questionId}, function(err, foundQuestion){
    if(foundQuestion){
      foundQuestion.answers.push(newAnswer);
      foundQuestion.save();
      res.render("singleQuestion",{_id: questionId, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers})
    } else {
      res.send(err);
    }
  })   
  })

app.listen(3000,function(){
  console.log("server started")
})
