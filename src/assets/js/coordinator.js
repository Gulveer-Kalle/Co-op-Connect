// Coordinator Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
  console.log('Coordinator dashboard loaded');
  
  // Action buttons functionality
  const actionBtns = document.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const actionText = this.querySelector('.action-text').textContent;
      
      switch(actionText) {
        case 'Send Announcement':
          alert('Opening announcement form...');
          break;
        case 'Review Applications':
          // Trigger the applications navigation click
          const appsNav = document.querySelector('[data-section="applications"]');
          if (appsNav) appsNav.click();
          break;
        case 'Generate Report':
          alert('Generating report...');
          break;
        case 'Manage Students':
          // Trigger the students navigation click
          const studentsNav = document.querySelector('[data-section="students"]');
          if (studentsNav) studentsNav.click();
          break;
      }
    });
  });
});
