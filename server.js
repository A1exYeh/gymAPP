const express = require('express');
const app = express();
const port = 3000;

//hardcoded test creditials
const testUsername = 'testUser';
const testPassword = 'password123';

//?: App to let express parse JSON bodies
app.use(express.json());

//we are returning files from the public directory only
app.use(express.static('public'));

//POST requests made to the /submit endpoint end up here 
app.post('/submit', (req, res) => {
   //log what was sent to the post
   console.log('LogIn form data received:', req.body);

   //UNCHECKED: makes the first form entry the username and the second entry the password 
   const {username, password} = req.body;

   //log the variables.
   console.log(`Received username: ${username}, password: ${password}`);

   //we compare for valid login credentials
   //.trim() is supposed to get rido f any extra whitespace, etc.
   if (username.trim() === testUsername && password.trim() === testPassword){
      //log directory of valid login page
      console.log(__dirname + '/public/validLogin.html');

      //send a redirect which is handled by the get request handler at endpoint
      res.redirect('/validLogin');

      //old code that returns login credentials and validity message 
      //res.json({
      //   message: 'Valid Login credentials',
      //   logIn: req.body
      //});
   } else {
      //log directory of invalid login page
      console.log(__dirname + '/public/invalidLogin.html');
      
      //send a redirect which is handled by the get request handler at endpoint
      res.redirect('/invalidLogin');

      //old code that returns login credentials and validity message 
      //res.json({
      //   message: 'Invalid Login credentials',
      //   logIn: req.body
      //});
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

//when the server starts successfully we send this message to the server side console
app.listen(port, () => {
   console.log('Server running at http://localhost:${port}');
});