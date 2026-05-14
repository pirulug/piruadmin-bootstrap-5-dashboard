// Back to top button with progress circle and smart positioning
document.addEventListener("DOMContentLoaded", function () {
  const backToTopButton = document.querySelector(".back-to-top");
  const progressBar = document.querySelector(".back-to-top-progress-bar");

  if (backToTopButton && progressBar) {
    // Initial setup for the progress circle
    const radius = progressBar.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressBar.style.strokeDasharray = `${circumference} ${circumference}`;
    progressBar.style.strokeDashoffset = circumference;

    const updateBackToTop = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      
      // Update progress bar
      const offset = circumference - (progress / 100) * circumference;
      progressBar.style.strokeDashoffset = offset;

      // Show/hide button
      if (scrollTop > 300) {
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.classList.remove("show");
      }

      // Smart positioning to avoid overlapping with footer or sticky elements
      const footer = document.querySelector("footer.footer") || document.querySelector(".sticky-bottom");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const defaultBottom = 30;
        
        if (footerRect.top < windowHeight) {
          // Footer is visible, push button up
          const footerVisibleHeight = windowHeight - footerRect.top;
          backToTopButton.style.bottom = `${footerVisibleHeight + defaultBottom}px`;
        } else {
          backToTopButton.style.bottom = `${defaultBottom}px`;
        }
      }
    };

    window.addEventListener("scroll", updateBackToTop);
    window.addEventListener("resize", updateBackToTop);
    
    // Run once on load
    updateBackToTop();

    backToTopButton.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
});
