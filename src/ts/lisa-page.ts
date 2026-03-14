(function () {
  const form = document.getElementById("song-form") as HTMLFormElement;
  const textarea = document.getElementById("song-content") as HTMLTextAreaElement;
  const feedback = document.getElementById("feedback") as HTMLDivElement;

  function showFeedback(message: string, success: boolean) {
    feedback.textContent = message;
    feedback.className = `text-sm rounded-xl px-4 py-3 ${
      success
        ? "bg-ctp-green/10 text-ctp-green"
        : "bg-ctp-red/10 text-ctp-red"
    }`;
    feedback.classList.remove("hidden");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = textarea.value.trim();
    if (!content) return;

    const btn = form.querySelector("button[type=submit]") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Saadan...";

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        showFeedback(
          "Aitäh postitamast! Administraatorid vaatavad sinu esituse üle.",
          true,
        );
        textarea.value = "";
      } else {
        showFeedback("Midagi läks valesti. Palun proovi uuesti.", false);
      }
    } catch {
      showFeedback("Võrguühenduse viga. Palun proovi uuesti.", false);
    } finally {
      btn.disabled = false;
      btn.textContent = "Saada";
    }
  });
})();
