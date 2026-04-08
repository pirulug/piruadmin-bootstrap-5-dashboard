const initializeCodePreview = () => {
  const copyButtons = document.querySelectorAll(".copy-btn");

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.nextElementSibling?.innerText;
      if (!code) return;

      const showCopySuccess = (button) => {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        button.classList.add("copy-success");

        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("copy-success");
        }, 1500);
      };

      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => showCopySuccess(btn)).catch(err => {
          console.error('Failed to copy: ', err);
        });
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          showCopySuccess(btn);
        } catch (e) {
          console.error('Fallback copy failed', e);
        }
        document.body.removeChild(textarea);
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => initializeCodePreview());
