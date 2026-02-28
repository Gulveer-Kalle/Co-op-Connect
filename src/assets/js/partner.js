// Partner Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
  console.log('Partner dashboard loaded');
  
  // Quick View buttons functionality
  const quickViewBtns = document.querySelectorAll('.quick-view-btn');
  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const termItem = this.closest('.term-item');
      const name = termItem.querySelector('.term-season').textContent;
      const position = termItem.querySelector('.term-employer').textContent;
      const time = termItem.querySelector('.term-grade').textContent;
      
      alert(`Applicant Details\n\nName: ${name}\nPosition: ${position}\n${time}`);
    });
  });
  
  // Action buttons functionality
  const actionBtns = document.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const actionText = this.querySelector('.action-text').textContent;
      
      switch(actionText) {
        case 'Post New Job':
          alert('Opening job posting form...');
          break;
        case 'Review Applications':
          // Trigger the applications navigation click
          const appsNav = document.querySelector('[data-section="applications"]');
          if (appsNav) appsNav.click();
          break;
        case 'View Reports':
          // Trigger the reports navigation click
          const reportsNav = document.querySelector('[data-section="reports"]');
          if (reportsNav) reportsNav.click();
          break;
        case 'Company Profile':
          // Trigger the settings navigation click
          const settingsNav = document.querySelector('[data-section="settings"]');
          if (settingsNav) settingsNav.click();
          break;
      }
    });
  });
});
