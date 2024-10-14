//express JS setup
const express = require('express');
//session setup
const session = require('express-session');
//mongoDB session storage
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
//user schema 
const User = require('./models/user.js');
//express app
const app = express();
//file path
const path = require('path');

//dotenv file 
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
   })
   .then(() => {
      console.log("Successfully connected to MongoDB Atlas");
      console.log("Connected to DB: ", mongoose.connection.name);
      console.log(mongoose.connection.collections);
   })
   .catch(err => console.log("Error: ", err));

//mongoDBStore 

const store = new MongoDBStore({
   uri: process.env.MONGODB_URI,
   collection: 'sessions',
   expires: 1 * 60 * 60 * 1000 //1 hr
});

store.on('error', function (error) {
   console.error('Session storage error: ', error);
});


//session parameters
app.use(session({
   secret: process.env.SESSION_SECRET, //delegate session secret to the env file 
   cookie: {
      maxAge: 1 * 60 * 60 * 1000
   },
   store: store,
   resave: false,
   saveUninitialized: false
}));


//tell Render service to select their own port, use 3000 otherwise
const port = process.env.PORT || 3000;

//hardcoded test creditials
const testUsername = 'testUser';
const testPassword = 'password123';

//?: App to let express parse JSON bodies
app.use(express.json());

//we are returning files from the public directory only
//tell Render to use public folder to serve static pages
app.use(express.static((path.join(__dirname, 'public'))));


//setup get handler for index.html for when server starts
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/public/index.html');
});

//POST requests made to the /submit endpoint end up here 
app.post('/submit', async (req, res) => {
   //log what was sent to the post
   console.log('LogIn form data received:', req.body);

   //UNCHECKED: makes the first form entry the username and the second entry the password 
   const {
      username,
      password
   } = req.body;

   try {
      //log the variables.
      console.log(`Received username: ${username}, password: ${password}`);
      //look in db for user
      const user = await User.findOne({
         username,
         password
      });
      console.log("User Found: ", user);
      //we compare for valid login credentials
      if (user) {
         //log directory of valid login page
         console.log(__dirname + '/public/dashboard.html');

         //set session parameters 
         req.session.userId = user._id;
         req.session.username = username;
         req.session.isAuthenticated = true;

         //debug
         console.log('Session created:', {
            sessionId: req.sessionID,
            userId: req.session.userId,
            username: req.session.username,
            isAuthenticated: req.session.isAuthenticated
         });
   
         //save the session
         req.session.save((err) => {
            if (err) {
               console.error("Error trying to save session: ", err);
               return res.status(500).json({
                  error: 'Failed to save session'
               });
            } else {
               console.log("Saved session successfully.");
               console.log("Session ID: " + req.sessionID);
               res.json({
                  success: true,
                  redirect: '/dashboard'
               });
            }
         })

      } else {
         res.json({
            success: false,
            redirect: '/invalidLogin'
         });
      }
   } catch (error) {
      console.error("Error Logging In: ", error);
      res.status(500).json({
         error: 'Failed to Log In'
      });
   }
});

//app get handler for dashbaord

app.get('/dashboard',  async (req, res) => {
   if (!req.session.isAuthenticated) {
      return res.redirect('/');
   }
   try {
      console.log('Dashboard route hit:', {
         sessionId: req.sessionID,
         isAuthenticated: req.session.isAuthenticated,
         userId: req.session.userId
      });
      //find user based on session ID
      const user = await User.findOne({ _id: req.session.userId });
      if (!user) {
         console.log("User found: ", user.username, user._id);
         req.session.destroy();
         return res.redirect('/');
      } else {
         res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
      }
   } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).send('Server error');
   }
});

//logout get handler
app.get('/logout', (req, res) => {
      console.log("Current session:", req.session); // Log the current session

   req.session.destroy((err) => {
      if (err) {
         console.log("Error during session destruction:", err);
      } else {
         console.log("Session destroyed");
      }

      res.redirect('/logoutPage') // Serve logout page
   });
});

app.get('/logoutPage', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'logout.html'));
});

//app get handler to retrieve session data 
app.get('/sessionData', async (req, res) => {
   if (req.session.isAuthenticated) {
      try {
         const user = await User.findOne({
            username: req.session.username
         });
         res.json({
            username: user.username,
            exercises: user.exercises,
            lastGymVisit: user.lastGymVisit
         });
      } catch (error) {
         console.log("Error loading User Session Data: ", error);
      }
   } else {
      res.json({
         message: "NO AUTHORIZATION"
      });
   }
});

//handler for posting an input from user
app.post('/saveGymVisit', async (req, res) => {
   if (req.session.isAuthenticated) {
      const {
         newVisitDate
      } = req.body;

      console.log("req.body: ", newVisitDate);

      await User.findOneAndUpdate({
         username: req.session.username
      }, {
         lastGymVisit: newVisitDate
      }, {
         new: true,
         runValidators: true
      });
      res.json({
         success: true
      });
   } else {
      res.status(403).json({
         success: false,
         message: 'Not authenticated'
      }); //send error if no auth
   }
});

app.post('/updateExercise', async (req, res) => {
   if (req.session.isAuthenticated) {
      const {
         exerciseName,
         weight
      } = req.body;

      console.log("req.body: ", req.body);

      const user = await User.findOneAndUpdate({
         username: req.session.username,
         'exercises.name': exerciseName
      }, {
         $set: {
            'exercises.$.lastWeight': weight,
            'exercises.$.lastUpdated': new Date()
         }
      }, {
         new: true,
         runValidators: true
      });

      if (user) {

         console.log("Updated User Exercises Profile: ", user.exercises);

         res.json({
            success: true,
            message: 'Exercise weight updated successfully'
         });
      } else {
         return res.status(404).json({
            success: false,
            message: 'User not found'
         });
      }
   }
});

app.post('/addExercise', async (req, res) => {
   if (req.session.isAuthenticated) {
      const {
         exerciseAddName,
         exerciseAddWeight
      } = req.body;
      try {
         const user = await User.findOneAndUpdate({
            username: req.session.username
         }, {
            $push: {
               exercises: {
                  name: exerciseAddName,
                  lastWeight: exerciseAddWeight,
                  lastUpdated: new Date()
               }
            }
         }, {
            new: true,
            runValidators: true
         });

         if (user) {
            //create a new exercise object from the last exercise in the list, the newest added exercise
            const newAddExercise = user.exercises[user.exercises.length - 1];
            //our response is a json with these parameters 
            res.json({
               success: true,
               message: 'Exercise added successfully',
               exercise: newAddExercise
            });
         } else {
            //if error we send our response as an error with a json
            res.status(404).json({
               success: false,
               message: "User not found"
            });
         }
      } catch (error) {
         console.log("Error adding exercise to database: ", error);
         res.status(500).json({
            success: false,
            message: 'Error adding exercise'
         });
      }
   } else {
      res.status(403).json({
         success: false,
         message: 'User Not authenticated'
      });
   }
})

app.post('/deleteExercise', async (req, res) => {
   if (req.session.isAuthenticated) {
      const {
         exerciseDeleteName
      } = req.body;
      try {
         const user = await User.updateOne({
            username: req.session.username
         }, {
            $pull: {
               exercises: {
                  name: exerciseDeleteName
               }
            }
         }, {
            new: true,
            runValidators: true
         });

         if (user) {
            //create a new exercise object from the last exercise in the list, the newest added exercise
            //our response is a json with these parameters 
            res.json({
               success: true,
               message: 'Exercise ' + exerciseDeleteName + ' deleted successfully.'
            });
         } else {
            //if error we send our response as an error with a json
            res.status(404).json({
               success: false,
               message: "User not found"
            });
         }
      } catch (error) {
         console.log("Error deleting exercise from database: ", error);
         res.status(500).json({
            success: false,
            message: 'Error deleting exercise'
         });
      }
   } else {
      res.status(403).json({
         success: false,
         message: 'User Not authenticated'
      });
   }
})

//get handler for valid login endpoint
app.get('/validLogin', (req, res) => {
   res.sendFile(__dirname + '/public/validLogin.html');
});

//get handler for invalid login endpoint
app.get('/invalidLogin', (req, res) => {
   res.sendFile(__dirname + '/public/invalidLogin.html');
});

app.get('/loadExercise', (req, res) => {

});

//when the server starts successfully we send this message to the server side console
app.listen(port, () => {
   //use url given by render
   const host = process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + port;
   console.log('Server running at: ' + host);
   console.log('Port: ' + port);
   console.log('RENDER_EXTERNAL_URL: ' + (process.env.RENDER_EXTERNAL_URL || 'Not set'));
});