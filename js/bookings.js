// Bookings Management Module - Club Booking Sidebar
const BookingsManager = {
  currentClub: null,
  clubs: [
    { indicator: 'C', name: 'De la Salle Chorale' },
    { indicator: 'V', name: 'Vivace' },
    { indicator: 'M', name: 'Musikat' },
    { indicator: 'P', name: 'PSG' },
    { indicator: 'T', name: 'Maskara' },
    { indicator: 'J', name: 'JBDC' },
    { indicator: 'G', name: 'GLYF' },
    { indicator: 'R', name: 'Ritmo Verde' },
    { indicator: 'S', name: 'Santermo' },
    { indicator: 'L', name: 'LFS' },
    { indicator: 'I', name: 'IWAG' }
  ],

  init() {
    console.log('BookingsManager initialized');
    // Attach booking form submit
    const form = document.getElementById('booking-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleBookingSubmit(e));
    }
  },

  showBookingsView() {
    // Hide other containers
    ['calendar-container', 'notes-container', 'tasks-container'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    const bookingsContainer = document.getElementById('bookings-container');
    if (bookingsContainer) bookingsContainer.style.display = 'block';

    // Show club list
    const clubContainer = document.getElementById('club-container');
    const clubBookingsContainer = document.getElementById('club-bookings-container');
    if (clubContainer) clubContainer.style.display = 'block';
    if (clubBookingsContainer) clubBookingsContainer.style.display = 'none';

    // Render clubs
    this.renderClubCards();
  },

  renderClubCards() {
    const clubList = document.getElementById('club-list');
    if (!clubList) return;

    let html = '';
    this.clubs.forEach(club => {
      html += `
        <div class="club-card" onclick="BookingsManager.showClubBookings('${club.indicator}')">
          <h3>${club.name}</h3>
        </div>
      `;
    });
    clubList.innerHTML = html;
  },

  async showClubBookings(clubIndicator) {
    this.currentClub = this.clubs.find(c => c.indicator === clubIndicator);
    if (!this.currentClub) return;

    // Show bookings view
    const clubContainer = document.getElementById('club-container');
    const clubBookingsContainer = document.getElementById('club-bookings-container');
    if (clubContainer) clubContainer.style.display = 'none';
    if (clubBookingsContainer) clubBookingsContainer.style.display = 'block';

    // Header with Add button (right)
    const header = document.getElementById('club-bookings-header');
    if (header) {
      header.innerHTML = `
        <button onclick="BookingsManager.showBookingsView()" class="back-btn">&larr; All Clubs</button>
        <h2>${this.currentClub.name}</h2>
        <button onclick="BookingsManager.showBookingPanel()" class="add-booking-btn">+ Add</button>
      `;
    }

    // Load list
    await this.renderClubBookings(clubIndicator);
  },

  async renderClubBookings(clubIndicator) {
    const list = document.getElementById('club-bookings-list');
    if (!list) return;

    const events = await window.EventDB.getAllSorted();
    const bookings = events.filter(e => e.club === clubIndicator);

    if (bookings.length === 0) {
      list.innerHTML = '<p class="no-bookings">No bookings. <button onclick="BookingsManager.showBookingPanel()">Add first</button></p>';
      return;
    }

    let html = '';
    bookings.forEach(e => {
      const dateRange = e.endDate ? ` (${new Date(e.date).toLocaleDateString()} - ${new Date(e.endDate).toLocaleDateString()})` : ` (${new Date(e.date).toLocaleDateString()})`;
      const extra = [];
      if (e.attire) extra.push(`Attire: ${e.attire}`);
      if (e.location) extra.push(`Location: ${e.location}`);
      
      html += `
        <div class="booking-item" data-id="${e.id}">
          <div class="booking-color" style="background-color: ${e.categoryColor || '#06402B'}"></div>
          <div class="booking-details">
            <div class="booking-title">${this.escapeHtml(e.description)}</div>
            <div class="booking-date">${dateRange}</div>
            ${extra.length ? `<div class="booking-notes">${extra.join(' | ')}</div>` : ''}
            ${e.eventNotes ? `<div class="booking-notes">${this.escapeHtml(e.eventNotes)}</div>` : ''}
          </div>
          <div class="booking-actions">
            <button onclick="BookingsManager.editClubBooking(${e.id})">Edit</button>
            <button onclick="BookingsManager.deleteClubBooking(${e.id})" class="delete-btn">Delete</button>
          </div>
        </div>`;
    });
    list.innerHTML = html;
  },

  showBookingPanel() {
    const panel = document.getElementById('booking-panel');
    const overlay = document.getElementById('booking-overlay');
    const title = document.getElementById('booking-club-display');
    const club = document.getElementById('booking-club');
    const color = document.getElementById('booking-color');
    const date = document.getElementById('booking-date');

    club.value = this.currentClub.indicator;
    color.value = '#06402B';
    title.textContent = `${this.currentClub.name} Booking`;
    date.valueAsDate = new Date();

    // Reset other fields
    ['booking-description', 'booking-attire', 'booking-location', 'booking-notes'].forEach(id => {
      document.getElementById(id).value = '';
    });

    panel.classList.add('active');
    overlay.classList.add('active');
  },

  hideBookingPanel() {
    document.getElementById('booking-panel').classList.remove('active');
    document.getElementById('booking-overlay').classList.remove('active');
  },

  async handleBookingSubmit(e) {
    e.preventDefault();
    
    const data = {
      date: document.getElementById('booking-date').value,
      description: document.getElementById('booking-description').value.trim(),
      attire: document.getElementById('booking-attire').value.trim(),
      location: document.getElementById('booking-location').value.trim(),
      eventNotes: document.getElementById('booking-notes').value.trim(),
      club: document.getElementById('booking-club').value,
      categoryColor: '#06402B'
    };

    if (!data.date || !data.description) {
      alert('Date and description required');
      return;
    }

    try {
      await window.EventDB.create(data);
      this.hideBookingPanel();
      await this.renderClubBookings(this.currentClub.indicator);
      if (window.Calendar) Calendar.refresh();
    } catch (error) {
      console.error(error);
      alert('Save failed');
    }
  },

  async deleteClubBooking(id) {
    if (!confirm('Delete?')) return;
    await window.EventDB.delete(id);
    await this.renderClubBookings(this.currentClub.indicator);
  },

  editClubBooking(id) {
    window.EventDB.getById(id).then(e => {
      if (window.App && e) window.App.showEventPanel(e.date);
    });
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

window.BookingsManager = BookingsManager;
