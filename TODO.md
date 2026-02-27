# Personal Event & Planning Web App - Implementation Plan

## Project Overview
- **Project Name**: TaskPilot
- **Type**: Progressive Web App (PWA)
- **Core Functionality**: Calendar-based event logging with color-coded categories, notes, and offline support
- **Target Users**: Single personal user needing offline-first event tracking

## Technical Stack
- HTML5, CSS3, Vanilla JavaScript
- Dexie.js (IndexedDB wrapper)
- Service Worker for PWA/Offline functionality
- GitHub Pages deployment (static hosting)

---

## File Structure

```
/TaskPilot
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main application entry
│   ├── db.js           # IndexedDB layer (Dexie.js)
│   ├── calendar.js     # Calendar component
│   ├── events.js       # Event management
│   └── notes.js        # Notes management
├── sw.js               # Service Worker for PWA
├── manifest.json       # PWA manifest
└── TODO.md             # This file
```

---

## Core Features Implementation

### 1. Calendar Event Logging
- [x] Calendar grid rendering (monthly view)
- [x] Date selection functionality
- [x] Event creation form (description, category, notes)
- [x] Event display on calendar dates
- [x] Event editing and deletion

### 2. Color-Coded Categorization
- [x] Predefined color options:
  - Black: AH Club bookings
  - Blue: Theater reservation
  - Green: Personal
  - Red: AH Activities, Meetings
  - Purple: Other
- [x] Color picker UI (dropdown select)
- [x] Visual color indicators on calendar

### 3. Theater Reservation Indicator
- [x] Special "G" marker (blue) for theater reservations
- [x] Toggle for theater reservation on events
- [x] Visual marker on calendar date

### 4. Notes System
- [x] Event notes (attached to events)
- [x] General notes section
- [x] Notes list by date
- [x] Create, edit, delete notes

### 5. Sidebar Navigation
- [x] Persistent sidebar layout
- [x] Calendar nav item (default)
- [x] Notes nav item
- [x] Active state styling

### 6. Data Layer (IndexedDB)
- [x] Event schema:
  - id, date, endDate, description, categoryColor, hasTheaterReservation, eventNotes, createdTimestamp, updatedTimestamp
- [x] Note schema:
  - id, content, createdDate, lastModifiedDate
- [x] CRUD operations for events and notes

### 7. PWA/Offline
- [x] Service Worker registration
- [x] Cache static assets
- [x] Offline functionality
- [x] Installable web app
- [x] manifest.json configuration

---

## UI/UX Design

### Layout
- Sidebar: 250px fixed width (left)
- Main content: Remaining width (right)
- Calendar: Full month grid view

### Color Palette
- Primary: #2c3e50 (Dark blue-gray)
- Secondary: #3498db (Blue)
- Background: #f5f6fa (Light gray)
- Sidebar: #2c3e50 (Dark blue-gray)
- Text: #2c3e50 (Dark)
- Accent: #e74c3c (Red), #3498db (Blue), #2ecc71 (Green), #9b59b6 (Purple)

### Typography
- Font: System fonts (Segoe UI, -apple-system, sans-serif)
- Headings: Bold, 24px-32px
- Body: Regular, 14px-16px

---

## Implementation Order

1. [x] Create project structure (folders)
2. [x] Create manifest.json and sw.js (PWA foundation)
3. [x] Create db.js (data layer)
4. [x] Create index.html (structure)
5. [x] Create styles.css (styling)
6. [x] Create calendar.js (calendar component)
7. [x] Create events.js (event management)
8. [x] Create notes.js (notes management)
9. [x] Create app.js (main application)
10. [x] Test and verify

---

## Acceptance Criteria

- [x] Calendar displays current month with navigation
- [x] Can create event with description, color category, and notes
- [x] Events display on calendar with color indicators
- [x] Theater reservation "G" marker appears when enabled
- [x] Can switch between Calendar and Notes views
- [x] General notes can be created, viewed, edited, deleted
- [x] Data persists in IndexedDB across sessions
- [x] App works offline after first load
- [x] App is installable as PWA
- [x] UI is responsive and fast
- [x] Multi-day events support (start date and end date)
- [x] Category updated: AH Club bookings (Black), Theater (Blue), Personal (Green), AH Activities, Meetings (Red), Other (Purple)

---

## Dependencies (CDN)
- Dexie.js: https://unpkg.com/dexie/dist/dexie.js
