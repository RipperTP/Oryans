(function () {
  const app = document.getElementById("forecastApp");
  const status = document.getElementById("forecastStatus");
  const grid = document.getElementById("forecastGrid");
  const refreshButton = document.getElementById("refreshForecast");
  const selectedSummary = document.getElementById("selectedDaySummary");
  const selectedNotes = document.getElementById("selectedDayNotes");
  const tomorrowHeadline = document.getElementById("tomorrowHeadline");
  const tomorrowDetail = document.getElementById("tomorrowDetail");
  const bestHeadline = document.getElementById("bestHeadline");
  const bestDetail = document.getElementById("bestDetail");
  const weekHeadline = document.getElementById("weekHeadline");
  const weekDetail = document.getElementById("weekDetail");

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

  function formatDateLabel(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return {
      day: new Intl.DateTimeFormat("fr-CA", { weekday: "short" }).format(date),
      short: new Intl.DateTimeFormat("fr-CA", { month: "short", day: "numeric" }).format(date)
    };
  }

  function isClassicCycle(day) {
    return day.min <= 0 && day.max >= 3 && day.max <= 10;
  }

  function getSeasonWeight(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
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
    return { key: "quiet", label: "Plutôt tranquille", summary: "assez tranquille pour la coulée" };
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
    weekDetail.textContent = `Moyenne des huit prochains jours : ${weekAverage}/100.`;
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
      "&timezone=auto&forecast_days=8";

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
