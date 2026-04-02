const initializeTogglePassword = () => {
  const toggleButtons = document.querySelectorAll("[data-pr-toggle-password]");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Find the associated password field
      // Priority 1: Specifically targeted field via ID
      // Priority 2: Closest input in the same input-group
      const targetId = btn.getAttribute("data-pr-toggle-password");
      const input = targetId 
        ? document.getElementById(targetId) 
        : btn.closest(".input-group").querySelector('input[type="password"], input[type="text"]');

      if (input) {
        const icon = btn.querySelector("i");
        
        if (input.type === "password") {
          input.type = "text";
          if (icon) {
            icon.classList.replace("fa-eye", "fa-eye-slash");
          }
        } else {
          input.type = "password";
          if (icon) {
            icon.classList.replace("fa-eye-slash", "fa-eye");
          }
        }
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => initializeTogglePassword());
