// Event Management Module
const EventManager = {
  currentEventId: null,
  isEditing: false,

  // Category colors configuration
  categories: [
    { color: '#000000', name: 'AH Club bookings', label: 'AH Club bookings (Black)' },
    { color: '#3498db', name: 'Theater', label: 'Theater (Blue)' },
    { color: '#2ecc71', name: 'Personal', label: 'Personal (Green)' },
    { color: '#e74c3c', name: 'AH Activities, Meetings', label: 'AH Activities, Meetings (Red)' },
    { color: '#9b59b6', name: 'Other', label: 'Other (Purple)' }
  ],

  // Show event panel for a specific date
  async showPanel(dateStr) {
    const panel = document.getElementById('event-panel');
    const dateDisplay = document.getElementById('selected-date-display');
    const dateInput = document.getElementById('event-date');
    const eventList = document.getElementById('events-list');

    if (!panel || !dateDisplay || !dateInput || !eventList) return;

    // Set the date
    dateDisplay.textContent = this.formatDisplayDate(dateStr);
    dateInput.value = dateStr;

    // Reset form state
    this.resetForm();

    // Load events for this date
    const events = await EventDB.getByDate(dateStr);
    this.renderEventList(events, dateStr);

    // Show panel
    panel.classList.add('active');
  },

  // Hide event panel
  hidePanel() {
    const panel = document.getElementById('event-panel');
    if (panel) {
      panel.classList.remove('active');
    }
    this.resetForm();
  },

  // Format date for display
  formatDisplayDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  },

  // Render event list
  renderEventList(events, dateStr) {
    const eventList = document.getElementById('events-list');
    if (!eventList) return;

    if (events.length === 0) {
      eventList.innerHTML = '<p class="no-events">No events for this date</p>';
      return;
    }

    let html = '';
    events.forEach(event => {
      const dateRange = event.endDate && event.endDate !== event.date 
        ? `<span class="event-date-range"> (${this.formatShortDate(event.date)} - ${this.formatShortDate(event.endDate)})</span>` 
        : '';
      
      html += `
        <div class="event-item" data-id="${event.id}">
          <div class="event-color" style="background-color: ${event.categoryColor}"></div>
          <div class="event-details">
            <div class="event-description">${this.escapeHtml(event.description) || 'Untitled Event'}</div>
            ${dateRange}
            ${event.hasTheaterReservation ? '<span class="theater-badge">🎭 G</span>' : ''}
            ${event.eventNotes ? `<div class="event-notes-preview">${this.escapeHtml(event.eventNotes)}</div>` : ''}
          </div>
          <div class="event-actions">
            <button class="edit-event-btn" onclick="EventManager.editEvent(${event.id})">Edit</button>
            <button class="delete-event-btn" onclick="EventManager.deleteEvent(${event.id})">Delete</button>
          </div>
        </div>
      `;
    });
    eventList.innerHTML = html;
  },

  // Format short date
  formatShortDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Reset form
  resetForm() {
    this.currentEventId = null;
    this.isEditing = false;
    
    const form = document.getElementById('event-form');
    if (form) {
      form.reset();
    }

    // Set default color
    const colorInput = document.getElementById('event-color');
    if (colorInput) {
      colorInput.value = this.categories[0].color;
    }

    // Clear end date
    const endDateInput = document.getElementById('event-end-date');
    if (endDateInput) {
      endDateInput.value = '';
    }

    // Hide delete button when creating new
    const deleteBtn = document.getElementById('delete-event-btn');
    if (deleteBtn) {
      deleteBtn.style.display = 'none';
    }

    // Update submit button text
    const submitBtn = document.getElementById('event-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = 'Add Event';
    }
  },

  // Edit existing event
  async editEvent(id) {
    const event = await EventDB.getById(id);
    if (!event) return;

    this.currentEventId = id;
    this.isEditing = true;

    // Populate form
    document.getElementById('event-description').value = event.description || '';
    document.getElementById('event-color').value = event.categoryColor || '#000000';
    document.getElementById('event-theater').checked = event.hasTheaterReservation || false;
    document.getElementById('event-notes').value = event.eventNotes || '';
    document.getElementById('event-end-date').value = event.endDate || '';

    // Show delete button
    const deleteBtn = document.getElementById('delete-event-btn');
    if (deleteBtn) {
      deleteBtn.style.display = 'inline-block';
    }

    // Update submit button text
    const submitBtn = document.getElementById('event-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = 'Update Event';
    }

    // Scroll to form
    const formContainer = document.getElementById('event-form-container');
    if (formContainer) {
      formContainer.scrollIntoView({ behavior: 'smooth' });
    }
  },

  // Save event (create or update)
  async saveEvent(eventData) {
    try {
      if (this.isEditing && this.currentEventId) {
        await EventDB.update(this.currentEventId, eventData);
      } else {
        await EventDB.create(eventData);
      }
      
      // Refresh calendar
      Calendar.refresh();
      
      // Refresh event list
      const dateStr = document.getElementById('event-date').value;
      const events = await EventDB.getByDate(dateStr);
      this.renderEventList(events, dateStr);
      
      // Reset form
      this.resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  },

  // Delete event
  async deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await EventDB.delete(id);
      
      // Refresh calendar
      Calendar.refresh();
      
      // Refresh event list
      const dateStr = document.getElementById('event-date').value;
      const events = await EventDB.getByDate(dateStr);
      this.renderEventList(events, dateStr);
      
      // If deleted the event being edited, reset form
      if (this.currentEventId === id) {
        this.resetForm();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  },

  // Handle form submit
  handleFormSubmit(e) {
    e.preventDefault();

    const description = document.getElementById('event-description').value.trim();
    const color = document.getElementById('event-color').value;
    const hasTheater = document.getElementById('event-theater').checked;
    const notes = document.getElementById('event-notes').value.trim();
    const dateStr = document.getElementById('event-date').value;
    const endDateStr = document.getElementById('event-end-date').value;

    if (!dateStr) {
      alert('Please select a date');
      return;
    }

    // Validate end date
    if (endDateStr && endDateStr < dateStr) {
      alert('End date cannot be before start date');
      return;
    }

    const eventData = {
      date: dateStr,
      endDate: endDateStr || null,
      description: description,
      categoryColor: color,
      hasTheaterReservation: hasTheater,
      eventNotes: notes
    };

    this.saveEvent(eventData);
  },

  // Initialize event form
  init() {
    const form = document.getElementById('event-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Close panel button
    const closeBtn = document.getElementById('close-event-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hidePanel());
    }
  }
};

// Export for use in other modules
window.EventManager = EventManager;
