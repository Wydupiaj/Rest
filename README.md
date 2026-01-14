
# Component Order — React + MUI

Lokalny projekt wzorowany na tabeli z CASTLE. Zawiera DataGrid z sortowaniem, filtrowaniem, paginacją oraz statusami w formie znaczników.

## Jak uruchomić
1. Zainstaluj Node.js (LTS)
2. W katalogu projektu wykonaj:

```bash
npm install
npm run dev
```

Aplikacja wystartuje pod adresem wskazanym przez Vite (np. http://localhost:5173).

## Struktura
```
component-order-react/
  public/
  src/
    components/
      ComponentOrderTable.jsx
      StatusChip.jsx
      TopBar.jsx
    data/
      sampleOrders.js
    App.jsx
    main.jsx
    theme.js
    styles.css
  index.html
  package.json
  vite.config.js
```

## Notatki
- Użyta jest wersja community `@mui/x-data-grid` (MIT). Nie wymaga licencji PRO.
- Dane są przykładowe i generowane lokalnie w pliku `sampleOrders.js`.
- Do eksportu/filtrowania użyty jest wbudowany `GridToolbar`.
```
