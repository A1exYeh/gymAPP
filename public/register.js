const registerCard = document.getElementById('registerCard');
if (registerCard) {
   registerCard.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
   const data = Object.fromEntries(formData.entries());
   fetch('/registerAccount', {
      method: 'POST',
      headers: {
         'Content-Type' : 'application/json'
      },
      body: JSON.stringify(data),
      redirect: 'follow',
      credentials: 'same-origin'  
   })
   .then(response => response.json())
   .then(data => {
      if (data.success) {
         alert("Account created successfully. Redirecting to login page...");
         window.location.href =  data.redirect;
      } else {
         alert("Error making account.");
               registerCard.reset();
               console.log("Register failed.", data.message);
      }
   } )
   .catch(error => {
      console.error('Error:', error);
   })
   })
}