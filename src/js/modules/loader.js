var spinner = function () {

  var spinnerElement = document.getElementById("spinner");

  if (!spinnerElement) return;

  window.addEventListener('load', function() {
    setTimeout(function () {
      spinnerElement.classList.remove("show");
      
      setTimeout(function() {
        spinnerElement.remove();
      }, 500);
    }, 500);
  });
};

spinner();