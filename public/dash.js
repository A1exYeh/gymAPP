//check for existence of dashboard header to verify that we are in dashboard.html
const dashboard = document.getElementById('dashHeader');
//test variables for user input 
const usernameID = document.getElementById('usernameID');
const lastGymVisit = document.getElementById('lastGymVisit');
const userInput = document.getElementById('userInput');
const addExerciseButton = document.getElementById('addExerciseButton');
const updateGymVisitButton = document.getElementById('addVisitDateButton');
const logOutButton = document.getElementById('logOutButton');

//updates an exercise with data from user
function updateExercise(exerciseName, newWeight) {
   fetch('/updateExercise', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            exerciseName,
            weight: newWeight
         }),
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
      .catch((error) => {
         console.error('Error: ', error);
      })
}

//creates and populates an exercise card given an exercise object
function createExerciseCard(exercise) {
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

   //in the previous code in this function we create a div with the id exerciseCard
   //then we populate it with the exercise card html to which we also update the values with
   //the data we pull from our db
   //this const below selects the updateExercise id button within our newly created card
   const updateExerciseButton = card.querySelector('#updateExercise');
   //for the update exercise button in the card we just made, we attach an event listener
   if (updateExerciseButton) {
      //when a user click this update exercise button, if there is a new weight inputted 
      //we will update the exercise in our db and the page will load it accordingly
      updateExerciseButton.addEventListener('click', function () {
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
// get and populate the exercise list with exercise cards made up of user exercises
// on page refresh
document.addEventListener('DOMContentLoaded', function (e) {
   const exerciseList = document.getElementById('exerciseList');
   fetch('/sessionData', {
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

         if (data.exercises) {

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
      .catch(error => {
         console.error('Error fetching session data:', error);
         //exerciseList.innerHTML = '<p>Error loading exercises. Please try again later.</p>';
      });
});

//logout button
logOutButton.addEventListener('click', function (e) {
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


//update date of last visited date to the gym
updateGymVisitButton.addEventListener('click', function (e) {
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