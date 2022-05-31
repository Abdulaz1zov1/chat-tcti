let express = require('express');
let app =express();
let http =require('http').Server(app);
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let mongoStore = require('connect-mongo')(session);
let methodOverride = require('method-override');
let path = require('path');
let fs = require('fs');
let logger = require('morgan');
app.use(logger('dev'));

//socket.io
require('./library/Chat.js').sockets(http);

//db connection

const MongoURI = "mongodb://localhost:27017/adda"
mongoose
    .connect(MongoURI, {
        useNewUrlParser: true
    })
    .then((res) => {
        console.log(`MongoDB Connected`);
    })

let userModel = mongoose.model('user');

//http method override middleware
app.use(methodOverride(function(req,res){
  if(req.body && typeof req.body === 'object' && '_method' in req.body){
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Session setup for cookies
let sessionInit = session({
                    name : 'userCookie',
                    secret : '9743-980-270-india',
                    resave : true,
                    httpOnly : true,
                    saveUninitialized: true,
                    store : new mongoStore({mongooseConnection : mongoose.connection}),
                    cookie : { maxAge : 80*80*800 }
                  });

app.use(sessionInit);
app.use(express.static(path.resolve(__dirname,'./public')));

// Setting ejs view engine
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname,'./app/views'));

app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());

//including models files.
fs.readdirSync("./app/models").forEach(function(file){
  if(file.indexOf(".js")){
    require("./app/models/" + file);
  }
});

//including controllers files.
fs.readdirSync("./app/controllers").forEach(function(file){
  if(file.indexOf(".js")){
    let route = require("./app/controllers/" + file);
    route.controller(app);
  }
});

// Error Handler
app.use(function(req,res){
  res.status(404).render('message',
      {
          title: "404",
          msg: "Page Not Found.",
          status: 404,
          error: "",
          user: req.session.user,
          chat: req.session.chat
      });
});

app.use(function(req,res,next){

	if(req.session && req.session.user){
		userModel.findOne({'email':req.session.user.email},function(err,user){

			if(user){
        req.user = user;
        delete req.user.password;
				req.session.user = user;
        delete req.session.user.password;
				next();
			}
		});
	}
	else{
		next();
	}
});//end of Logged In User.

http.listen(3000,function(){
  console.log("Chat App started at port : 3000");
});
