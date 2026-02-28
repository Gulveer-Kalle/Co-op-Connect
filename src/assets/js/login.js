// Password visibility toggle
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.querySelector('.toggle-password');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.textContent = 'Hide';
  } else {
    passwordInput.type = 'password';
    toggleBtn.textContent = 'Show';
  }
}

// Form submission
document.addEventListener('DOMContentLoaded', function () {

  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {

      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const successMessage = document.getElementById('successMessage');

      // Validate inputs
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
      }

      try {

        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

        console.log("Logged in user:", userCredential.user);

        // Get the user's ID
        const uid = userCredential.user.uid;

        // Fetch user data from Firestore to get the role
        const userDoc = await firebase.firestore().doc("users/" + uid).get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          const userRole = userData.role;

          console.log("User role:", userRole);

          // Redirect based on user role
          let dashboardUrl = "";
          switch (userRole) {
            case 'student':
              dashboardUrl = "studentDashboard.html";
              break;
            case 'coordinator':
              dashboardUrl = "coordinatorDashboard.html";
              break;
            case 'employer':
              dashboardUrl = "partnerDashboard.html";
              break;
            default:
              dashboardUrl = "studentDashboard.html";
          }

          successMessage.style.display = 'block';
          successMessage.textContent = "Login successful! Redirecting...";

          setTimeout(() => {
            window.location.href = dashboardUrl;
          }, 800);
        } else {
          throw new Error("User data not found. Please contact support.");
        }

      } catch (error) {

        console.error(error);
        alert(error.message);

      }

    });
  }

});
