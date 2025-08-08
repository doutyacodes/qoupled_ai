// utils/helpers.js

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth in format YYYY-MM-DD
 * @returns {number} Age in years
 */
export function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // If birthday hasn't occurred yet this year, subtract 1
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  /**
   * Format date to display in a friendly way
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }