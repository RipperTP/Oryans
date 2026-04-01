window.oryansData = {
  location: {
    name: "Embrun, Ontario, Canada",
    latitude: 45.2775,
    longitude: -75.281
  },
  productionSeasons: [
    { year: 2014, liters: null, days: null, start: null, end: null, note: "Production data for 2014 was not recorded." },
    { year: 2015, liters: 335, days: 12, start: "2015-04-01", end: "2015-04-12", note: "Short, productive season window reconstructed from the poster." },
    { year: 2016, liters: 621, days: 21, start: "2016-03-08", end: "2016-03-28", note: "Strong March-centered season." },
    { year: 2017, liters: 437, days: 45, start: "2017-02-22", end: "2017-04-07", note: "Long season with lighter daily output." },
    { year: 2018, liters: 798, days: 38, start: "2018-02-20", end: "2018-03-29", note: "Highest visible total on the poster." },
    { year: 2019, liters: 533, days: 22, start: "2019-03-28", end: "2019-04-18", note: "Late-starting season that still delivered strong totals." },
    { year: 2020, liters: 763, days: 34, start: "2020-03-06", end: "2020-04-08", note: "High-output season spread across a full month." },
    { year: 2021, liters: 330, days: 29, start: "2021-03-08", end: "2021-04-05", note: "Lower total despite a month-long season." },
    { year: 2022, liters: 564, days: 29, start: "2022-02-28", end: "2022-03-28", note: "Balanced season with solid volume over March." },
    { year: 2023, liters: 485, days: 49, start: "2023-02-23", end: "2023-04-12", note: "Longest visible season on the poster." },
    { year: 2024, liters: 437, days: 39, start: "2024-02-21", end: "2024-03-30", note: "Another long season with moderate total yield." },
    { year: 2025, liters: 635, days: 32, start: "2025-03-11", end: "2025-04-11", note: "Recent season with strong output and clean duration." }
  ],
  researchSources: [
    {
      title: "Minnesota DNR: Maple syruping",
      url: "https://www.dnr.state.mn.us/state_parks/maple_syruping.html",
      summary: "Best sap runs come with below-freezing nights and daytime highs in the high 30s to mid-40s F."
    },
    {
      title: "Cornell Chronicle: In 100 years, maple sap will flow a month earlier",
      url: "https://news.cornell.edu/stories/2010/11/100-years-maple-sap-will-flow-month-earlier",
      summary: "Optimal sap flow depends on a diurnal swing from a few degrees below freezing at night to a few degrees above freezing by day."
    },
    {
      title: "Minnesota Conservation Volunteer: The Season of Mud",
      url: "https://www.dnr.state.mn.us/mcvmagazine/issues/2016/mar-apr/maple-syrup-season.html",
      summary: "Sunshine helps, while warm nights or unfavorable conditions can reduce sap flow."
    },
    {
      title: "Open-Meteo forecast API",
      url: "https://open-meteo.com/en/docs/single-runs-api",
      summary: "Daily forecast data powers the Embrun sap predictor."
    }
  ]
};
