(function () {
  const form = document.getElementById("contactPlanner");

  if (!form) {
    return;
  }

  const nameField = document.getElementById("visitorName");
  const emailField = document.getElementById("visitorEmail");
  const subjectField = document.getElementById("contactSubject");
  const messageField = document.getElementById("contactMessage");
  const recipient = "sugarshack@oryans.ca";

  function buildBody() {
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();

    const lines = [
      "Bonjour à la Sucrerie o'Ryans,",
      "",
      message,
      "",
      `Nom: ${name}`,
      `Courriel: ${email}`
    ];

    return lines.join("\n");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const subject = subjectField.value.trim() || "Message pour la Sucrerie o'Ryans";
    const body = buildBody();
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  });
})();
