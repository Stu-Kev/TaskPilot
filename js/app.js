// Main Application Entry Point
const App = {
  currentView: 'calendar',

  // Initialize the application
  async init() {
    console.log('TaskPilot initializing...');

    // Check if Dexie is loaded
    if (typeof Dexie === 'undefined') {
      console.error('Dexie.js not loaded. Please check your internet connection.');
      document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error loading application</h1><p>Please refresh the page to try again.</p></div>';
      return;
    }

    // Initialize components
    Calendar.init();
    EventManager.init();
    NotesManager.init();

    // Setup navigation
    this.setupNavigation();

    // Setup PWA
    this.setupPWA();

    console.log('TaskPilot initialized successfully');
  },

  // Setup sidebar navigation
  setupNavigation() {
    const navCalendar = document.getElementById('nav-calendar');
    const navNotes = document.getElementById('nav-notes');

    if (navCalendar) {
      navCalendar.addEventListener('click', () => {
        this.switchView('calendar');
      });
    }

    if (navNotes) {
      navNotes.addEventListener('click', () => {
        this.switchView('notes');
      });
    }
  },

  // Switch between views
  switchView(view) {
    this.currentView = view;

    // Update nav active state
    const navCalendar = document.getElementById('nav-calendar');
    const navNotes = document.getElementById('nav-notes');

    if (view === 'calendar') {
      if (navCalendar) navCalendar.classList.add('active');
      if (navNotes) navNotes.classList.remove('active');
      NotesManager.showCalendarView();
    } else {
      if (navCalendar) navCalendar.classList.remove('active');
      if (navNotes) navNotes.classList.add('active');
      NotesManager.showNotesView();
    }
  },

  // Show event panel
  showEventPanel(dateStr) {
    EventManager.showPanel(dateStr);
  },

  // Setup PWA (Service Worker)
  setupPWA() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('ServiceWorker registered:', registration.scope);
        } catch (error) {
          console.log('ServiceWorker registration failed:', error);
        }
      });
    }

    // Handle manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Export for use in other modules
window.App = App;
