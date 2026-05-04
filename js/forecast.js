(function () {
  const app = document.getElementById("forecastApp");
  const status = document.getElementById("forecastStatus");
  const grid = document.getElementById("forecastGrid");
  const refreshButton = document.getElementById("refreshForecast");
  const selectedSummary = document.getElementById("selectedDaySummary");
  const selectedNotes = document.getElementById("selectedDayNotes");
  const seasonEndSummary = document.getElementById("seasonEndSummary");
  const seasonEndNotes = document.getElementById("seasonEndNotes");
  const tomorrowHeadline = document.getElementById("tomorrowHeadline");
  const tomorrowDetail = document.getElementById("tomorrowDetail");
  const bestHeadline = document.getElementById("bestHeadline");
  const bestDetail = document.getElementById("bestDetail");
  const weekHeadline = document.getElementById("weekHeadline");
  const weekDetail = document.getElementById("weekDetail");
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  if (!app || !status || !grid || !window.oryansData) {
    return;
  }

  let selectedDay = null;

  const weatherLabels = {
    0: "Dégagé",
    1: "Surtout dégagé",
    2: "Partiellement nuageux",
    3: "Nuageux",
    45: "Brouillard",
    48: "Brouillard givrant",
    51: "Bruine légère",
    53: "Bruine",
    55: "Bruine forte",
    61: "Pluie",
    63: "Pluie",
    65: "Forte pluie",
    71: "Neige",
    73: "Neige",
    75: "Forte neige",
    80: "Averses",
    81: "Averses",
    82: "Fortes averses",
    85: "Averses de neige",
    86: "Fortes averses de neige",
    95: "Orage"
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function parseDate(dateString) {
    return new Date(`${dateString}T12:00:00`);
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function formatMonthDay(date) {
    return new Intl.DateTimeFormat("fr-CA", { month: "short", day: "numeric" }).format(date);
  }

  function formatLongDate(date) {
    return new Intl.DateTimeFormat("fr-CA", { month: "long", day: "numeric" }).format(date);
  }

  function formatDateLabel(dateString) {
    const date = parseDate(dateString);
    return {
      day: new Intl.DateTimeFormat("fr-CA", { weekday: "short" }).format(date),
      short: formatMonthDay(date)
    };
  }

  function isClassicCycle(day) {
    return day.min <= 0 && day.max >= 3 && day.max <= 10;
  }

  function getSeasonWeight(dateString) {
    const date = parseDate(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (month === 3) {
      return { score: 16, note: "En plein cœur du temps des sucres." };
    }

    if (month === 2 && day >= 20) {
      return { score: 10, note: "Un peu tôt, mais ça reste plausible pour la saison." };
    }

    if (month === 4 && day <= 15) {
      return { score: 8, note: "La fin de saison est encore dans le coup." };
    }

    return { score: -12, note: "En dehors de la fenêtre la plus fiable pour la coulée." };
  }

  function getCategory(score) {
    if (score >= 78) {
      return { key: "excellent", label: "Excellente coulée", summary: "très favorable à la coulée" };
    }
    if (score >= 60) {
      return { key: "promising", label: "Belle fenêtre", summary: "plutôt favorable à la coulée" };
    }
    if (score >= 40) {
      return { key: "fair", label: "Potentiel moyen", summary: "correct pour une petite coulée" };
    }
    return { key: "quiet", label: "Rien ne se passe", summary: "aucune condition favorable pour la coulée" };
  }

  function dayOfSeason(dateString) {
    const date = parseDate(dateString);
    const base = new Date(`${date.getFullYear()}-02-15T12:00:00`);
    return Math.round((date - base) / millisecondsPerDay);
  }

  function seasonDateFromIndex(year, index) {
    const base = new Date(`${year}-02-15T12:00:00`);
    return addDays(base, index);
  }

  function scoreDay(day, index, allDays) {
    const notes = [];
    let score = 10;
    const swing = day.max - day.min;
    const sunshineHours = day.sunshine / 3600;
    const season = getSeasonWeight(day.date);

    score += season.score;
    notes.push(season.note);

    if (day.min <= -1 && day.min >= -8) {
      score += 24;
      notes.push("La nuit descend franchement sous zéro.");
    } else if (day.min <= 1) {
      score += 12;
      notes.push("Une nuit près de zéro peut quand même aider le changement de pression.");
    } else {
      score -= 18;
      notes.push("Une nuit trop douce casse le cycle gel-dégel.");
    }

    if (day.max >= 3 && day.max <= 8) {
      score += 26;
      notes.push("La chaleur du jour tombe dans la zone idéale pour une bonne coulée.");
    } else if (day.max > 0 && day.max <= 12) {
      score += 16;
      notes.push("Le dégel du jour devrait quand même faire bouger l'eau d'érable.");
    } else if (day.max > 12 && day.max <= 18) {
      score += 4;
      notes.push("Un après-midi trop doux peut raccourcir la meilleure fenêtre de coulée.");
    } else {
      score -= 12;
      notes.push("Il fait trop froid dans le jour pour un vrai dégel.");
    }

    if (swing >= 5 && swing <= 13) {
      score += 12;
      notes.push("Bon écart de température entre la nuit et le jour.");
    } else if (swing >= 3) {
      score += 6;
    } else {
      score -= 6;
      notes.push("Le petit écart de température limite le changement de pression.");
    }

    if (sunshineHours >= 5) {
      score += 8;
      notes.push("Le soleil devrait aider à réchauffer les troncs et la tubulure.");
    } else if (sunshineHours >= 2) {
      score += 4;
    } else {
      score -= 2;
    }

    if (day.precip >= 0.5 && day.precip <= 8) {
      score += 4;
      notes.push("L'humidité récente peut aider les arbres à rester bien chargés.");
    } else if (day.precip > 15) {
      score -= 3;
      notes.push("De grosses précipitations peuvent rendre la collecte plus compliquée.");
    }

    if (day.wind > 35) {
      score -= 7;
      notes.push("Le gros vent peut refroidir les arbres et compliquer la collecte.");
    } else if (day.wind < 20) {
      score += 2;
    }

    const neighborDays = [allDays[index - 1], allDays[index + 1]].filter(Boolean);
    if (neighborDays.some(isClassicCycle)) {
      score += 5;
      notes.push("La journée voisine soutient elle aussi un bon rythme de gel-dégel.");
    }

    const finalScore = clamp(Math.round(score), 0, 100);
    return {
      ...day,
      swing,
      sunshineHours,
      score: finalScore,
      category: getCategory(finalScore),
      notes
    };
  }

  function setStatus(message) {
    status.textContent = message;
    status.classList.remove("is-hidden");
  }

  function renderSummary(days) {
    const tomorrow = days[1] || days[0];
    const bestDay = [...days].sort((a, b) => b.score - a.score)[0];
    const promisingDays = days.filter((day) => day.score >= 60).length;
    const weekAverage = Math.round(days.reduce((sum, day) => sum + day.score, 0) / days.length);
    const tomorrowLabel = formatDateLabel(tomorrow.date);
    const bestLabel = formatDateLabel(bestDay.date);
    const strongDayLabel = promisingDays === 1 ? "bonne journée" : "bonnes journées";

    tomorrowHeadline.textContent = `${tomorrow.score}/100`;
    tomorrowDetail.textContent = `${tomorrowLabel.day} ${tomorrowLabel.short} s'annonce ${tomorrow.category.summary}.`;

    bestHeadline.textContent = `${bestLabel.short}`;
    bestDetail.textContent = `${bestDay.category.label} avec un score de ${bestDay.score}/100.`;

    weekHeadline.textContent = `${promisingDays} ${strongDayLabel}`;
    weekDetail.textContent = `Moyenne des six prochains jours : ${weekAverage}/100.`;
  }

  function renderSelectedDay(day) {
    selectedDay = day;
    const label = formatDateLabel(day.date);

    selectedSummary.innerHTML = `
      <h3>${day.category.label}</h3>
      <p>À Embrun, ${label.day} ${label.short} obtient <strong>${day.score}/100</strong>.</p>
      <div class="detail-summary-grid">
        <div class="detail-metric">
          <strong>${day.max.toFixed(1)} C</strong>
          <span>Maximum</span>
        </div>
        <div class="detail-metric">
          <strong>${day.min.toFixed(1)} C</strong>
          <span>Minimum de nuit</span>
        </div>
        <div class="detail-metric">
          <strong>${day.sunshineHours.toFixed(1)} h</strong>
          <span>Ensoleillement</span>
        </div>
      </div>
    `;

    selectedNotes.innerHTML = day.notes.slice(0, 5).map((note) => `<li>${note}</li>`).join("");

    grid.querySelectorAll(".day-card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.date === day.date);
    });
  }

  function renderSeasonEndEstimate(days) {
    if (!seasonEndSummary || !seasonEndNotes || !window.oryansData.productionSeasons?.length) {
      return;
    }

    const history = window.oryansData.productionSeasons
      .filter((season) => season.end)
      .sort((left, right) => left.year - right.year);

    if (!history.length) {
      seasonEndSummary.innerHTML = `
        <h3>Estimation indisponible</h3>
        <p>Il manque encore assez d'historique pour proposer une fin de saison crédible.</p>
      `;
      seasonEndNotes.innerHTML = "";
      return;
    }

    // Check if we're significantly past the typical season end window
    const referenceDay = parseDate(days[0].date);
    const referenceYear = referenceDay.getFullYear();
    const currentIndex = dayOfSeason(days[0].date);

    const historyEndIndices = history.map((season) => dayOfSeason(season.end));
    const maxHistoricalIndex = Math.max(...historyEndIndices);
    const avgHistoricalIndex = Math.round(average(historyEndIndices));

    // If we're more than 14 days past the latest historical end date, season is likely over
    if (currentIndex > maxHistoricalIndex + 14) {
      const latestEndDate = history.reduce((latest, season) => {
        const seasonDate = parseDate(season.end);
        return seasonDate > latest ? seasonDate : latest;
      }, new Date(0));

      const latestLabel = formatLongDate(latestEndDate);
      const avgLabel = formatMonthDay(seasonDateFromIndex(referenceYear - 1, avgHistoricalIndex));

      seasonEndSummary.innerHTML = `
        <h3>La saison est terminée</h3>
        <p>Nous sommes le ${formatLongDate(referenceDay)}, bien après le ${formatLongDate(latestEndDate)}, la fin la plus tardive enregistrée. Les conditions ne soutiennent plus la coulée.</p>
        <div class="detail-summary-grid">
          <div class="detail-metric">
            <strong>${formatMonthDay(latestEndDate)}</strong>
            <span>fin la plus tardive</span>
          </div>
          <div class="detail-metric">
            <strong>${avgLabel}</strong>
            <span>moyenne historique</span>
          </div>
          <div class="detail-metric">
            <strong>${history.length}</strong>
            <span>saisons historiques</span>
          </div>
        </div>
      `;

      const notes = [
        `L'historique montre que les saisons finissent généralement entre le ${formatMonthDay(seasonDateFromIndex(referenceYear - 1, Math.min(...historyEndIndices)))} et le ${latestLabel}.`,
        `La saison 2026 ne montre pas les conditions de gel-dégel nécessaires pour continuer à couler.`,
        `Pour actualiser les données de fin de saison 2026, mettez à jour la section données de production avec la date exacte.`
      ];

      seasonEndNotes.innerHTML = notes.map((note) => `<li>${note}</li>`).join("");
      return;
    }

    const historyWithWeights = history.map((season, index) => {
      const endIndex = dayOfSeason(season.end);
      const recencyWeight = 1 + index / history.length;
      const productionWeight = season.liters ? clamp(season.liters / 600, 0.75, 1.35) : 1;
      return {
        ...season,
        endIndex,
        weight: recencyWeight * productionWeight
      };
    });

    const weightedAverageIndex = Math.round(
      historyWithWeights.reduce((sum, season) => sum + season.endIndex * season.weight, 0) /
      historyWithWeights.reduce((sum, season) => sum + season.weight, 0)
    );

    const recentHistory = historyWithWeights.slice(-4);
    const recentAverageIndex = Math.round(average(recentHistory.map((season) => season.endIndex)));
    const earliestIndex = Math.min(...historyWithWeights.map((season) => season.endIndex));
    const latestIndex = Math.max(...historyWithWeights.map((season) => season.endIndex));
    const classicCycles = days.filter(isClassicCycle).length;
    const promisingDays = days.filter((day) => day.score >= 60).length;
    const quietDays = days.filter((day) => day.score < 40).length;
    const warmNights = days.filter((day) => day.min > 2).length;
    const hotDays = days.filter((day) => day.max > 15).length;
    const coldDays = days.filter((day) => day.max <= 0).length;
    const weekAverageScore = Math.round(average(days.map((day) => day.score)));
    const lastSupportiveIndex = days.reduce((lastIndex, day, index) => (
      day.score >= 60 || isClassicCycle(day) ? index : lastIndex
    ), -1);

    let adjustment = 0;
    adjustment += Math.round((recentAverageIndex - weightedAverageIndex) * 0.25);
    adjustment += classicCycles;
    adjustment += Math.max(0, promisingDays - 1);
    adjustment -= Math.round(warmNights * 1.1);
    adjustment -= hotDays * 2;
    adjustment -= coldDays;
    adjustment -= Math.max(0, quietDays - 2);

    if (lastSupportiveIndex >= days.length - 2) {
      adjustment += 2;
    }

    if (lastSupportiveIndex === -1) {
      adjustment -= 2;
    }

    adjustment = clamp(adjustment, -7, 8);

    const estimateCeiling = Math.max(latestIndex + 8, currentIndex + 1);
    const estimatedIndex = clamp(
      Math.round(weightedAverageIndex + adjustment),
      currentIndex + 1,
      estimateCeiling
    );

    const estimatedDate = seasonDateFromIndex(referenceYear, estimatedIndex);
    const averageDate = seasonDateFromIndex(referenceYear, weightedAverageIndex);
    const recentAverageDate = seasonDateFromIndex(referenceYear, recentAverageIndex);
    const earliestDate = seasonDateFromIndex(referenceYear, earliestIndex);
    const latestDate = seasonDateFromIndex(referenceYear, latestIndex);
    const remainingDays = Math.max(1, Math.round((estimatedDate - referenceDay) / millisecondsPerDay));
    const supportiveLabel = lastSupportiveIndex >= 0 ? formatDateLabel(days[lastSupportiveIndex].date) : null;

    const confidence = clamp(
      64 +
        classicCycles * 4 +
        promisingDays * 3 -
        warmNights * 6 -
        hotDays * 7 -
        Math.max(0, currentIndex - weightedAverageIndex) * 2,
      38,
      88
    );

    seasonEndSummary.innerHTML = `
      <h3>Vers le ${formatLongDate(estimatedDate)}</h3>
      <p>En combinant la météo des six prochains jours et l'historique de production, la saison semble pouvoir s'étirer jusque <strong>${formatLongDate(estimatedDate)}</strong>.</p>
      <div class="detail-summary-grid">
        <div class="detail-metric">
          <strong>${remainingDays} j</strong>
          <span>reste estimé</span>
        </div>
        <div class="detail-metric">
          <strong>${confidence}/100</strong>
          <span>confiance</span>
        </div>
        <div class="detail-metric">
          <strong>${formatMonthDay(recentAverageDate)}</strong>
          <span>repère récent</span>
        </div>
      </div>
    `;

    const notes = [
      `L'historique visible finit entre ${formatMonthDay(earliestDate)} et ${formatMonthDay(latestDate)}, avec une moyenne pondérée autour du ${formatMonthDay(averageDate)}.`,
      classicCycles
        ? `${classicCycles} journée(s) gardent un vrai cycle gel-dégel dans la prévision, ce qui repousse un peu la fin.`
        : "Le gel-dégel devient rare dans la prévision, ce qui rapproche la fin de saison.",
      warmNights || hotDays
        ? `Les nuits trop douces et les pointes plus chaudes tirent l'estimation vers l'avant sur les ${days.length} prochains jours.`
        : "Aucune grosse poussée de chaleur n'apparaît pour l'instant, donc la saison garde encore un peu d'air.",
      supportiveLabel
        ? `Le dernier bloc vraiment encourageant ressort autour de ${supportiveLabel.day} ${supportiveLabel.short}, avec une semaine qui tourne près de ${weekAverageScore}/100.`
        : `La semaine tourne autour de ${weekAverageScore}/100, sans vraie fenêtre forte pour prolonger beaucoup plus loin.`
    ];

    seasonEndNotes.innerHTML = notes.map((note) => `<li>${note}</li>`).join("");
  }

  function renderForecast(days) {
    grid.innerHTML = days.map((day) => {
      const label = formatDateLabel(day.date);
      return `
        <button class="day-card" type="button" data-date="${day.date}">
          <div class="day-card-top">
            <div>
              <div class="day-name">${label.day}</div>
              <div class="day-date">${label.short}</div>
            </div>
            <span class="score-chip is-${day.category.key}">${day.score}</span>
          </div>
          <div class="day-card-bottom">
            <div>
              <strong>${day.max.toFixed(1)} / ${day.min.toFixed(1)} C</strong>
              <span class="weather-label">${weatherLabels[day.weatherCode] || "Prévision"}</span>
            </div>
            <div class="day-meta">${day.precip.toFixed(1)} mm</div>
          </div>
        </button>
      `;
    }).join("");

    grid.querySelectorAll(".day-card").forEach((card) => {
      card.addEventListener("click", () => {
        const nextDay = days.find((day) => day.date === card.dataset.date);
        if (nextDay) {
          renderSelectedDay(nextDay);
        }
      });
    });
  }

  async function loadForecast() {
    setStatus("Chargement des données météo pour Embrun...");

    const { latitude, longitude } = window.oryansData.location;
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours,weather_code,wind_speed_10m_max,sunshine_duration" +
      "&timezone=auto&forecast_days=6";

    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Forecast request failed with ${response.status}`);
      }

      const payload = await response.json();
      const daily = payload.daily;

      const rawDays = daily.time.map((date, index) => ({
        date,
        max: daily.temperature_2m_max[index],
        min: daily.temperature_2m_min[index],
        precip: daily.precipitation_sum[index],
        weatherCode: daily.weather_code[index],
        wind: daily.wind_speed_10m_max[index],
        sunshine: daily.sunshine_duration[index]
      }));

      const scoredDays = rawDays.map((day, index, allDays) => scoreDay(day, index, allDays));
      renderSummary(scoredDays);
      renderForecast(scoredDays);
      renderSelectedDay([...scoredDays].sort((a, b) => b.score - a.score)[0]);
      renderSeasonEndEstimate(scoredDays);

      status.classList.add("is-hidden");
      app.classList.remove("is-hidden");
      app.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
    } catch (error) {
      console.error(error);
      setStatus("Prévision indisponible pour le moment. L'API météo n'a pas répondu.");
      app.classList.add("is-hidden");
    }
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", loadForecast);
  }

  loadForecast();
})();
