const spinner = function () {
  const spinnerElement = document.getElementById("spinner");

  if (!spinnerElement) return;

  let isHidden = false;

  const hideLoader = () => {
    if (isHidden) return;
    isHidden = true;

    setTimeout(() => {
      spinnerElement.classList.remove("show");

      setTimeout(() => {
        spinnerElement.remove();
      }, 500);
    }, 300);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
    // Fallback por si algún recurso externo retrasa o bloquea el evento load
    setTimeout(hideLoader, 3000);
  }
};

spinner();