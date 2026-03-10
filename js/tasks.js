// Tasks Management Module
const TasksManager = {
  currentTaskId: null,

  // Show tasks view
  async showTasksView() {
    const tasksContainer = document.getElementById('tasks-container');
    const calendarContainer = document.getElementById('calendar-container');
    const notesContainer = document.getElementById('notes-container');
    
    if (calendarContainer) {
      calendarContainer.style.display = 'none';
    }
    if (notesContainer) {
      notesContainer.style.display = 'none';
    }
    if (tasksContainer) {
      tasksContainer.style.display = 'block';
      await this.loadTasks();
    }
  },

  // Show calendar view
  showCalendarView() {
    const tasksContainer = document.getElementById('tasks-container');
    const calendarContainer = document.getElementById('calendar-container');
    
    if (tasksContainer) {
      tasksContainer.style.display = 'none';
    }
    if (calendarContainer) {
      calendarContainer.style.display = 'block';
      Calendar.refresh();
    }
  },

  // Show notes view
  showNotesView() {
    const tasksContainer = document.getElementById('tasks-container');
    const notesContainer = document.getElementById('notes-container');
    
    if (tasksContainer) {
      tasksContainer.style.display = 'none';
    }
    if (notesContainer) {
      notesContainer.style.display = 'block';
      NotesManager.loadNotes();
    }
  },

  // Update task count badge
  async updateTaskCount() {
    const badge = document.getElementById('task-count-badge');
    if (badge) {
      const count = await TaskDB.getActiveCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  // Load and render all tasks
  async loadTasks() {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;

    const tasks = await TaskDB.getAllSorted();

    if (tasks.length === 0) {
      tasksList.innerHTML = '<p class="no-tasks">No tasks yet. Create your first task!</p>';
      await this.updateTaskCount();
      return;
    }

    let html = '';
    tasks.forEach(task => {
      const createdDate = new Date(task.createdDate);
      const dateStr = this.formatDate(createdDate);
      const timeStr = this.formatTime(createdDate);

      html += `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="task-checkbox" onclick="TasksManager.toggleTask(${task.id})">
            ${task.completed ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </div>
          <div class="task-content">
            <div class="task-title">${this.escapeHtml(task.title)}</div>
            <div class="task-date">${dateStr} at ${timeStr}</div>
          </div>
          <div class="task-actions">
            <button class="delete-task-btn" onclick="TasksManager.deleteTask(${task.id})">Delete</button>
          </div>
        </div>
      `;
    });
    tasksList.innerHTML = html;

    // Update badge count
    await this.updateTaskCount();
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

  // Create new task - focus on input
  createTask() {
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
      taskInput.value = '';
      taskInput.focus();
    }
  },

  // Add new task
  async addTask() {
    const taskInput = document.getElementById('task-input');
    const title = taskInput ? taskInput.value.trim() : '';

    if (!title) {
      alert('Please enter a task');
      return;
    }

    try {
      await TaskDB.create(title);
      
      // Clear input
      if (taskInput) {
        taskInput.value = '';
      }

      // Refresh tasks list
      await this.loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  },

  // Toggle task completed status
  async toggleTask(id) {
    try {
      await TaskDB.toggleComplete(id);
      
      // Refresh tasks list
      await this.loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Failed to update task. Please try again.');
    }
  },

  // Delete task
  async deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await TaskDB.delete(id);
      
      // Refresh tasks list
      await this.loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  },

  // Initialize tasks
  init() {
    // Handle Enter key in task input
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addTask();
        }
      });
    }
  }
};

// Export for use in other modules
window.TasksManager = TasksManager;

