//add an event listener for when the form is submitted

//check for existence
const logInCard = document.getElementById('logInCard');
if (logInCard) {
   logInCard.addEventListener('submit', function(e) {
      //UNCHECKED: we process the form as a parameter 'e' and then prevent default form submission
      e.preventDefault();
   
      //get the data from the form's fields
      //UNCHECKED: we make a new object of formData using the parameters from our form
      //UNCHECKED: then we use that object to create an object 'data' containing our entry data
      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());
   
      //fetch request to '/submit' endpoint
      fetch ('/submit', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
         //?: redirect field set to follow
         redirect: 'follow',
         credentials: 'same-origin'
      })
      //whatever response we get, we read it as a json file
      .then(response => {
         if (response.redirected) {
            window.location.href = response.url;
         } else {
            return response.json();
         }
      })
      .catch(error => {
         console.error('Error:', error);
      });
   });
}

//check for existence
const logOutButton = document.getElementById('logOutButton');
if (logOutButton) {
   logOutButton.addEventListener('click', function(e) {
      e.preventDefault();
   
      fetch('/logout', {
         method: 'GET',
         cache: 'no-cache'
      })
      .then(response => {
         if (response.redirected) {
            window.location.href = response.url;
         } else {
            console.error('Logout failed, no redirect');
        }
      })
      .catch(error => {
         console.error('Error:', error);
      });
   });
   
}

//check for existence of dashboard header to verify that we are in dashboard.html
const dashboard = document.getElementById('dashHeader');
if (dashboard) {
   //test variables for user input 
   const usernameID = document.getElementById('usernameID');
   const savedInputElement = document.getElementById('savedInput');
   const userInput = document.getElementById('userInput');

   document.addEventListener('DOMContentLoaded', function(e) {
      fetch('/sessionData', 
         {
            method: 'GET'
         })
         .then(response => response.json())
         .then(data => {
            if (data.username) {
               usernameID.textContent = data.username; //set the username
            }

            // Load input from local storage
            const localStorageInput = localStorage.getItem('userInput');
            if (localStorageInput) {
                savedInputElement.textContent = localStorageInput; // Set saved input from local storage
            }

            if (data.userInput) {
               savedInputElement.textContent = data.userInput;
            }
         })
      });

      const saveButton = document.getElementById('saveButton');

      saveButton.addEventListener('click', function(e) {
         e.preventDefault();
         const userInputValue = userInput.value;
         //const savedInputElement = document.getElementById('savedInput');

         localStorage.setItem('userInput', userInputValue);
   
         fetch('/saveUserInput', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({input: userInputValue})
         })
         .then(respone => respone.json())
         .then(data => {
            if (data.success) {
               savedInputElement.textContent = userInputValue;
            }
         })
         .catch(error => {
            console.log("Error in saving user input: ", error);
         });
      });
   }
