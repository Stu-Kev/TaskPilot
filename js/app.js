// Main Application Entry Point
const App = {
  currentView: 'calendar',
  initialized: false,

  getRoute() {
    const params = new URLSearchParams(window.location.search);
    return params.get('route') || '';
  },

  isPublicFormRoute(route = this.getRoute()) {
    return /^forms\/(ahb|studio|gallaga)$/.test(route);
  },

  getPublicFormTab(route = this.getRoute()) {
    const match = route.match(/^forms\/(ahb|studio|gallaga)$/);
    return match ? match[1] : 'ahb';
  },

  isPublicFormsMode() {
    return this.isPublicFormRoute();
  },

  setBodyMode(isPublic) {
    document.body.classList.toggle('public-forms-mode', isPublic);
  },

  navigate(route, { replace = false } = {}) {
    const nextUrl = route
      ? `${window.location.pathname}?route=${encodeURIComponent(route)}`
      : window.location.pathname;

    if (replace) {
      window.history.replaceState({ route }, '', nextUrl);
    } else {
      window.history.pushState({ route }, '', nextUrl);
    }

    this.handleCurrentRoute();
  },

  navigateToPublicForm(tab, options = {}) {
    this.navigate(`forms/${tab}`, options);
  },

  navigateToAdminView(view, options = {}) {
    this.navigate(`admin/${view}`, options);
  },

  navigateToAdminForm(tab, options = {}) {
    this.navigate(`admin/forms/${tab}`, options);
  },

  normalizeAdminRoute(route) {
    if (route.startsWith('admin/forms/')) {
      return 'forms';
    }
    if (route === 'admin/forms') {
      return 'forms';
    }
    if (route.startsWith('admin/')) {
      return route.slice('admin/'.length);
    }
    return 'calendar';
  },

  getAdminFormTab(route = this.getRoute()) {
    const match = route.match(/^admin\/forms\/(ahb|studio|gallaga)$/);
    return match ? match[1] : null;
  },

  // Initialize the application
  async init() {
    if (this.initialized) {
      this.handleCurrentRoute();
      return;
    }

    this.initialized = true;
    console.log('TaskPilot initializing...');

    if (typeof Dexie === 'undefined') {
      console.error('Dexie.js not loaded.');
      document.body.innerHTML = '<h1>Error loading app</h1>';
      return;
    }

    // Initialize modules
    Calendar.init();
    EventManager.init();
    NotesManager.init();
    TasksManager.init();

    if (typeof BookingsManager !== 'undefined') {
      BookingsManager.init();
    }

    if (typeof FormsManager !== 'undefined') {
      FormsManager.init();
    }

    this.setupNavigation();
    this.setupRouting();
    this.setupPWA();
    this.handleCurrentRoute();

    console.log('TaskPilot initialized successfully');
  },

  setupRouting() {
    window.addEventListener('popstate', () => this.handleCurrentRoute());
  },

  // Navigation setup
  setupNavigation() {
    const navCalendar = document.getElementById('nav-calendar');
    const navNotes = document.getElementById('nav-notes');
    const navTasks = document.getElementById('nav-tasks');
    const navBookings = document.getElementById('nav-bookings');
    const navForms = document.getElementById('nav-forms');
    const navWaitlist = document.getElementById('nav-waitlist');

    if (navCalendar) {
      navCalendar.addEventListener('click', () => this.navigateToAdminView('calendar'));
    }

    if (navNotes) {
      navNotes.addEventListener('click', () => this.navigateToAdminView('notes'));
    }

    if (navTasks) {
      navTasks.addEventListener('click', () => this.navigateToAdminView('tasks'));
    }

    if (navBookings) {
      navBookings.addEventListener('click', () => this.navigateToAdminView('bookings'));
    }

    if (navForms) {
      navForms.addEventListener('click', () => this.navigateToAdminForm(FormsManager.currentTab || 'ahb'));
    }

    if (navWaitlist) {
      navWaitlist.addEventListener('click', () => this.navigateToAdminView('waitlist'));
    }
  },

  async handleCurrentRoute() {
    const route = this.getRoute();

    if (this.isPublicFormRoute(route)) {
      this.setBodyMode(true);
      AdminManager.hideLogin();
      this.showPublicFormRoute(this.getPublicFormTab(route));
      return;
    }

    this.setBodyMode(false);

    if (!AdminManager.checkLogin()) {
      AdminManager.showLogin();
      return;
    }

    AdminManager.hideLogin();
    this.switchView(this.normalizeAdminRoute(route));
  },

  showPublicFormRoute(tab) {
    const appContainer = document.getElementById('app-container');
    const formsContainer = document.getElementById('forms-container');
    const mainContent = document.querySelector('.main-content');

    if (appContainer) {
      appContainer.style.display = 'flex';
    }

    if (mainContent) {
      mainContent.scrollTop = 0;
    }

    ['calendar-container', 'notes-container', 'tasks-container', 'admin-container'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    if (formsContainer) {
      formsContainer.style.display = 'block';
    }

    if (typeof FormsManager !== 'undefined') {
      FormsManager.switchTab(tab, null, { updateRoute: false });
    }
  },

  // Switch views
  switchView(view) {
    this.currentView = view;

    const navCalendar = document.getElementById('nav-calendar');
    const navNotes = document.getElementById('nav-notes');
    const navTasks = document.getElementById('nav-tasks');
    const navBookings = document.getElementById('nav-bookings');
    const navForms = document.getElementById('nav-forms');
    const navWaitlist = document.getElementById('nav-waitlist');

    const calendarContainer = document.getElementById('calendar-container');
    const notesContainer = document.getElementById('notes-container');
    const tasksContainer = document.getElementById('tasks-container');
    const bookingsContainer = document.getElementById('bookings-container');
    const formsContainer = document.getElementById('forms-container');
    const adminContainer = document.getElementById('admin-container');

    [navCalendar, navNotes, navTasks, navBookings, navForms, navWaitlist].forEach(el => {
      if (el) el.classList.remove('active');
    });

    if (calendarContainer) calendarContainer.style.display = 'none';
    if (notesContainer) notesContainer.style.display = 'none';
    if (tasksContainer) tasksContainer.style.display = 'none';
    if (bookingsContainer) bookingsContainer.style.display = 'none';
    if (formsContainer) formsContainer.style.display = 'none';
    if (adminContainer) adminContainer.style.display = 'none';

    if (view === 'calendar') {
      if (navCalendar) navCalendar.classList.add('active');
      if (calendarContainer) calendarContainer.style.display = 'block';
      Calendar.render();
    }

    if (view === 'notes') {
      if (navNotes) navNotes.classList.add('active');
      if (notesContainer) notesContainer.style.display = 'block';
      NotesManager.loadNotes();
    }

    if (view === 'tasks') {
      if (navTasks) navTasks.classList.add('active');
      if (tasksContainer) tasksContainer.style.display = 'block';
      TasksManager.loadTasks();
    }

    if (view === 'bookings') {
      if (navBookings) navBookings.classList.add('active');
      if (bookingsContainer) bookingsContainer.style.display = 'block';
      if (typeof BookingsManager !== 'undefined') {
        BookingsManager.showBookingsView();
      }
    }

    if (view === 'forms') {
      if (navForms) navForms.classList.add('active');
      if (formsContainer) formsContainer.style.display = 'block';
      if (typeof FormsManager !== 'undefined') {
        const formTab = this.getAdminFormTab() || FormsManager.currentTab || 'ahb';
        FormsManager.switchTab(formTab, null, { updateRoute: false });
      }
    }

    if (view === 'waitlist') {
      if (navWaitlist) navWaitlist.classList.add('active');
      if (adminContainer) adminContainer.style.display = 'block';
      if (typeof AdminManager !== 'undefined') {
        AdminManager.renderPending();
      }
    }
  },

  // Show event panel
  showEventPanel(dateStr) {
    EventManager.showPanel(dateStr);
  },

  // Setup PWA
  setupPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered');
        } catch (e) {
          console.log('SW failed:', e);
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.App = App;
