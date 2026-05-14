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
        const isMobile = window.innerWidth < 768;
        const defaultBottom = 70;
        const finalBottom = 40;
        
        if (footerRect.top < windowHeight) {
          // At the end / Footer visible
          const buttonHeight = backToTopButton.offsetHeight;
          const footerVisibleHeight = windowHeight - footerRect.top;
          const horizontalCenter = footerRect.left + (footerRect.width / 2);
          
          // Position it so only the top half is sticking out from the footer
          const halfMoonBottom = footerVisibleHeight - (buttonHeight / 2);
          
          backToTopButton.style.bottom = `${halfMoonBottom}px`;
          backToTopButton.style.left = `${horizontalCenter}px`;
          backToTopButton.style.right = "auto";
          backToTopButton.style.transform = "translateX(-50%)";
        } else {
          // Normal scrolling
          backToTopButton.style.bottom = `${defaultBottom}px`;
          backToTopButton.style.left = "auto";
          backToTopButton.style.right = "30px";
          backToTopButton.style.transform = "none";
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
