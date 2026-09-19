(() => {
  const filterRoot = document.querySelector("[data-sync-filters]");
  const list = document.querySelector(".sync-mapping-list");
  if (filterRoot && list) {
    const cards = [...list.querySelectorAll("[data-sync-state]")];
    const empty = list.querySelector("[data-sync-filter-empty]");

    const applyFilter = (filter) => {
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.syncState === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      filterRoot.querySelectorAll("[data-filter]").forEach((button) => {
        button.classList.toggle("active", button.dataset.filter === filter);
      });
      if (empty) empty.hidden = visible !== 0;
    };

    filterRoot.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => applyFilter(button.dataset.filter || "all"));
    });

    applyFilter(list.dataset.defaultFilter || "all");
  }

  document.querySelectorAll("[data-mapping-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".sync-mapping-card");
      const editor = card?.querySelector(".sync-mapping-editor");
      if (!editor) return;
      const nextOpen = editor.hidden;
      editor.hidden = !nextOpen;
      button.setAttribute("aria-expanded", String(nextOpen));
      button.textContent = nextOpen ? "Close" : (card.classList.contains("needs-review") ? "Resolve" : "Review");
    });
  });

  document.querySelectorAll("[data-candidate-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".sync-mapping-card");
      const select = card?.querySelector('select[name="public_id"]');
      if (!select) return;
      select.value = button.dataset.candidateId || "";
      select.focus();
    });
  });

  const params = new URLSearchParams(window.location.search);
  const focus = params.get("focus");
  if (focus) {
    const target = document.getElementById(`mapping-${focus}`);
    if (target) {
      target.hidden = false;
      const editor = target.querySelector(".sync-mapping-editor");
      const toggle = target.querySelector("[data-mapping-toggle]");
      if (editor) editor.hidden = false;
      if (toggle) {
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "Close";
      }
      requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  }
})();
