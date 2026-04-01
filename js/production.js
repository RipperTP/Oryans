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
  let activeSeason = seasons.find((season) => season.liters);

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
    return `${new Intl.DateTimeFormat("en-CA", options).format(new Date(`${start}T12:00:00`))} to ${new Intl.DateTimeFormat("en-CA", options).format(new Date(`${end}T12:00:00`))}`;
  }

  function renderDetail(season) {
    activeSeason = season;

    if (!season.liters) {
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
          <span>Total syrup</span>
        </div>
        <div class="detail-metric">
          <strong>${season.days} days</strong>
          <span>Boiling days</span>
        </div>
        <div class="detail-metric">
          <strong>${season.rate.toFixed(1)} L/day</strong>
          <span>Average output</span>
        </div>
      </div>
      <p>Approximate season window: ${formatRange(season.start, season.end)}</p>
    `;
  }

  function renderStats() {
    const knownSeasons = seasons.filter((season) => season.liters);
    const bestVolume = [...knownSeasons].sort((a, b) => b.liters - a.liters)[0];
    const longestSeason = [...knownSeasons].sort((a, b) => b.days - a.days)[0];
    const bestRate = [...knownSeasons].sort((a, b) => b.rate - a.rate)[0];
    const avgLiters = Math.round(knownSeasons.reduce((sum, season) => sum + season.liters, 0) / knownSeasons.length);
    const avgDays = Math.round(knownSeasons.reduce((sum, season) => sum + season.days, 0) / knownSeasons.length);
    const avgRate = knownSeasons.reduce((sum, season) => sum + season.rate, 0) / knownSeasons.length;

    stats.innerHTML = `
      <article class="summary-card reveal is-visible">
        <p class="card-kicker">Best volume</p>
        <h2>${bestVolume.liters} L</h2>
        <p>${bestVolume.year} holds the highest visible total on the poster.</p>
      </article>
      <article class="summary-card reveal is-visible">
        <p class="card-kicker">Longest season</p>
        <h2>${longestSeason.days} days</h2>
        <p>${longestSeason.year} stretches the season longest from late February into April.</p>
      </article>
      <article class="summary-card reveal is-visible">
        <p class="card-kicker">Fastest pace</p>
        <h2>${bestRate.rate.toFixed(1)} L/day</h2>
        <p>${bestRate.year} delivered the highest visible daily output rate.</p>
      </article>
      <article class="summary-card reveal is-visible">
        <p class="card-kicker">Average season</p>
        <h2>${avgLiters} L</h2>
        <p>Across the visible seasons, the average run lasts about ${avgDays} days at ${avgRate.toFixed(1)} L/day.</p>
      </article>
    `;
  }

  function renderChart() {
    chart.innerHTML = seasons.map((season) => {
      if (!season.start || !season.end || !season.liters) {
        return `
          <button class="season-row" type="button" data-year="${season.year}">
            <div class="season-year">${season.year}</div>
            <div class="season-track">
              <div class="season-empty">Production data was not recorded.</div>
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
              <small>${season.days} days</small>
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
