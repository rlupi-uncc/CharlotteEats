document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector(".menu-filters .filter-toggle");
  const filterPanel = document.querySelector(".menu-filters .filter-panel");
  const clearButton = document.querySelector(".menu-filters .clear-all");

  if (toggleButton && filterPanel) {
    toggleButton.addEventListener("click", () => {
      const isOpen = filterPanel.classList.toggle("open");
      toggleButton.setAttribute("aria-expanded", isOpen);
      toggleButton.classList.toggle("active", isOpen);
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      window.location.href = window.location.pathname;
    });
  }
});
