// Navigation JavaScript - Shared utility for all dashboards

document.addEventListener('DOMContentLoaded', function() {
  console.log('Navigation loaded');
  
  // Initialize navigation if nav items exist
  initializeNavigation();
  
  // Initialize logout if logout button exists
  initializeLogout();
});

// Navigation functionality
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const contentSections = document.querySelectorAll('.content-section');
  
  // Handle navigation clicks
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section');
      
      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // Add active class to clicked nav item
      this.classList.add('active');
      
      // Hide all content sections
      contentSections.forEach(section => section.classList.remove('active'));
      
      // Show the corresponding section
      const targetSection = document.getElementById(sectionId + '-section');
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
}

// Logout functionality
function initializeLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Sign out from Firebase
      firebase.auth().signOut().then(() => {
        // Redirect to login page
        window.location.href = 'login.html';
      }).catch((error) => {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
      });
    });
  }
}

// Quick View button functionality
function initializeQuickViewButtons() {
  const quickViewBtns = document.querySelectorAll('.quick-view-btn');
  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const termItem = this.closest('.term-item');
      const season = termItem.querySelector('.term-season')?.textContent || '';
      const employer = termItem.querySelector('.term-employer')?.textContent || '';
      const grade = termItem.querySelector('.term-grade')?.textContent || '';
      
      alert(`Quick View\n\nTerm: ${season}\nEmployer: ${employer}\n${grade}`);
    });
  });
}

// Action buttons functionality
function initializeActionButtons(actionsConfig = {}) {
  const actionBtns = document.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const actionText = this.querySelector('.action-text').textContent;
      
      // Check if there's a custom handler
      if (actionsConfig[actionText]) {
        actionsConfig[actionText]();
      }
    });
  });
}
