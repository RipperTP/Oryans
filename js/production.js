(function () {
  const chart = document.getElementById("seasonChart");
  const detailBody = document.getElementById("seasonDetailBody");
  const stats = document.getElementById("productionStats");

  if (!chart || !detailBody || !stats || !window.oryansData) {
    return;
  }

  const seasons = window.oryansData.productionSeasons.map((season) => ({
    ...season,
    rate: season.liters && season.days ? season.liters / season.days : null
  }));

  const seasonStartMonth = 2;
  const seasonStartDay = 15;
  const totalSeasonDays = 75;
  const currentYear = new Date().getFullYear();
  const currentSeason = seasons.find((season) => season.year === currentYear);
  const latestSeasonWithVolume = [...seasons].reverse().find((season) => season.liters);
  let activeSeason =
    (currentSeason && currentSeason.liters ? currentSeason : null) ||
    latestSeasonWithVolume ||
    seasons[0];

  function dayIndex(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    const base = new Date(`${date.getFullYear()}-${String(seasonStartMonth).padStart(2, "0")}-${String(seasonStartDay).padStart(2, "0")}T12:00:00`);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.round((date - base) / millisecondsPerDay);
  }

  function volumeRange() {
    const values = seasons.map((season) => season.liters).filter((value) => typeof value === "number");
    return { min: Math.min(...values), max: Math.max(...values) };
  }

  const litersRange = volumeRange();

  function volumeStrength(value) {
    if (typeof value !== "number") {
      return 0.18;
    }

    const { min, max } = litersRange;
    if (min === max) {
      return 0.65;
    }

    return (value - min) / (max - min);
  }

  function formatRange(start, end) {
    const options = { month: "short", day: "numeric" };
    const formatter = new Intl.DateTimeFormat("fr-CA", options);
    return `${formatter.format(new Date(`${start}T12:00:00`))} au ${formatter.format(new Date(`${end}T12:00:00`))}`;
  }

  function renderDetail(season) {
    activeSeason = season;

    if (!season.liters) {
      if (season.statusLabel) {
        detailBody.innerHTML = `
          <h3>${season.year}</h3>
          <p><strong>${season.statusLabel}</strong></p>
          <p>${season.note}</p>
          <div class="detail-summary-grid">
            <div class="detail-metric">
              <strong>--</strong>
              <span>Total de sirop</span>
            </div>
            <div class="detail-metric">
              <strong>--</strong>
              <span>Jours de bouillage</span>
            </div>
            <div class="detail-metric">
              <strong>À suivre</strong>
              <span>Rythme moyen</span>
            </div>
          </div>
          <p>Fenêtre approximative : à confirmer.</p>
        `;
        return;
      }

      detailBody.innerHTML = `
        <h3>${season.year}</h3>
        <p>${season.note}</p>
      `;
      return;
    }

    detailBody.innerHTML = `
      <h3>${season.year}</h3>
      <p>${season.note}</p>
      <div class="detail-summary-grid">
        <div class="detail-metric">
          <strong>${season.liters} L</strong>
          <span>Total de sirop</span>
        </div>
        <div class="detail-metric">
          <strong>${season.days} jours</strong>
          <span>Jours de bouillage</span>
        </div>
        <div class="detail-metric">
          <strong>${season.rate.toFixed(1)} L/jour</strong>
          <span>Rythme moyen</span>
        </div>
      </div>
      <p>Fenêtre approximative : ${formatRange(season.start, season.end)}</p>
    `;
  }

  function renderStats() {
    const knownSeasons = seasons.filter((season) => season.liters);
    const bestVolume = [...knownSeasons].sort((a, b) => b.liters - a.liters)[0];
    const longestSeason = [...knownSeasons].sort((a, b) => b.days - a.days)[0];
    const bestRate = [...knownSeasons].sort((a, b) => b.rate - a.rate)[0];

    stats.innerHTML = `
      <article class="summary-card reveal is-visible">
        <p class="card-kicker">Meilleur volume</p>
        <h2>${bestVolume.liters} L</h2>
        <p>${bestVolume.year} affiche le plus gros total visible sur l'affiche.</p>
      </article>
      <article class="summary-card reveal is-visible">
        <p class="card-kicker">Saison la plus longue</p>
        <h2>${longestSeason.days} jours</h2>
        <p>${longestSeason.year} étire la saison le plus longtemps, de la fin février jusqu'en avril.</p>
      </article>
      <article class="summary-card reveal is-visible">
        <p class="card-kicker">Meilleur rythme</p>
        <h2>${bestRate.rate.toFixed(1)} L/jour</h2>
        <p>${bestRate.year} a donné le meilleur rendement quotidien visible.</p>
      </article>
    `;
  }

  function renderChart() {
    chart.innerHTML = seasons.map((season) => {
      if (!season.start || !season.end || !season.liters) {
        const emptyLabel = season.statusLabel || "Aucune donnée de production notée.";
        const emptyClass = season.statusLabel ? "season-empty is-in-progress" : "season-empty";
        return `
          <button class="season-row" type="button" data-year="${season.year}">
            <div class="season-year">${season.year}</div>
            <div class="season-track">
              <div class="${emptyClass}">${emptyLabel}</div>
            </div>
          </button>
        `;
      }

      const startIndex = dayIndex(season.start);
      const endIndex = dayIndex(season.end);
      const width = Math.max(6, ((endIndex - startIndex + 1) / totalSeasonDays) * 100);
      const left = (startIndex / totalSeasonDays) * 100;
      const strength = volumeStrength(season.liters);

      return `
        <button class="season-row" type="button" data-year="${season.year}">
          <div class="season-year">${season.year}</div>
          <div class="season-track">
            <div class="season-span" style="--start:${left.toFixed(2)}; --width:${width.toFixed(2)}; --strength:${strength.toFixed(3)};">
              <strong>${season.liters} L</strong>
              <small>${season.days} jours</small>
            </div>
          </div>
        </button>
      `;
    }).join("");

    chart.querySelectorAll(".season-row").forEach((row) => {
      row.classList.toggle("is-active", Number(row.dataset.year) === activeSeason.year);
      row.addEventListener("click", () => {
        const nextSeason = seasons.find((season) => season.year === Number(row.dataset.year));
        if (nextSeason) {
          renderDetail(nextSeason);
          chart.querySelectorAll(".season-row").forEach((node) => {
            node.classList.toggle("is-active", node === row);
          });
        }
      });
    });
  }

  renderStats();
  renderChart();
  renderDetail(activeSeason);
})();
