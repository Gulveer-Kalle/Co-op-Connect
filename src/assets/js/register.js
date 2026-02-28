// Current selected role
let selectedRole = 'student';

// Role descriptions
const roleDescriptions = {
  student: 'Student member access',
  coordinator: 'Program coordinator access',
  employer: 'Employer partner access'
};

// Select role
function selectRole(role) {

  selectedRole = role;

  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.querySelector(`[data-role="${role}"]`).classList.add('active');

  document.getElementById('roleDescription').textContent = roleDescriptions[role];

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.textContent = `Create Account as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
}

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

  const registerForm = document.getElementById('registerForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {

      e.preventDefault();

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const successMessage = document.getElementById('successMessage');

      // Validate inputs
      if (!firstName || !lastName || !email || !password) {
        alert('Please fill in all fields');
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Validate password
      if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      try {

        // Use global firebase.auth() and firebase.firestore()
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);

        const uid = userCredential.user.uid;

        await firebase.firestore().collection('users').doc(uid).set({
          firstName: firstName,
          lastName: lastName,
          email: email,
          role: selectedRole,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        successMessage.style.display = 'block';
        successMessage.textContent = `✓ Account created successfully as ${selectedRole}!`;

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1000);

      } catch (error) {

        console.error(error);
        alert(error.message);

      }

    });
  }

});
