
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path')
const engine = require('ejs-mate')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const User = require('./models/user.js')
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const flash = require('connect-flash')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const staticRouter = require('./routes/static.js')
const classRouter = require('./routes/class.js')
const userRouter = require('./routes/user.js')
const spotsRouter = require('./routes/spots.js')
const adminRouter = require('./routes/admin.js')
const eventsRouter = require('./routes/events.js')
const contactRouter = require('./routes/contact.js')
const { isLoggedIn } = require('./middleware.js');
const Event = require("./models/event.js");
mongoose.connect('mongodb://localhost:27017/parkourAlgarve', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => {
        console.log('Data base connected')
    })
    .catch((err) => {
        console.log('Something went wrong')
        console.log(err)
    })



app.engine('ejs', engine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));


app.use(session({
    name: 'session',
    secret: 'YAREYAREDAZE',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
}))


app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.use(new GoogleStrategy({
    clientID: '311319139041-jfq173m1lhneekelaejtg0u4ibpp97fv.apps.googleusercontent.com',
    clientSecret: 'NjG0GfZdhDQCbl-QeVOcfJpJ',
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, profile, function (err, user) {
            return cb(err, user);
        }, User);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});


passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.preview = req.session.preview
    next();
})

app.use('/', staticRouter)
app.use('/', classRouter)
app.use('/', userRouter)
app.use('/', adminRouter)
app.use('/', spotsRouter)
app.use('/', eventsRouter)
app.use('/', contactRouter)


app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }), (req, res) => {

});



app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res, next) {
        try {
            req.flash('success', 'A sua conta Parkour Algarve foi conectada com a sua conta google com sucesso')
            if (req.session.returnTo) {
                res.redirect(req.session.returnTo);
                return delete req.session.returnTo
            }
            else {
                return res.redirect('/sobreNos')
            }

        } catch (e) {
            next(e)
        }
    });

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


app.use((req,res,next)=>{
    try{
        const currentDate = Date.now()
        const toBeDeleted = Event.deleteMany({endJsDate: {$lt: currentDate}}) 
       return next()  
    }catch(e){
       return next()
    }
})

app.use((req,res,next)=>{
    const currentDate = Date.now()
    const foundEvents= Event.findMany({isWhiteListed:{whiteListed: true, Date: {$lt:currentDate}}})
    for(let ev of foundEvents){
        ev.isWhiteListed.whiteListed = false
        ev.isWhiteListed.Date = null
    }
    if(!foundEvents) return next()
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


app.listen(3000, function () {
    console.log('Listenning on port 3000')
})

//restfull routes//
//GET / home
//GET / infoaulas
//GET / sobrenos
//GET / parkour

//GET / merchandise

//GET / addNew / event
//POST / addNew / event
//DELETE / event /: id
//PUT / event /: id
//GET / event /: id
//GET / allEvents

//GET / allSpots
//GET / addNew / spot
//POST / addNew / spot
//DELETE / spot /: id
//PUT / spot /: id

//GET / classes
//GET / classes /: id
//POST / addNew / class
//PUT / class/: id
//DELETE / class/: id
