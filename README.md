# gymAPP #
A website I'm making to let me keep track of my maxes and reps in the gym.

## Frontend ##
- Html
- Css
  - Bootstrap 
## Backend ## 
- JS
- Node.js
  - Express JS
- MongoDB
  - MongoDB Sessions

## Current Features ##
- Login with session implementation
- Add a new exercise with a custom name and initial weight 
- Ability to save:
  - Weights for individual exercises across accounts & update them
  - Date of last gym visit
  - (Technically date of last edit of exercise weight but currently it's not displayed).
- Ability to delete exercises
- Third-party hosting through Render

## Planned Features (NO ETA) ##
- *Currently I don't need to scale this app to commercial use as this is more of a personal project. Increase in demand would result in more/faster features implemented.*
- Registration Feature
- Ability to reorder exercises in the DB
- Login feature to prevent same usernames 
- Ability to recover/change password
- Conversion from LBS to KG
  - Right now you could in theory just change the labels from KG to Lbs depending on user preference but I would like to be able to allow users to convert
- Ability to add a custom image for each exercise with a default icon being chosen otherwise
- Better UI/Sleeker design
- Better error handling and cleaner code structure
- Page where you can store your water count for the day:
  - Get calculations for reccomended daily water count based on user submitted info
  - Allow user to scan barcodes or manually input water values
  - Graphic of a water bottle that would 'fill' as user adds more logs for water consumption
  - Log to let user see their water progress in the past
- Dedicated account page for user to:
  - Change their stats/metrics (maybe used for future features)
  - Delete account
  - Edit account password, username, etc.
  - Notifications
- Make app a PWA (Progressive Web App)
 
