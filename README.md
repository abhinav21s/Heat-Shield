# HeatShield 🛡️🔥

**Real-Time Urban Heat Protection & Hyperlocal Microclimate Intelligence**

HeatShield is a modern, responsive web application built with **Next.js 14/15**, **TypeScript**, **Tailwind CSS**, and **Leaflet** that turns hyperlocal temperature data and FortyGuard thermal models into immediately understandable, life-saving personal and operational heat guidance.

---

## 🌟 Key Features

1. **Personal Risk Dashboard (Home)**
   - **Dominant Risk Indicator**: Visually commanding badge (Low / Moderate / High / Extreme) with dynamic risk score percentage (0–100).
   - **Microclimate Diagnostics**: Ambient temperature, Feels-Like heat index, Wet Bulb Globe Temperature (WBGT), ground/asphalt surface temperature, UV index, and solar radiation flux (W/m²).
   - **Immediate Precautions**: Prioritized, scannable safety rules with single-click clipboard sharing.
   - **Smart Thermal Insights**: Urban heat island disparity comparison, peak risk window prediction, and asphalt paw-burn hazard warnings.
   - **Hourly Trajectory Chart**: 8-to-10 hour visual curve showing temperature, feels-like, UV, and risk score progression.
   - **Vulnerability Matrix**: Action rules for older adults (65+), outdoor laborers, infants, and pets.

2. **Interactive Urban Heat Map (`/map`)**
   - Color-coded thermal micro-zones with custom polygon/circle overlays.
   - Instant coordinate pin dropping (click anywhere on the map to compute localized heat risk).
   - Zone inspection slide-over sheet displaying canopy cover vs. impervious pavement %, thermal diagnosis, and nearest cooling shelter.
   - Layer filters (All Zones, High Risk Only, Cooling Shelters).

3. **Action Guidance & Protection Playbook (`/recommendations`)**
   - Categorized checklists for General Public, Outdoor Workers (OSHA-compliant work/rest cycles), Seniors/Children, and Companion Animals.
   - **Interactive Hydration Calculator**: Dynamically calculates required water volume (oz / Liters) and electrolyte packets based on body weight, exposure hours, and activity intensity.
   - **Heat Illness Medical Triage**: Critical symptom checker distinguishing between Heat Exhaustion and life-threatening Heat Stroke.

4. **Area Intelligence & Heat Islands (`/intelligence`)**
   - Microclimate ranking from hottest asphalt corridor to shaded canopy oasis.
   - Urban Heat Island (UHI) science explainer (albedo, tree canopy deficit, canyon geometry, anthropogenic heat).
   - Directory of municipal air-conditioned cooling shelters, opening hours, amenities, and phone numbers.

5. **Location Handling & Geolocation**
   - Automatic browser GPS geolocation with graceful fallback.
   - Global city search with built-in presets for major US heat hotspots (Phoenix, Houston, Las Vegas, Dallas, Miami, Los Angeles, Austin).
   - Custom coordinate input.
   - Instant °F / °C unit toggle.

---

## 🎨 Design System

- **Primary Color:** Warm Coral (`#E07A5F`)
- **Primary Dark (Hover):** Deep Coral (`#C26A52`)
- **Background:** Warm Off-White (`#FDF6F0`)
- **Surface / Cards:** Soft Cream (`#F8EDE6`)
- **Text Primary:** Charcoal (`#2D2A26`)
- **Text Secondary:** Warm Gray (`#6B6560`)
- **Low Risk:** Soft Sage (`#81B29A`)
- **Moderate Risk:** Warm Amber (`#F2CC8F`)
- **High & Extreme Risk:** Strong Terracotta / Red-Orange (`#D62828`)
- **Borders:** Light Warm Gray (`#EADFD8`)

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom accessible UI components (Cards, Badges, Tabs, Modals, Sliders)
- **Maps**: Leaflet + CartoDB Positron Warm Tiles
- **Icons**: Lucide React
- **API & Data**: Next.js API route (`/api/heat-data`) compatible with FortyGuard Hyperlocal API schema and dynamic simulation engine.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
