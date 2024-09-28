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
   const lastGymVisit= document.getElementById('lastGymVisit');
   const userInput = document.getElementById('userInput');
   const addExerciseButton = document.getElementById('addExerciseButton');
   const updateGymVisitButton = document.getElementById('addVisitDateButton');

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
            console.log(data.message);

            const exerciseCard = document.querySelector(`#exerciseCard #exerciseTitle[data-name="${exerciseName}"]`).closest('#exerciseCard');

            // console.log(exerciseCard); idk how to check if we are selecting the right card
            if (exerciseCard) {
               const lastWeightElement = exerciseCard.querySelector('#exerciseLastWeight');
               if (lastWeightElement) {
                 lastWeightElement.innerHTML = `${newWeight} <span>LBS</span>`;
               }
             }
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
      card.id = 'exerciseCard';
      card.innerHTML = `
         <h3 id="exerciseTitle" data-name="${exercise.name}">${exercise.name}</h3>
         <div id="exerciseLastWeight">${exercise.lastWeight}<span> LBs</span></div>
         <input type="number" id="newExerciseWeight" placeholder="New weight">
         <button id="updateExercise">
            Update
         </button>
      `;


      const updateExerciseButton = card.querySelector('#updateExercise');

      if (updateExerciseButton) {
         updateExerciseButton.addEventListener('click', function() {
            const newWeightInput = card.querySelector('#newExerciseWeight');
            if (newWeightInput) {
               const newWeight = newWeightInput.value;
               updateExercise(exercise.name, newWeight);
            } else {
               console.error(`New weight input not found for ${exercise.name}`);
            }
         });
      } else {
         console.error(`Update button not found for ${exercise.name}`);
      }

      return card;
   }

   document.addEventListener('DOMContentLoaded', function(e) {
      const exerciseList = document.getElementById('exerciseList');
      fetch('/sessionData', 
         {
            method: 'GET'
         })
         .then(response => response.json())
         .then(data => {
            console.log(JSON.stringify(data, null, 2));
            console.log("Session Data: ", data);
            if (data.username) {
               usernameID.textContent = data.username; //set the username
            }

            if (data.lastGymVisit) {
               console.log("last gym visit: ", data.lastGymVisit);
               lastGymVisit.textContent = new Date(data.lastGymVisit);
            }

            if(data.exercises ){

               data.exercises.forEach(exercise => {

                  console.log("Processing Exercise: ", exercise);
                  if (exercise && exercise.name) {
                     const exerciseCard = createExerciseCard(exercise);
                     exerciseList.appendChild(exerciseCard);
                  } else {
                     console.log("Error Creating Exercise Card For: ", exercise);
                  }
               });
            } else {
               console.log("Could not find exercises.");
               exerciseList.innerHTML = '<p>No exercises found.</p>';
            }
         })
         .catch (error => {
            console.error('Error fetching session data:', error);
            //exerciseList.innerHTML = '<p>Error loading exercises. Please try again later.</p>';
         });
      });

      updateGymVisitButton.addEventListener('click', function(e) {
         e.preventDefault();
         const newVisitDate = new Date();
         //const savedInputElement = document.getElementById('savedInput');
   
         fetch('/saveUserInput', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               newVisitDate: newVisitDate
            })
         })
         .then(respone => respone.json())
         .then(data => {
            if (data.success) {
               lastGymVisit.textContent = newVisitDate;
            }
         })
         .catch(error => {
            console.log("Error in saving user input: ", error);
         });
      });
   }
