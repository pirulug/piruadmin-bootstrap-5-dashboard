// Usage: https://github.com/Grsmto/simplebar
import SimpleBar from "simplebar";

if (document.getElementsByClassName("js-simplebar")[0]) {
  const initialize = () => {
    initializeSimplebar();
    initializeSidebarCollapse();
  };

  const initializeSimplebar = () => {
    const simplebarElement = document.getElementsByClassName("js-simplebar")[0];
    const simplebarInstance = new SimpleBar(simplebarElement);

    /* Recalculate simplebar on sidebar dropdown toggle */
    const sidebarDropdowns = document.querySelectorAll(
      ".js-sidebar [data-bs-parent]"
    );

    sidebarDropdowns.forEach((link) => {
      link.addEventListener("shown.bs.collapse", () => {
        simplebarInstance.recalculate();
      });
      link.addEventListener("hidden.bs.collapse", () => {
        simplebarInstance.recalculate();
      });
    });

    /* Scroll to active element if exists */
    const activeItem = simplebarElement.querySelectorAll(".sidebar-item.active");
    if (activeItem.length) {
      const lastActiveItem = activeItem[activeItem.length - 1];
      const scrollElement = simplebarInstance.getScrollElement();

      // Use requestAnimationFrame to ensure the DOM is rendered and SimpleBar is ready
      requestAnimationFrame(() => {
        // Calculate the position of the active item relative to the scroll container
        const targetTop =
          lastActiveItem.offsetTop -
          scrollElement.clientHeight / 2 +
          lastActiveItem.clientHeight / 2;

        // Perform smooth scroll only on the sidebar container
        scrollElement.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
      });
    }
  };

  const initializeSidebarCollapse = () => {
    const sidebarElement = document.getElementsByClassName("js-sidebar")[0];
    const sidebarToggleElement =
      document.getElementsByClassName("js-sidebar-toggle")[0];

    sidebarToggleElement.addEventListener("click", () => {
      sidebarElement.classList.toggle("collapsed");

      sidebarElement.addEventListener("transitionend", () => {
        window.dispatchEvent(new Event("resize"));
      });
    });
  };

  // Wait until page is loaded
  document.addEventListener("DOMContentLoaded", () => initialize());
}
