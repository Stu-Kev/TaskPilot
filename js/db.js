// IndexedDB Layer using Dexie.js
const db = new Dexie('TaskPilotDB');

// Define database schema
db.version(1).stores({
  events: '++id, date, endDate, description, categoryColor, hasTheaterReservation, eventNotes, createdTimestamp, updatedTimestamp',
  notes: '++id, content, createdDate, lastModifiedDate'
});

// Event CRUD operations
const EventDB = {
  // Create a new event
  async create(eventData) {
    const now = Date.now();
    const event = {
      date: eventData.date,
      endDate: eventData.endDate || null,
      description: eventData.description || '',
      categoryColor: eventData.categoryColor || '#3498db',
      hasTheaterReservation: eventData.hasTheaterReservation || false,
      eventNotes: eventData.eventNotes || '',
      createdTimestamp: now,
      updatedTimestamp: now
    };
    return await db.events.add(event);
  },

  // Get all events
  async getAll() {
    return await db.events.toArray();
  },

  // Get events by date (including multi-day events)
  async getByDate(date) {
    const allEvents = await db.events.toArray();
    return allEvents.filter(event => {
      if (event.date === date) return true;
      if (event.endDate) {
        return date >= event.date && date <= event.endDate;
      }
      return false;
    });
  },

  // Get event by ID
  async getById(id) {
    return await db.events.get(id);
  },

  // Update event
  async update(id, updates) {
    updates.updatedTimestamp = Date.now();
    return await db.events.update(id, updates);
  },

  // Delete event
  async delete(id) {
    return await db.events.delete(id);
  },

  // Get events for a date range (for calendar display)
  async getByDateRange(startDate, endDate) {
    const allEvents = await db.events.toArray();
    return allEvents.filter(event => {
      if (event.endDate) {
        // Event spans across the range
        return event.date <= endDate && event.endDate >= startDate;
      }
      return event.date >= startDate && event.date <= endDate;
    });
  },

  // Get all events sorted by date
  async getAllSorted() {
    return await db.events.orderBy('date').toArray();
  }
};

// Note CRUD operations
const NoteDB = {
  // Create a new note
  async create(content) {
    const now = Date.now();
    const note = {
      content: content || '',
      createdDate: now,
      lastModifiedDate: now
    };
    return await db.notes.add(note);
  },

  // Get all notes
  async getAll() {
    return await db.notes.toArray();
  },

  // Get note by ID
  async getById(id) {
    return await db.notes.get(id);
  },

  // Update note
  async update(id, content) {
    return await db.notes.update(id, {
      content: content,
      lastModifiedDate: Date.now()
    });
  },

  // Delete note
  async delete(id) {
    return await db.notes.delete(id);
  },

  // Get all notes sorted by date (newest first)
  async getAllSorted() {
    return await db.notes.orderBy('createdDate').reverse().toArray();
  }
};

// Export for use in other modules
window.EventDB = EventDB;
window.NoteDB = NoteDB;
