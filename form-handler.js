/* ============================================================
   UNIVERSAL FIREBASE FORM HANDLER
   ------------------------------------------------------------
   Any <form data-firebase-collection="someName"> on the site is
   automatically wired up by this script - no extra JS needed
   per page. It:
     - collects every field with a "name" attribute
     - saves them to the named Firestore collection
     - shows a status message in an element with class="form-status"
       inside the same form (optional)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form[data-firebase-collection]");

  forms.forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const collectionName = form.getAttribute("data-firebase-collection");
      const statusEl = form.querySelector(".form-status");
      const submitBtn = form.querySelector("button[type='submit'], button:not([type])");

      const data = {};
      form.querySelectorAll("[name]").forEach(field => {
        data[field.name] = field.value;
      });

      data.submittedAt = firebase.firestore.FieldValue.serverTimestamp();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
      }

      db.collection(collectionName).add(data)
        .then(() => {
          setStatus(statusEl, "Thank you! Your message has been sent.", false);
          form.reset();
        })
        .catch(err => {
          setStatus(statusEl, "Something went wrong: " + err.message, true);
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || "Submit";
          }
        });
    });
  });

  function setStatus(el, text, isError) {
    if (!el) { alert(text); return; }
    el.textContent = text;
    el.style.color = isError ? "#9D4022" : "#1A7A34";
  }
});
