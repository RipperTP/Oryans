(function () {
  const form = document.getElementById("contactPlanner");
  const preview = document.getElementById("contactPreview");
  const copyButton = document.getElementById("copyMessage");

  if (!form || !preview) {
    return;
  }

  const nameField = document.getElementById("visitorName");
  const reasonField = document.getElementById("contactReason");
  const weekField = document.getElementById("contactWeek");
  const notesField = document.getElementById("contactNotes");

  function buildMessage() {
    const name = nameField.value.trim();
    const reason = reasonField.value;
    const week = weekField.value.trim();
    const notes = notesField.value.trim();

    const lines = [
      "Bonjour Sucrerie o'Ryans,",
      "",
      name ? `My name is ${name}. I am reaching out about ${reason}.` : `I am reaching out about ${reason}.`,
      week ? `Preferred timing: ${week}.` : "I am flexible on timing and would love to know what works best for you.",
      "I know your operation is local and seasonal, so a simple update when convenient would be appreciated."
    ];

    if (notes) {
      lines.push(`Extra note: ${notes}`);
    }

    lines.push("", "Thank you.");
    preview.value = lines.join("\n");
  }

  form.addEventListener("input", buildMessage);
  buildMessage();

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      buildMessage();

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(preview.value);
        } else {
          preview.focus();
          preview.select();
          document.execCommand("copy");
        }
        copyButton.textContent = "Copied";
        window.setTimeout(() => {
          copyButton.textContent = "Copy message";
        }, 1600);
      } catch (error) {
        console.error(error);
        copyButton.textContent = "Copy failed";
        window.setTimeout(() => {
          copyButton.textContent = "Copy message";
        }, 1600);
      }
    });
  }
})();
