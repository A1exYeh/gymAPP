//express JS setup
const express = require('express');
//session setup
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const app = express();

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true
})
.then(() => 
   {
      console.log("Successfully connected to MongoDB Atlas");
      console.log("Connected to DB: ", mongoose.connection.name);
      console.log(mongoose.connection.collections);
   })
.catch(err => console.log("Error: ", err));

//session parameters
app.use(session({
   secret: 'your_session_secret',  //test key
   resave: false,
   saveUninitialized: true,
   cookie: { secure: false }  
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
app.get ('/', (req, res) => {
   res.sendFile(__dirname + '/public/index.html');
});

//POST requests made to the /submit endpoint end up here 
app.post('/submit',  async (req, res) => {
   //log what was sent to the post
   console.log('LogIn form data received:', req.body);

   //UNCHECKED: makes the first form entry the username and the second entry the password 
   const {username, password} = req.body;

   //log the variables.
   console.log(`Received username: ${username}, password: ${password}`);
   //look in db for user
   const user = await User.findOne({username, password});
   console.log("User Found: ", user);
   //we compare for valid login credentials
   //.trim() is supposed to get rido f any extra whitespace, etc.
   if (user) {
      //log directory of valid login page
      console.log(__dirname + '/public/dashboard.html');
      
      //set session parameters 
      req.session.username = username;
      req.session.isAuthenticated = true;

      console.log ("Session ID: " + req.sessionID);
      console.log("Authenticated: " + req.session.isAuthenticated);

      //send a redirect which is handled by the get request handler at endpoint
      res.redirect('/dashboard');

   } else {
      //log directory of invalid login page
      console.log(__dirname + '/public/invalidLogin.html');
      //send a redirect which is handled by the get request handler at endpoint
      res.redirect('/invalidLogin');
   }
});

//app get handler for dashbaord

app.get('/dashboard', (req, res) => {
   console.log("Dashboard accessed. Session authenticated:", req.session.isAuthenticated);
   if (req.session.isAuthenticated) {
      res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
   } else {
      console.log("User not authenticated. Redirecting to home.");
      res.redirect('/');
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
   res.sendFile(path.join(__dirname , 'public', 'logout.html'));
});

//app get handler to retrieve session data 
app.get('/sessionData', async (req, res) => {
   if (req.session.isAuthenticated){
      try {
         const user = await User.findOne({username: req.session.username});
         res.json({
            username: user.username,
            userInput: user.userInput,
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
app.post('/saveUserInput', async (req, res) => {
   if (req.session.isAuthenticated) {
      const {input} = req.body;

      console.log("req.body: " + input);

      await User.findOneAndUpdate(
         {username: req.session.username},
         {userInput: input},
         {new: true, runValidators: true}
      );
      res.json(
         {success: true}
      );
   } else {
      res.status(403).json({ success: false, message: 'Not authenticated' }); //send error if no auth
   }
});

app.post('/updateExercise', async (req, res) => {
   if (req.session.isAuthenticated) {
      const {exerciseName, weight} = req.body;

      console.log("req.body: ", req.body);

      const user = await User.findOneAndUpdate(
         { username: req.session.username, 'exercises.name': exerciseName },
         {
            $set: {
               'exercises.$.lastWeight': weight, 
               'exercises.$.lastUpdated': new Date()
            }
         },
         { new: true, runValidators: true } 
      );

      if (user) {     

         console.log("Updated User Exercises Profile: ", user.exercises);

         res.json(
            {
               success: true,
               message: 'Exercise weight updated successfully'
            }
         );
      } else {
         return res.status(404).json({ success: false, message: 'User not found' });
      }
   }
});

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