const initializeTogglePassword = () => {
  const EYE_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path d=\"M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z\"/><path d=\"M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0\"/></svg>";

  const EYE_SLASH_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path d=\"M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a8.6 8.6 0 0 0-2.79.588l.77.771A7 7 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z\"/><path d=\"M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829\"/><path d=\"M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A9 9 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z\"/></svg>";

  const passwordInputs = document.querySelectorAll("input[type=\"password\"][data-pr-toggle-password]");

  passwordInputs.forEach((input) => {
    const mode = input.getAttribute("data-pr-toggle-password") || "icon";
    const isTextMode = mode === "text";

    // Create toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "btn btn-outline-secondary";
    
    if (isTextMode) {
      toggleBtn.textContent = "Show";
    } else {
      toggleBtn.innerHTML = EYE_SVG;
    }

    // Handle DOM wrapping / insertion
    const parent = input.parentElement;
    if (parent && parent.classList.contains("input-group")) {
      parent.appendChild(toggleBtn);
    } else if (parent) {
      const wrapper = document.createElement("div");
      wrapper.className = "input-group";
      parent.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      wrapper.appendChild(toggleBtn);
    }

    // Toggle logic
    toggleBtn.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";
        if (isTextMode) {
          toggleBtn.textContent = "Hide";
        } else {
          toggleBtn.innerHTML = EYE_SLASH_SVG;
        }
      } else {
        input.type = "password";
        if (isTextMode) {
          toggleBtn.textContent = "Show";
        } else {
          toggleBtn.innerHTML = EYE_SVG;
        }
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => initializeTogglePassword());
