# Game of Life Budget Dashboard

First-Year Financial InSight Milestone: a React-based budget entry dashboard for the Game of Life event. Money managers use this to enter student budget data, visualize 50/30/20 allocation, and generate summaries.

Built with React + Vite + Recharts. Deployable to GitHub Pages.


## Features

- **Student lookup** by name, ID, or email with instant search
- **Budget entry** across 11 categories matching the Game of Life budget sheet
- **50/30/20 analysis** with real-time needs/wants/goals calculation
- **Four visualizations**: animated donut comparison, Sankey income flow diagram, waterfall chart, and radar chart
- **Zero-based budget thermometer** tracking allocation toward income
- **"What If" sliders** for interactive coaching conversations
- **Coaching prompts** that surface when categories exceed suggested baselines
- **Print/share summary** for students to screenshot or print
- **Aggregate dashboard** with post-event reporting across all processed students
- **Dark and Champlain light themes** with adjustable font size
- **Offline-capable**: student data is baked into the build, no network needed on event day


## Project Structure

```
gol-budget-dashboard/
├── data/
│   ├── README.md
│   └── master.csv          ← YOUR DATA (gitignored, see step 2)
├── scripts/
│   └── build-data.js       ← Parses CSV into JSON
├── src/
│   ├── components/
│   │   └── GameOfLifeDashboard.jsx
│   ├── data/
│   │   └── students.json   ← Generated (or sample data)
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```


## Quick Start

### Prerequisites

- **Node.js** 18 or newer (check with `node --version`)
- **npm** (comes with Node)
- **Git** (for version control and deployment)


### 1. Clone / copy the project

If starting from the zip file Claude provided, unzip it and open the folder in PyCharm.

Or if you've already pushed to GitHub:

```bash
git clone https://github.com/YOUR_USERNAME/gol-budget-dashboard.git
cd gol-budget-dashboard
```


### 2. Install dependencies

Open PyCharm's built-in terminal (View > Tool Windows > Terminal, or Alt+F12) and run:

```bash
npm install
```

This installs React, Recharts, Vite, and the CSV parser.


### 3. Add your student data

Export the **Master** sheet from your Master Money Manager Google Sheet as a CSV:

1. Open the Master Money Manager in Google Sheets
2. Navigate to the **Master** tab
3. File > Download > Comma Separated Values (.csv)
4. Rename the downloaded file to `master.csv`
5. Move it into the `data/` folder in your project

Your `data/` folder should now contain:
```
data/
├── README.md
└── master.csv
```


### 4. Build the student data

This reads the CSV and generates the JSON that the dashboard uses:

```bash
npm run build-data
```

You should see output like:
```
Reading: data/master.csv
  Parsed 399 rows
  Detected columns: { sid: '<<sid>>', firstName: 'First Name', ... }
  Found 325 unique students (skipped 74 non-student rows)

  Wrote 325 students to src/data/students.json
  Sections: 19
  Programs: 32

  Done! Run 'npm run dev' to see the dashboard.
```

If you skip this step, the app still works with 12 sample students.


### 5. Run the dev server

```bash
npm run dev
```

Vite will start a local server (usually http://localhost:5173). Open it in your browser. Hot reloading is on, so changes to the code update instantly.


### 6. Test it

1. Search for a student name in the search bar
2. Enter dollar amounts in the budget categories
3. Watch the visualizations update live
4. Try the "What If" toggle after entering values
5. Click "Save & Next" to add the student to the session log
6. Switch to the "Aggregate" tab to see reporting


## Deploying to GitHub Pages

### One-time setup

1. **Create a GitHub repository** (either public or private):
   - Go to https://github.com/new
   - Name it `gol-budget-dashboard` (or whatever you like)
   - Don't initialize with README (you already have one)

2. **Update the base path** in `vite.config.js`:
   ```js
   base: '/your-repo-name/',
   ```
   If your repo is `gol-budget-dashboard`, leave it as-is.

3. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/gol-budget-dashboard.git
   git push -u origin main
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

   This builds the production bundle and pushes it to a `gh-pages` branch.

5. **Enable GitHub Pages** in your repo settings:
   - Go to Settings > Pages
   - Under "Source", select **Deploy from a branch**
   - Select the `gh-pages` branch and `/ (root)`
   - Click Save

6. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/gol-budget-dashboard/
   ```

### Updating the deployment

After making changes or updating student data:

```bash
npm run build-data    # if CSV changed
npm run deploy        # build and push to gh-pages
```


## Important: Student Data Privacy

The `data/master.csv` file and the generated `src/data/students.json` contain student PII (names, emails, student IDs, financial data).

- `data/master.csv` is **gitignored** by default and will never be committed
- `src/data/students.json` is **not gitignored** by default so it can deploy to GitHub Pages
- If your repo is **public**, uncomment the `src/data/students.json` line in `.gitignore` and use a private repo instead
- For a **private repo**, this is fine as-is

Easy fix for testing: anonymize sID's, Fname, Lname in master.csv and use localhost or push to private, password-protected page when "live"


## Updating Student Data

When your roster changes (new students, updated income data):

1. Re-export the Master sheet as CSV
2. Replace `data/master.csv` with the new file
3. Run `npm run build-data`
4. Run `npm run deploy` to update the live site

The build-data script handles deduplication, tax estimation, and sorting automatically.


## PyCharm Tips

- **Open terminal**: Alt+F12 (or View > Tool Windows > Terminal)
- **Run npm scripts**: Right-click `package.json` > Show npm Scripts, then double-click any script
- **File watcher**: Vite's dev server auto-reloads, so just save your files
- **JSX syntax**: PyCharm should auto-detect JSX. If not, go to Settings > Languages & Frameworks > JavaScript and set the language version to "React JSX"
- **Node interpreter**: Settings > Languages & Frameworks > Node.js, make sure your Node 18+ installation is selected


## Customization

### Adding/changing budget categories

Edit the `CATEGORIES` array in `src/components/GameOfLifeDashboard.jsx`. Each category has:
- `key`: unique identifier
- `label`: display name
- `hint`: helper text
- `alloc`: how it splits into needs/wants/goals (must sum to 1.0, or null for uncategorized)
- `suggested`: baseline percentage for coaching prompts

### Changing coaching prompts

Edit the `COACHING` object in the same file. Each key matches a category key.

### Adjusting themes

Edit the `THEMES` object. The `dark` and `light` themes define every color used in the dashboard.

### Column mapping

If your CSV has different column headers, the build-data script tries to auto-detect them. If it fails, check the `findCol` function in `scripts/build-data.js` and add your column names to the candidates list.


## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI components |
| Recharts | Donut, radar, bar charts |
| Vite 5 | Dev server and build tooling |
| Papaparse | CSV parsing in build-data |
| gh-pages | GitHub Pages deployment |


## Scripts Reference

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build-data` | Parse data/master.csv into src/data/students.json |
| `npm run build` | Production build to dist/ |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build + push to gh-pages branch |
