// Full Screen Module
document.addEventListener("DOMContentLoaded", function () {
  const fullscreenBtn = document.getElementById("fullscreen-btn");

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", function (e) {
      e.preventDefault();
      
      const icon = this.querySelector("i");
      
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          if (icon) {
            icon.classList.remove("bi-fullscreen");
            icon.classList.add("bi-fullscreen-exit");
          }
        }).catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            if (icon) {
              icon.classList.remove("bi-fullscreen-exit");
              icon.classList.add("bi-fullscreen");
            }
          });
        }
      }
    });

    // Handle ESC key or other ways of exiting fullscreen
    document.addEventListener("fullscreenchange", () => {
      const icon = fullscreenBtn.querySelector("i");
      if (!document.fullscreenElement) {
        if (icon) {
          icon.classList.remove("bi-fullscreen-exit");
          icon.classList.add("bi-fullscreen");
        }
      }
    });
  }
});
