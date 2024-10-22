// Back to top button
document.addEventListener("DOMContentLoaded", function () {
  const backToTopButton = document.querySelector(".back-to-top");
  if (backToTopButton) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) {
        backToTopButton.style.display = "block";
        backToTopButton.style.transition = "opacity 0.6s";
        backToTopButton.style.opacity = "1";
      } else {
        backToTopButton.style.opacity = "0";
        setTimeout(function () {
          if (window.scrollY <= 300) {
            backToTopButton.style.display = "none";
          }
        }, 600);
      }
    });

    backToTopButton.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
});
