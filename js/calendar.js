// Calendar Component
const Calendar = {
  currentDate: new Date(),
  currentMonth: null,
  currentYear: null,
  selectedDate: null,
  events: [],

  // Initialize calendar
  init() {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.render();
  },

  // Get month name
  getMonthName(month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  },

  // Get days in month
  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  },

  // Format date as YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Get events for a specific date (including multi-day events)
  getEventsForDate(dateStr) {
    return this.events.filter(event => {
      // Single-day event on this date
      if (event.date === dateStr && !event.endDate) return true;
      
      // Multi-day event - check if date falls within range
      if (event.endDate) {
        return dateStr >= event.date && dateStr <= event.endDate;
      }
      
      return false;
    });
  },

  // Check if date is the start of a multi-day event
  isEventStart(dateStr, event) {
    return event.date === dateStr;
  },

  // Navigate to previous month
  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.render();
  },

  // Navigate to next month
  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.render();
  },

  // Go to today
  goToToday() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.render();
  },

  // Handle date click
  handleDateClick(dateStr, dayElement) {
    this.selectedDate = dateStr;
    
    // Update UI
    document.querySelectorAll('.calendar-day').forEach(day => {
      day.classList.remove('selected');
    });
    dayElement.classList.add('selected');
    
    // Dispatch event for app to handle
    const app = window.App;
    if (app) {
      app.showEventPanel(dateStr);
    }
  },

  // Render calendar
  async render() {
    const container = document.getElementById('calendar-container');
    if (!container) return;

    const daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);
    const firstDay = this.getFirstDayOfMonth(this.currentYear, this.currentMonth);
    const monthName = this.getMonthName(this.currentMonth);
    const today = this.formatDate(new Date());

    // Load events
    this.events = await EventDB.getAll();

    let html = `
      <div class="calendar-header">
        <button id="prev-month" class="calendar-nav-btn"><</button>
        <h2 id="calendar-title">${monthName} ${this.currentYear}</h2>
        <button id="next-month" class="calendar-nav-btn">></button>
      </div>
      <button id="today-btn" class="today-btn">Today</button>
      <div class="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div class="calendar-days">
    `;

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = this.getEventsForDate(dateStr);
      const isToday = dateStr === today;
      const isSelected = dateStr === this.selectedDate;
      const hasEvents = dayEvents.length > 0;

      html += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}" 
             data-date="${dateStr}">
          <span class="day-number">${day}</span>
          ${this.renderDayIndicators(dayEvents, dateStr)}
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;

    // Attach event listeners
    this.attachEventListeners();
  },

  // Render day indicators (color dots and theater marker for events starting on this date)
  renderDayIndicators(events, dateStr) {
    if (events.length === 0) return '';

    let html = '<div class="day-indicators">';

    // For multi-day events, only show indicator on the start date
    // Get unique events that start on this date
    const startDateEvents = events.filter(e => e.date === dateStr);
    
    // Render color indicators - show one for each event starting on this date (max 5 to leave room for theater marker)
    const eventsToShow = startDateEvents.slice(0, 5);
    eventsToShow.forEach(event => {
      const isMultiDay = event.endDate && event.endDate !== event.date;
      const title = isMultiDay 
        ? `${event.description || 'Event'} (${this.formatShortDate(event.date)} - ${this.formatShortDate(event.endDate)})`
        : (event.description || 'Event');
      html += `<span class="color-indicator" style="background-color: ${event.categoryColor}" title="${title}"></span>`;
    });

    // Show theater marker for events starting on this date that have theater reservation
    const theaterEvents = startDateEvents.filter(e => e.hasTheaterReservation);
    if (theaterEvents.length > 0) {
      html += '<span class="theater-marker" title="Theater Reservation">G</span>';
    }

    // Show "+" indicator if there are more events starting on this date
    if (startDateEvents.length > 5) {
      html += `<span class="more-events" title="${startDateEvents.length - 5} more events">+${startDateEvents.length - 5}</span>`;
    }

    html += '</div>';
    return html;
  },

  // Format short date
  formatShortDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  },

  // Attach event listeners
  attachEventListeners() {
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    const todayBtn = document.getElementById('today-btn');
    const days = document.querySelectorAll('.calendar-day:not(.empty)');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevMonth());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextMonth());
    }
    if (todayBtn) {
      todayBtn.addEventListener('click', () => this.goToToday());
    }

    days.forEach(day => {
      day.addEventListener('click', () => {
        const dateStr = day.getAttribute('data-date');
        this.handleDateClick(dateStr, day);
      });
    });
  },

  // Refresh calendar
  refresh() {
    this.render();
  }
};

// Export for use in other modules
window.Calendar = Calendar;
