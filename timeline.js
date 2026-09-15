// Timeline: click a city to see only the shows there (click again or "Alle Shows anzeigen" to reset),
// and shows that are still ahead get marked as upcoming.
(() => {
  const shows = [...document.querySelectorAll(".show")];
  if (!shows.length) return;
  const years = [...document.querySelectorAll(".year")];
  const note = document.querySelector(".filter-note");
  const noteCity = note.querySelector(".filter-city");
  let city = null;

  const filter = (next) => {
    city = next === city ? null : next;
    shows.forEach((show) => {
      const match = !city || show.querySelector(".show-city").dataset.city === city;
      show.hidden = !match;
    });
    years.forEach((year) => {
      const visible = [...year.querySelectorAll(".show:not([hidden])")];
      year.hidden = !visible.length;
      visible.forEach((show, k) => { show.dataset.tone = String((k % 5) + 1); });
    });
    document.querySelectorAll(".show-city").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.city === city));
    });
    noteCity.textContent = city ?? "";
    note.hidden = !city;
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".show-city");
    if (button) filter(button.dataset.city);
    else if (event.target.closest(".filter-reset")) filter(null);
  });

  const today = new Date().toISOString().slice(0, 10);
  shows.forEach((show) => {
    if (show.querySelector("time").dateTime >= today) show.classList.add("is-upcoming");
  });
  filter(null);
})();
