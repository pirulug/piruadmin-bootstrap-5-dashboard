// Spinner
var spinner = function () {
  setTimeout(function () {
    var spinnerElement = document.getElementById("spinner");
    if (spinnerElement) {
      spinnerElement.classList.remove("show");
    }
  }, 1);
};
spinner();
