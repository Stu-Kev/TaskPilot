// Notes Management Module
const NotesManager = {
  currentNoteId: null,
  isEditing: false,

  // Show notes view
  async showNotesView() {
    const notesContainer = document.getElementById('notes-container');
    const calendarContainer = document.getElementById('calendar-container');
    
    if (calendarContainer) {
      calendarContainer.style.display = 'none';
    }
    if (notesContainer) {
      notesContainer.style.display = 'block';
      await this.loadNotes();
    }
  },

  // Show calendar view
  showCalendarView() {
    const notesContainer = document.getElementById('notes-container');
    const calendarContainer = document.getElementById('calendar-container');
    
    if (notesContainer) {
      notesContainer.style.display = 'none';
    }
    if (calendarContainer) {
      calendarContainer.style.display = 'block';
      Calendar.refresh();
    }
  },

  // Load and render all notes
  async loadNotes() {
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;

    const notes = await NoteDB.getAllSorted();

    if (notes.length === 0) {
      notesList.innerHTML = '<p class="no-notes">No notes yet. Create your first note!</p>';
      return;
    }

    let html = '';
    notes.forEach(note => {
      const createdDate = new Date(note.createdDate);
      const modifiedDate = new Date(note.lastModifiedDate);
      const dateStr = this.formatDate(createdDate);
      const timeStr = this.formatTime(createdDate);
      const isModified = note.lastModifiedDate !== note.createdDate;

      html += `
        <div class="note-item" data-id="${note.id}">
          <div class="note-header">
            <span class="note-date">${dateStr} at ${timeStr}</span>
            ${isModified ? '<span class="note-modified">(Edited)</span>' : ''}
          </div>
          <div class="note-content">${this.escapeHtml(note.content)}</div>
          <div class="note-actions">
            <button class="edit-note-btn" onclick="NotesManager.editNote(${note.id})">Edit</button>
            <button class="delete-note-btn" onclick="NotesManager.deleteNote(${note.id})">Delete</button>
          </div>
        </div>
      `;
    });
    notesList.innerHTML = html;
  },

  // Format date for display
  formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  },

  // Format time for display
  formatTime(date) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('en-US', options);
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Create new note
  createNote() {
    const noteContent = document.getElementById('note-content');
    if (!noteContent) return;

    this.currentNoteId = null;
    this.isEditing = false;
    noteContent.value = '';
    noteContent.focus();

    // Show save button, hide update
    const saveBtn = document.getElementById('save-note-btn');
    const updateBtn = document.getElementById('update-note-btn');
    if (saveBtn) saveBtn.style.display = 'inline-block';
    if (updateBtn) updateBtn.style.display = 'none';
  },

  // Edit existing note
  async editNote(id) {
    const note = await NoteDB.getById(id);
    if (!note) return;

    this.currentNoteId = id;
    this.isEditing = true;

    const noteContent = document.getElementById('note-content');
    if (noteContent) {
      noteContent.value = note.content;
      noteContent.focus();
    }

    // Show update button, hide save
    const saveBtn = document.getElementById('save-note-btn');
    const updateBtn = document.getElementById('update-note-btn');
    if (saveBtn) saveBtn.style.display = 'none';
    if (updateBtn) updateBtn.style.display = 'inline-block';
  },

  // Save new note
  async saveNote() {
    const noteContent = document.getElementById('note-content');
    const content = noteContent ? noteContent.value.trim() : '';

    if (!content) {
      alert('Please enter some content for your note');
      return;
    }

    try {
      await NoteDB.create(content);
      
      // Clear textarea
      if (noteContent) {
        noteContent.value = '';
      }

      // Refresh notes list
      await this.loadNotes();

      // Reset buttons
      const saveBtn = document.getElementById('save-note-btn');
      const updateBtn = document.getElementById('update-note-btn');
      if (saveBtn) saveBtn.style.display = 'inline-block';
      if (updateBtn) updateBtn.style.display = 'none';
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  },

  // Update existing note
  async updateNote() {
    const noteContent = document.getElementById('note-content');
    const content = noteContent ? noteContent.value.trim() : '';

    if (!content) {
      alert('Please enter some content for your note');
      return;
    }

    if (!this.currentNoteId) {
      alert('No note selected for update');
      return;
    }

    try {
      await NoteDB.update(this.currentNoteId, content);
      
      // Clear textarea
      if (noteContent) {
        noteContent.value = '';
      }

      // Refresh notes list
      await this.loadNotes();

      // Reset buttons
      const saveBtn = document.getElementById('save-note-btn');
      const updateBtn = document.getElementById('update-note-btn');
      if (saveBtn) saveBtn.style.display = 'inline-block';
      if (updateBtn) updateBtn.style.display = 'none';

      this.currentNoteId = null;
      this.isEditing = false;
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    }
  },

  // Delete note
  async deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await NoteDB.delete(id);
      
      // Refresh notes list
      await this.loadNotes();

      // Clear textarea if deleted note was being edited
      if (this.currentNoteId === id) {
        const noteContent = document.getElementById('note-content');
        if (noteContent) {
          noteContent.value = '';
        }
        this.currentNoteId = null;
        this.isEditing = false;

        const saveBtn = document.getElementById('save-note-btn');
        const updateBtn = document.getElementById('update-note-btn');
        if (saveBtn) saveBtn.style.display = 'inline-block';
        if (updateBtn) updateBtn.style.display = 'none';
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  },

  // Initialize notes
  init() {
    // These are initialized by app.js after DOM is ready
  }
};

// Export for use in other modules
window.NotesManager = NotesManager;
