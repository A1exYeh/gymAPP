//check for existence of dashboard header to verify that we are in dashboard.html
const dashboard = document.getElementById('dashHeader');
//test variables for user input 
const usernameID = document.getElementById('usernameID');
const lastGymVisit = document.getElementById('lastGymVisit');
const userInput = document.getElementById('userInput');
const addExerciseButton = document.getElementById('addExerciseButton');
const updateGymVisitButton = document.getElementById('addVisitDateButton');
const logOutButton = document.getElementById('logOutButton');
const addExercisePopup = document.getElementById('addExercisePopup');
const addExerciseForm = document.getElementById('addExerciseForm');
const closeExerciseForm = document.getElementById('closeExerciseForm');
const navTogglerLogo = document.getElementById('navTogglerLogo');
let navLogoToggle = false;
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

function deleteExercise(exerciseName) {
   fetch('/deleteExercise', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         exerciseDeleteName: exerciseName //stringify the title of this exercise card as a json
      })
   })
   .then (response => response.json())
   .then (data => {
      console.log(JSON.stringify(data));
      if (data.success) {
         console.log(data.message);
         const exerciseCard = document.querySelector(`#exerciseCard #exerciseTitle[data-name="${exerciseName}"]`).closest('#exerciseCard');
         if (exerciseCard) {
            exerciseCard.remove();
         }
      } else {
         console.log("Error deleting exercise.");
      }
   })
}

//creates and populates an exercise card given an exercise object
function createExerciseCard(exercise) {
   const card = document.createElement('li');
   card.classList.add('list-group-item');
   card.innerHTML = `
      <div id="exerciseCard">
         <h3 id="exerciseTitle" data-name="${exercise.name}">${exercise.name}</h3>
         <div id="exerciseLastWeight">${exercise.lastWeight}<span> LBs</span></div>
         <input type="number" id="newExerciseWeight" placeholder="New weight" min="1">
         <button id="updateExercise">
            <i class="bi bi-arrow-clockwise"></i>
         </button>
         <button id="deleteExercise">
            <i class="bi bi-trash-fill"></i>
         </button>
      </div>
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
            if (newWeight > 0) {
               updateExercise(exercise.name, newWeight);
            } else {
               console.error(`New weight input invalid ${exercise.name}`);
               alert(`New weight for ${exercise.name} must be more than 0.`);
            }
         } else {
            console.error(`New weight input not found for ${exercise.name}`);
         }
      });
   } else {
      console.error(`Update button not found for ${exercise.name}`);
   }

   const deleteExerciseButton = card.querySelector('#deleteExercise');
   if (deleteExerciseButton) {
      //when a user click this update exercise button, if there is a new weight inputted 
      //we will update the exercise in our db and the page will load it accordingly
      deleteExerciseButton.addEventListener('click', function () {
         const exerciseName = card.querySelector('#exerciseTitle');
         if (exerciseName) {
            deleteExercise(exercise.name);
         } else {
            console.error(`Could not get name for: ${exercise.name}`);
         }
      });
   } else {
      console.error(`Delete button not found for ${exercise.name}`);
   }

   return card;
}

function navLogoToggler() {
   if (!navLogoToggle) {
      navTogglerLogo.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"  class="bi bi-list-nested" viewBox="0 0 16 16">' + '<path fill-rule="evenodd" d="M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5"/></svg>';
      navLogoToggle = true;
   } else {
      navTogglerLogo.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"  class="bi bi-list" viewBox="0 0 16 16">' + '<path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/></svg>';
      navLogoToggle = false;
   }
}
// get and populate the exercise list with exercise cards made up of user exercises
// on page refresh
document.addEventListener('DOMContentLoaded', function (e) {
   //set up nav toggler hover
   

   navTogglerLogo.addEventListener('click', function() {
      navLogoToggler();
   });

   //hide our add exercise popup
   addExercisePopup.style.display = 'none';
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
   console.log("Logout button clicked.");
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

//add exercise
addExerciseButton.addEventListener('click', function(e) {
   
   //show the form
   addExercisePopup.style.display = 'block';
   addExercisePopup.style.zIndex = 1;
   addExerciseButton.classList.add('formBlur');
   
});

closeExerciseForm.addEventListener('click', function(e) {
   
   //clear the form
   addExerciseForm.reset();
   //hide the form
   addExercisePopup.style.display = 'none';
   addExerciseButton.classList.remove('formBlur');
   
});

addExerciseForm.addEventListener('submit', function(e) {
   e.preventDefault();
   const exerciseAddName = document.getElementById('exerciseName').value;
   const exerciseAddWeight = document.getElementById('exerciseWeight').value;
   fetch('/addExercise', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         exerciseAddName: exerciseAddName,
         exerciseAddWeight: exerciseAddWeight
      })
   })
   .then(response => response.json())
   .then(data => {
      if (data.success) {
         //debug log
         console.log('Exercise added successfully');
         //call our createExerciseCard to make a card for the new exercise
         const exerciseCard = createExerciseCard(data.exercise);
         //append it to our exercise list 
         document.getElementById('exerciseList').appendChild(exerciseCard);
         //hide the form
         addExercisePopup.style.display = 'none';
         //reset the form fields
         addExerciseForm.reset();
      } else {
         console.log ('Failed to add exercise to profile.');
      }
   })
   .catch(error => {
      console.log("Error appending exercise: ", error);
   });
});

//update date of last visited date to the gym
updateGymVisitButton.addEventListener('click', function (e) {
   e.preventDefault();
   const newVisitDate = new Date();
   //const savedInputElement = document.getElementById('savedInput');

   fetch('/saveGymVisit', {
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
         console.log("Error in saving gym visit input: ", error);
      });
});