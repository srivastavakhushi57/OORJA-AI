# OORJA AI — Data Center Energy Recovery Finder 🌍⚡

> **Built for the "Earth Forward" Environmental Hackathon**  
> *Transforming AI's largest thermal footprint into clean warmth, electricity, and local prosperity for neighboring rural and agricultural communities.*

---

## 🚀 Overview

Artificial intelligence accelerators (GPUs and TPUs) convert over 98% of their electrical energy into heat. Today, hyperscale data centers reject tens of gigawatt-hours of heat directly into the atmosphere through evaporative cooling towers, consuming millions of liters of potable water.

**OORJA AI** is an open-source, scientifically honest decision-support web application that:
1. **Searches & Profiles** global AI data centers by name, operator, and city.
2. **Calculates Monthly Recoverable Energy** (usable waste heat and secondary electricity via Organic Rankine Cycle) through interactive thermodynamic sliders and Low/Base/High scenario presets.
3. **Discovers Nearby Villages & Towns** using OpenStreetMap Overpass spatial queries within economic district heating reach (5–25 km).
4. **Visualizes All Data Centers Across 3 Synchronized Map Surfaces**:
   - **Home Page World Preview Map**: Interactive clustered markers with click-to-preview cards.
   - **Dedicated Full-Screen Explore Map (`/explore`)**: Color-coded by cooling architecture (Liquid, Hybrid, Air), marker sizes scaled by capacity (MW), cooling checkboxes, capacity sliders, and an adjustable 25 km thermal radius circle.
   - **Detail Page Maps**:
     - *Nearby Communities Map*: Showing local villages, hamlets, and greenhouses colored by heat suitability score.
     - *Other Data Centers Map*: Haversine geodesic distance to **every other data center in the dataset**, connected by faint network lines whose opacity decreases with distance, accompanied by a sortable distance table.
     - *Compare Page*: Mini map illustrating relative positions of compared facilities.
5. **Measures Environmental & Societal Impact**: Households heated, CO2 emissions avoided vs. grid electricity and diesel boilers, plus mature tree and vehicle equivalents.
6. **Exports Professional Reports**: One-click branded PDF download (powered by `jsPDF`), CSV export, and persistent local storage for adding and editing custom facilities.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7
- **Maps**: Leaflet + OpenStreetMap tiles with custom SVG markers, dark mode tile filtering, and graceful network fallbacks
- **Data Visualization**: Recharts (Daily thermal load bars, thermodynamic energy balance pie chart)
- **Report Generation**: jsPDF (client-side PDF generation) & CSV export
- **Data & Free Public APIs (Zero paid keys)**:
  - **OpenStreetMap Nominatim**: Geocoding search for unlisted data centers
  - **OpenStreetMap Overpass API**: Live retrieval of nearby villages, hamlets, towns, and greenhouses
  - **NASA POWER API**: Climatological surface solar irradiance for optional on-site solar PV
  - **Open-Meteo API**: Monthly ambient temperatures modulating cooling delta-T and heat demand
  - **Fallback Engine**: Pre-seeded rich dataset ensuring 100% offline uptime and instant load times (&lt;2s)
- **Unit Testing**: Vitest (100% pass rate for thermodynamic & geodesic engines)

---

## 📦 Setup & Running Locally

### Prerequisites
- Node.js (v18+ recommended, v24 tested)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Unit Tests
```bash
npm test
```
Runs the Vitest suite verifying the thermodynamic equations, Haversine geodesic calculation, and community fallback generators.

### 4. Build for Production
```bash
npm run build
```

---

## 🗺️ The Three Map Surfaces

| Map Surface | Route / Location | Key Features |
| :--- | :--- | :--- |
| **Home Preview Map** | `/` | Clustered markers across India, US, Europe, and Asia. Clicking any marker reveals a preview card with capacity, PUE, and a direct link to the recovery plan. |
| **Dedicated Explore Map** | `/explore` | Full-screen interactive map. Color-coded by cooling (Emerald = Liquid, Amber = Hybrid, Blue = Air), marker size scaled by MW capacity. Includes cooling filters, capacity slider, search fly-to, adjustable 25 km thermal radius circle, and legend. |
| **Nearby Communities Map** | `/datacenter/:id` | Focused on the target facility, drawing its 25 km district heating buffer and connecting to nearby villages and agricultural zones with suitability ratings. |
| **Other Data Centers Map** | `/datacenter/:id` | Haversine distance from this facility to **every other data center** in the database. Faint lines connect the facilities with distance-decay opacity. Includes a sortable distance table. |
| **Compare Mini-Map** | `/compare` | Visualizes 2–3 selected data centers relative to each other with inter-site bounding lines. |

---

## 🔬 Scientific Honesty Rules

1. **Explicit First Principles**:
   - $P_{IT} = (Capacity_{MW} \times Utilization) / PUE$
   - $Q_{IT} = P_{IT} \times 0.98 \times 24 \times Days$ (Joule heating conversion)
   - $E_{thermal} = Q_{IT} \times \eta_{capture}$ (Liquid: ~80%, Hybrid: ~65%, Air: ~40%)
2. **Uncertainty Bounds**: Always togglable between **Low**, **Base**, and **High** scenarios.
3. **Data Quality Badges**: Visibly tagged as `Measured` (corporate sustainability disclosures), `Estimated` (thermodynamic simulations), or `User-submitted`.
4. **Hydraulic Losses**: Pipeline conductive transmission loss is calculated using a distance-decay model (~0.5%/km).

---

## ⏱️ 2-Minute Demo Script (For Hackathon Judges)

1. **Step 1: Discover & Search (0:00 - 0:30)**
   - Open the Home Page. Point out the Earth Forward banner and earth-toned theme.
   - Type `"Yotta"` or `"CtrlS"` into the search bar to show instant autocomplete.
   - Click a marker on the **Home World Preview Map** to preview its card, then click **"View Details & Recovery Plan"**.

2. **Step 2: Interactive Thermodynamic Calculator (0:30 - 1:00)**
   - On the Detail page, highlight the 4 hero KPI cards (Recoverable Heat, ORC Power, Villages in Range, Avoided CO2).
   - Switch months (e.g. from July to January) and toggle between **Low**, **Base**, and **High** cases.
   - Adjust the **Capacity Utilization** and **Heat Capture %** sliders. Watch the numbers and the Recharts bar and pie charts update live without latency!

3. **Step 3: Communities & Other Data Centers Maps (1:00 - 1:30)**
   - Scroll down to the **Nearby Settlements Map & Table**: show the ranked villages, suitability scores (0–100%), and pipeline feasibility indicators.
   - Scroll to the **Other Data Centers Map**: highlight how the Haversine formula calculates distances to every other facility in the dataset, with faint connecting lines whose opacity decreases with distance.
   - Click the **"Download Report (PDF)"** button to instantly generate a branded PDF summary.

4. **Step 4: Explore Map & Impact Conclusion (1:30 - 2:00)**
   - Click **"Explore Map"** in the top navigation.
   - Demonstrate the full-screen view: toggle cooling filters (Liquid / Hybrid / Air), adjust the **Capacity slider**, and slide the **Radius circle** between 5 km and 50 km.
   - Toggle **Dark Mode** and the **Hindi (हिन्दी) language toggle** to show responsiveness and internationalization.
   - Conclude on the environmental impact: *AI compute doesn't just have to consume energy—it can power communities.*

---

## 📜 License
MIT License. Created for the Earth Forward Environmental Hackathon.
