# Familove UI

React + Vite front end for the Familove API (`../Familove-be`). Green theme, a weekly meal planner,
and a layout that switches from a sidebar (desktop) to a bottom tab bar (phones).

```bash
npm install
npm run dev     # http://localhost:5173
```

Start the API first (`npm start` in `Familove-be`, port 3000). Vite proxies `/api` to it, so the
browser talks to a single origin and the HttpOnly refresh cookie works without CORS setup.

## Pages

| Route | What it does |
| --- | --- |
| `/login`, `/register` | Sign in or create an account |
| `/` | Dashboard: Breakfast / Lunch / Dinner tabs, a one-day view with previous/next day, each member's meal (or "Not yet added"), and a ring showing who has eaten. New users see create/join instead |
| `/meals/new` | Add a meal (optionally `?date=YYYY-MM-DD`): name, breakfast/lunch/dinner, day, time, photo link, notes, which families see it |
| `/family` | Invite code (copy, share, make a new one), members, start or join another family, leave or delete |
| `/my-meals` | Every meal you added, newest day first |
| `/notifications` | In-app notifications ("Kiran added their dinner: Biryani"). Click one to open that day and meal; mark one or all as read |
| `/profile` | Name and picture, log out, log out of all devices |

Notifications: the bell in the top bar shows an unread count (also in the browser tab title). The app checks every
15 seconds and when the tab becomes visible again. They are created by the API through RabbitMQ, so the broker
must be running (see the API's CLAUDE.md).

Light and dark themes: the sun/moon button in the top bar (and on the login page) switches them. The choice is
saved in the browser; until you choose, the app follows the system setting. Colours are CSS variables at the top
of `styles.css`, with the dark values defined once more under `data-theme="dark"`.

Each member adds their own meals. On the dashboard you can tap "Mark eaten" on your own meal; tapping a meal
opens a dialog where its owner can set the status (Planned, Cooked, Eaten) or delete it. Everyone else sees it read-only.

## Structure

```
src/
  api.js            fetch wrapper: bearer token, one refresh-and-retry on 401
  auth.jsx          session state (token in memory, session restored from the refresh cookie)
  family-context.jsx  the user's families and which one is selected
  lib.js            date helpers and labels
  notifications-context.jsx  polling, unread count, mark as read
  theme.js          light/dark switch (saved in localStorage)
  components/       Layout, MealParts (card + dialog), Donut, People, Icon, FamilyStart
  pages/            one file per route
  styles.css        all styling, plain CSS with variables at the top
public/favicon.svg  the favicon (also used as the in-app logo)
```

## Notes

- Dates are plain `YYYY-MM-DD` strings. The API stores them as UTC midnight, so a meal's day is the first
  10 characters of its date.
- A member's meal is one they created (`createdBy`); "Eaten" means every meal they added for that slot is marked Eaten. The API has no separate attendance data.
