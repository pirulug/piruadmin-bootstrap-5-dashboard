// Back to top button
window.addEventListener("scroll", function () {
  if (window.scrollY > 300) {
    document.querySelector(".back-to-top").style.display = "block";
    document.querySelector(".back-to-top").style.transition = "opacity 0.6s";
    document.querySelector(".back-to-top").style.opacity = "1";
  } else {
    document.querySelector(".back-to-top").style.opacity = "0";
    setTimeout(function () {
      if (window.scrollY <= 300) {
        document.querySelector(".back-to-top").style.display = "none";
      }
    }, 600);
  }
});

document.querySelector(".back-to-top").addEventListener("click", function (e) {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
