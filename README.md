# Sucrerie o'Ryans

Site vitrine statique pour la Sucrerie o'Ryans à Embrun, en Ontario.

Le projet présente la cabane à sucre, son histoire, la production par saison, une prévision des coulées et les informations de contact/point de vente.

## Contenu du site

- `index.html` : page d'accueil avec présentation générale et galerie photo
- `forecast.html` : prévision des coulées basée sur les données météo d'Embrun
- `history.html` : histoire de la sucrerie, étapes de fabrication et opérations
- `production.html` : comparaison des saisons, graphique interactif et résumé de production
- `contact.html` : coordonnées de contact et point de vente local chez Marché BoniChoix

## Fonctionnalités

- navigation responsive avec menu mobile
- galerie photo avec visionneuse plein écran
- prévision météo interactive pour les coulées
- visualisation des saisons de production
- design statique optimisé pour mobile et desktop

## Structure

```text
.
|-- index.html
|-- forecast.html
|-- history.html
|-- production.html
|-- contact.html
|-- css/
|   `-- styles.css
|-- js/
|   |-- main.js
|   |-- forecast.js
|   |-- production.js
|   `-- data.js
`-- assets/
    `-- images/
```

## Données

- `js/data.js` contient la localisation d'Embrun, l'historique des saisons de production et les sources de recherche
- `js/forecast.js` interroge l'API Open-Meteo pour charger la météo en direct
- `js/production.js` construit le graphique des saisons et les cartes de résumé

## Lancer localement

Le site ne demande aucun build ni dépendance.

Option simple :

1. Ouvrir le dossier dans VS Code
2. Lancer un serveur statique comme Live Server
3. Ouvrir `index.html`

Vous pouvez aussi utiliser n'importe quel serveur web statique local.

## Notes

- La page de prévision demande une connexion internet pour joindre Open-Meteo
- Le reste du site est principalement statique
- Les images et textes sont adaptés à la Sucrerie o'Ryans et à son historique local
