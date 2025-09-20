// Client-side form handling utilities for schedule pages

// Handle days of week checkbox changes
export function initializeDaysOfWeekHandler(): void {
  document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.daysOfWeekCheckbox') as NodeListOf<HTMLInputElement>;
    const hiddenInput = document.getElementById('daysOfWeekJson') as HTMLInputElement;
    
    function updateDaysOfWeek(): void {
      const selectedDays = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => parseInt(checkbox.value));
      
      if (hiddenInput) {
        hiddenInput.value = JSON.stringify(selectedDays);
      }
    }
    
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateDaysOfWeek);
    });
    
    // Initialize on page load
    updateDaysOfWeek();
  });
}
