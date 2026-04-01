window.oryansData = {
  location: {
    name: "Embrun, Ontario, Canada",
    latitude: 45.2775,
    longitude: -75.281
  },
  productionSeasons: [
    { year: 2014, liters: null, days: null, start: null, end: null, note: "Aucune donnée de production n'a été notée pour 2014." },
    { year: 2015, liters: 335, days: 12, start: "2015-04-01", end: "2015-04-12", note: "Courte saison productive reconstituée à partir de l'affiche." },
    { year: 2016, liters: 621, days: 21, start: "2016-03-08", end: "2016-03-28", note: "Bonne saison centrée sur mars." },
    { year: 2017, liters: 437, days: 45, start: "2017-02-22", end: "2017-04-07", note: "Longue saison avec un rendement quotidien plus léger." },
    { year: 2018, liters: 798, days: 38, start: "2018-02-20", end: "2018-03-29", note: "Plus gros total visible sur l'affiche." },
    { year: 2019, liters: 533, days: 22, start: "2019-03-28", end: "2019-04-18", note: "Saison tardive qui a quand même donné un bon total." },
    { year: 2020, liters: 763, days: 34, start: "2020-03-06", end: "2020-04-08", note: "Grosse saison étalée sur un mois complet." },
    { year: 2021, liters: 330, days: 29, start: "2021-03-08", end: "2021-04-05", note: "Total plus modeste malgré une saison d'environ un mois." },
    { year: 2022, liters: 564, days: 29, start: "2022-02-28", end: "2022-03-28", note: "Saison équilibrée avec un bon volume sur mars." },
    { year: 2023, liters: 485, days: 49, start: "2023-02-23", end: "2023-04-12", note: "Plus longue saison visible sur l'affiche." },
    { year: 2024, liters: 437, days: 39, start: "2024-02-21", end: "2024-03-30", note: "Encore une longue saison avec un total modéré." },
    { year: 2025, liters: 635, days: 32, start: "2025-03-11", end: "2025-04-11", note: "Saison récente avec un bon rendement et une durée nette." }
  ],
  researchSources: [
    {
      title: "Minnesota DNR: Maple syruping",
      url: "https://www.dnr.state.mn.us/state_parks/maple_syruping.html",
      summary: "Les meilleures coulées arrivent avec des nuits sous zéro et des journées juste assez douces."
    },
    {
      title: "Cornell Chronicle: In 100 years, maple sap will flow a month earlier",
      url: "https://news.cornell.edu/stories/2010/11/100-years-maple-sap-will-flow-month-earlier",
      summary: "Une bonne coulée dépend d'un écart jour-nuit où ça gèle la nuit et dégèle un peu le jour."
    },
    {
      title: "Minnesota Conservation Volunteer: The Season of Mud",
      url: "https://www.dnr.state.mn.us/mcvmagazine/issues/2016/mar-apr/maple-syrup-season.html",
      summary: "Le soleil aide, tandis que les nuits chaudes ou les mauvaises conditions peuvent ralentir la coulée."
    },
    {
      title: "Open-Meteo forecast API",
      url: "https://open-meteo.com/en/docs/single-runs-api",
      summary: "Les données météo quotidiennes alimentent le prédicteur de coulée pour Embrun."
    }
  ]
};
