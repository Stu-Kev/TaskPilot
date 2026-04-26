// IndexedDB Layer using Dexie.js
const db = new Dexie('TaskPilotDB');

// Define database schema v1 (original)
db.version(1).stores({
  events: '++id, date, endDate, description, categoryColor, club, hasTheaterReservation, eventNotes, createdTimestamp, updatedTimestamp',
  notes: '++id, content, createdDate, lastModifiedDate',
  tasks: '++id, title, completed, createdDate'
});

// v2: Add attire, location for club bookings
db.version(2).stores({
  events: '++id, date, endDate, description, categoryColor, club, hasTheaterReservation, eventNotes, attire, location, createdTimestamp, updatedTimestamp',
  notes: '++id, content, createdDate, lastModifiedDate',
  tasks: '++id, title, completed, createdDate'
});

// 🔥 FORCE OPEN DATABASE
db.open().catch(err => {
  console.error('DB OPEN FAILED:', err);
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
      club: eventData.club || null,
      hasTheaterReservation: eventData.hasTheaterReservation || false,
      eventNotes: eventData.eventNotes || '',
      attire: eventData.attire || '',
      location: eventData.location || '',
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

  // Helper to display event with new fields
  async getFormatted(id) {
    const event = await this.getById(id);
    if (event) {
      return {
        ...event,
       displayInfo: `${event.attire ? `Attire: ${event.attire}\n` : ''}${event.location ? `Location: ${event.location}` : ''}`.trim()
      };
    }
    return null;
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
  },

  // Get events by club
  async getByClub(clubIndicator) {
    const allEvents = await db.events.toArray();
    return allEvents.filter(event => event.club === clubIndicator);
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

// Task CRUD operations
const TaskDB = {
  // Create a new task
  async create(title) {
    const now = Date.now();
    const task = {
      title: title || '',
      completed: false,
      createdDate: now
    };
    return await db.tasks.add(task);
  },

  // Get all tasks
  async getAll() {
    return await db.tasks.toArray();
  },

  // Get task by ID
  async getById(id) {
    return await db.tasks.get(id);
  },

  // Update task
  async update(id, updates) {
    return await db.tasks.update(id, updates);
  },

  // Toggle task completed status
  async toggleComplete(id) {
    const task = await db.tasks.get(id);
    if (task) {
      return await db.tasks.update(id, { completed: !task.completed });
    }
  },

  // Delete task
  async delete(id) {
    return await db.tasks.delete(id);
  },

  // Get active (incomplete) tasks count
  async getActiveCount() {
    const allTasks = await db.tasks.toArray();
    return allTasks.filter(task => !task.completed).length;
  },

  // Get all tasks sorted by date (newest first)
  async getAllSorted() {
    return await db.tasks.orderBy('createdDate').reverse().toArray();
  }
};

// v3: Reservation workflow tables
db.version(3).stores({
  events: '++id, date, endDate, description, categoryColor, club, hasTheaterReservation, eventNotes, attire, location, createdTimestamp, updatedTimestamp',
  notes: '++id, content, createdDate, lastModifiedDate',
  tasks: '++id, title, completed, createdDate',
  submissions: '++id, type, status, submitterEmail, formData, submittedDate, reviewedDate, reviewerNotes, *type',
  reservations: '++id, submissionId, status, approvedDate, eventId'
});

// Submission CRUD
const SubmissionDB = {
  async create(formType, submitterEmail, formData) {
    const now = Date.now();
    const submission = {
      type: formType, // 'AHB', 'Studio', 'Gallaga'
      status: 'pending',
      submitterEmail,
      formData, // JSON all fields
      submittedDate: now,
      reviewedDate: null,
      reviewerNotes: ''
    };
    return await db.submissions.add(submission);
  },

  async getPending() {
    return await db.submissions.where('status').equals('pending').toArray();
  },

  async getById(id) {
    return await db.submissions.get(id);
  },

  async updateStatus(id, status, reviewerNotes = '') {
    const now = Date.now();
    return await db.submissions.update(id, {
      status,
      reviewedDate: now,
      reviewerNotes
    });
  },

  async getByType(type) {
    return await db.submissions.where('type').equals(type).toArray();
  }
};

// Reservations CRUD
const ReservationsDB = {
  async createFromSubmission(submissionId, eventId) {
    return await db.reservations.add({
      submissionId,
      status: 'approved',
      approvedDate: Date.now(),
      eventId
    });
  },

  async getApproved() {
    return await db.reservations.where('status').equals('approved').toArray();
  }
};

// Export all
window.EventDB = EventDB;
window.NoteDB = NoteDB;
window.TaskDB = TaskDB;
window.SubmissionDB = SubmissionDB;
window.ReservationsDB = ReservationsDB;

