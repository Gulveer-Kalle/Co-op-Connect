// Student Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
  console.log('Student dashboard loaded');
  
  // Initialize quick view buttons
  const quickViewBtns = document.querySelectorAll('.quick-view-btn');
  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const termItem = this.closest('.term-item');
      const season = termItem.querySelector('.term-season').textContent;
      const employer = termItem.querySelector('.term-employer').textContent;
      const grade = termItem.querySelector('.term-grade').textContent;
      
      alert(`Quick View\n\nTerm: ${season}\nEmployer: ${employer}\n${grade}`);
    });
  });
  
  // Action buttons functionality
  const actionBtns = document.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const actionText = this.querySelector('.action-text').textContent;
      
      switch(actionText) {
        case 'Contact Coordinator':
          alert('Opening email to contact coordinator...');
          break;
        case 'Upload Report':
          alert('Upload report functionality will be implemented here.');
          break;
        case 'View Applications':
          // Trigger the applications navigation click
          const appsNav = document.querySelector('[data-section="applications"]');
          if (appsNav) appsNav.click();
          break;
        case 'Update Profile':
          // Trigger the profile navigation click
          const profileNav = document.querySelector('[data-section="profile"]');
          if (profileNav) profileNav.click();
          break;
      }
    });
  });
});
