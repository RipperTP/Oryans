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
      "Bonjour à la Sucrerie o'Ryans,",
      "",
      name ? `Je m'appelle ${name}. Je vous écris pour ${reason}.` : `Je vous écris pour ${reason}.`,
      week ? `Semaine visée : ${week}.` : "Je suis flexible pour le moment et j'aimerais savoir ce qui vous conviendrait le mieux.",
      "Je sais que c'est une production locale et saisonnière, alors une petite réponse quand vous aurez le temps serait bien appréciée."
    ];

    if (notes) {
      lines.push(`Petite note en plus : ${notes}`);
    }

    lines.push("", "Merci beaucoup.");
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
        copyButton.textContent = "Copié";
        window.setTimeout(() => {
          copyButton.textContent = "Copier le message";
        }, 1600);
      } catch (error) {
        console.error(error);
        copyButton.textContent = "Échec";
        window.setTimeout(() => {
          copyButton.textContent = "Copier le message";
        }, 1600);
      }
    });
  }
})();
