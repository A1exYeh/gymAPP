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
   const addExerciseButton = document.getElementById('addExerciseButton');

   function updateExercise(exerciseName, newWeight) {
      fetch('/updateExercise', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({exerciseName, weight: newWeight}),
      })
      .then(response => response.json())
      .then(data => {
         if (data.success) {
            console.log("Exercise Updated!");
         } else {
            console.log("Unable to Update Exercise.");
         }
      })
      .catch ((error) => {
         console.error('Error: ', error);
      })
    }

   function createExerciseCard(exercise){
      const card = document.createElement('div');
      card.className = 'exerciseCard';
      card.innerHTML = 
      `
         <h3 id="exerciseTitle">${exercise.name}</h3>
            <div id="exerciseLastWeight">${exercise.lastWeight}<span> LBs</span></div>
            <label for="newExerciseWeight"></label>
            <input type="number" id="newExerciseWeight">
            <button id="updateExercise">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColorclass="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 8 2z"/>
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 658A.25.25 0 0 1 8 4.466"/>
               </svg>
            </button>
      `;

      card.querySelector('.updateExercise').addEventListener('click', function(e){
         const newWeight = card.querySelector(`#newWeight${exercise.name}`).value;
         updateExercise(exercise.name, newWeight);
      });

      return card;
   }

   document.addEventListener('DOMContentLoaded', function(e) {
      fetch('/sessionData', 
         {
            method: 'GET'
         })
         .then(response => response.json())
         .then(data => {
            console.log(data);
            if (data.username) {
               usernameID.textContent = data.username; //set the username
            }

            if (data.userInput) {
               savedInputElement.textContent = data.userInput;
            }

            if(data.exercises){
               data.exercises.forEach(exercise => {
                  console.log(exercise);
                  const exerciseCard = createExerciseCard(exercise);
                  document.getElementById('exerciseList').appendChild(exerciseCard);
               })
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
            body: JSON.stringify({
               input: userInputValue
            })
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
