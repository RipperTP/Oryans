(function () {
  const app = document.getElementById("forecastApp");
  const status = document.getElementById("forecastStatus");
  const grid = document.getElementById("forecastGrid");
  const refreshButton = document.getElementById("refreshForecast");
  const selectedSummary = document.getElementById("selectedDaySummary");
  const selectedNotes = document.getElementById("selectedDayNotes");
  const plannerOutput = document.getElementById("plannerOutput");
  const tapCount = document.getElementById("tapCount");
  const litersPerTap = document.getElementById("litersPerTap");
  const sapSugar = document.getElementById("sapSugar");
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
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm"
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatDateLabel(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return {
      day: new Intl.DateTimeFormat("en-CA", { weekday: "short" }).format(date),
      short: new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(date)
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
      return { score: 16, note: "Prime sugar-season timing." };
    }

    if (month === 2 && day >= 20) {
      return { score: 10, note: "Early but seasonally possible." };
    }

    if (month === 4 && day <= 15) {
      return { score: 8, note: "Late-season window still in play." };
    }

    return { score: -12, note: "Outside the most reliable sap window." };
  }

  function getCategory(score) {
    if (score >= 78) {
      return { key: "excellent", label: "Excellent run" };
    }
    if (score >= 60) {
      return { key: "promising", label: "Promising" };
    }
    if (score >= 40) {
      return { key: "fair", label: "Fair" };
    }
    return { key: "quiet", label: "Quiet" };
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
      notes.push("Night drops cleanly below freezing.");
    } else if (day.min <= 1) {
      score += 12;
      notes.push("Near-freezing night may still help pressure change.");
    } else {
      score -= 18;
      notes.push("Warm night weakens the freeze/thaw cycle.");
    }

    if (day.max >= 3 && day.max <= 8) {
      score += 26;
      notes.push("Daytime high sits in the classic sap-running band.");
    } else if (day.max > 0 && day.max <= 12) {
      score += 16;
      notes.push("Enough daytime thaw for at least some movement.");
    } else if (day.max > 12 && day.max <= 18) {
      score += 4;
      notes.push("Warm afternoon may shorten the strongest run window.");
    } else {
      score -= 12;
      notes.push("Too cold during the day for a healthy thaw.");
    }

    if (swing >= 5 && swing <= 13) {
      score += 12;
      notes.push("Good day-to-night temperature swing.");
    } else if (swing >= 3) {
      score += 6;
    } else {
      score -= 6;
      notes.push("Small temperature swing limits pressure change.");
    }

    if (sunshineHours >= 5) {
      score += 8;
      notes.push("Sunshine should help warm trunks and lines.");
    } else if (sunshineHours >= 2) {
      score += 4;
    } else {
      score -= 2;
    }

    if (day.precip >= 0.5 && day.precip <= 8) {
      score += 4;
      notes.push("Recent moisture may help keep trees recharged.");
    } else if (day.precip > 15) {
      score -= 3;
      notes.push("Heavy precipitation can make collection messy.");
    }

    if (day.wind > 35) {
      score -= 7;
      notes.push("Strong wind may cool trees and complicate collection.");
    } else if (day.wind < 20) {
      score += 2;
    }

    const neighborDays = [allDays[index - 1], allDays[index + 1]].filter(Boolean);
    if (neighborDays.some(isClassicCycle)) {
      score += 5;
      notes.push("A neighboring day also supports a freeze/thaw rhythm.");
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

    tomorrowHeadline.textContent = `${tomorrow.score}/100`;
    tomorrowDetail.textContent = `${formatDateLabel(tomorrow.date).day} looks ${tomorrow.category.label.toLowerCase()} for sap flow.`;

    bestHeadline.textContent = `${formatDateLabel(bestDay.date).short}`;
    bestDetail.textContent = `${bestDay.category.label} with a score of ${bestDay.score}/100.`;

    weekHeadline.textContent = `${promisingDays} strong day${promisingDays === 1 ? "" : "s"}`;
    weekDetail.textContent = `Weekly average: ${weekAverage}/100 over the next seven days.`;
  }

  function renderSelectedDay(day) {
    selectedDay = day;
    const label = formatDateLabel(day.date);

    selectedSummary.innerHTML = `
      <h3>${day.category.label}</h3>
      <p>${label.day}, ${label.short} in Embrun scored <strong>${day.score}/100</strong>.</p>
      <div class="detail-summary-grid">
        <div class="detail-metric">
          <strong>${day.max.toFixed(1)} C</strong>
          <span>Daytime high</span>
        </div>
        <div class="detail-metric">
          <strong>${day.min.toFixed(1)} C</strong>
          <span>Night low</span>
        </div>
        <div class="detail-metric">
          <strong>${day.sunshineHours.toFixed(1)} h</strong>
          <span>Sunshine</span>
        </div>
      </div>
    `;

    selectedNotes.innerHTML = day.notes.slice(0, 5).map((note) => `<li>${note}</li>`).join("");

    renderPlanner();
    grid.querySelectorAll(".day-card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.date === day.date);
    });
  }

  function renderPlanner() {
    if (!selectedDay) {
      return;
    }

    const taps = Math.max(1, Number(tapCount.value) || 0);
    const liters = Math.max(0.2, Number(litersPerTap.value) || 0);
    const sugar = clamp(Number(sapSugar.value) || 2.2, 1, 5);
    const expectedSap = taps * liters * (selectedDay.score / 100);
    const sapPerLiterOfSyrup = 86 / sugar;
    const syrupLiters = expectedSap / sapPerLiterOfSyrup;

    plannerOutput.innerHTML = `
      <strong>${selectedDay.score}/100 day estimate</strong><br>
      At <strong>${taps}</strong> taps and <strong>${liters.toFixed(1)} L</strong> per tap on a strong day,
      this forecast suggests about <strong>${expectedSap.toFixed(1)} liters of sap</strong>.<br>
      At <strong>${sugar.toFixed(1)}%</strong> sap sugar, that converts to roughly
      <strong>${syrupLiters.toFixed(1)} liters of finished syrup</strong> using the 86 rule.
    `;
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
              <span class="weather-label">${weatherLabels[day.weatherCode] || "Forecast"}</span>
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
    setStatus("Loading forecast data for Embrun...");

    const { latitude, longitude } = window.oryansData.location;
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours,weather_code,wind_speed_10m_max,sunshine_duration" +
      "&timezone=auto&forecast_days=7";

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
      setStatus("Forecast unavailable right now. The weather API did not respond.");
      app.classList.add("is-hidden");
    }
  }

  [tapCount, litersPerTap, sapSugar].forEach((input) => {
    input.addEventListener("input", renderPlanner);
  });

  if (refreshButton) {
    refreshButton.addEventListener("click", loadForecast);
  }

  loadForecast();
})();
