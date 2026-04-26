// Submissions & Reservations Management Module
// Handles CRUD for reservation workflow

const SubmissionsManager = {
  // Submit new form
  async submitForm(formType, submitterEmail, formData) {
    try {
      const submissionId = await SubmissionDB.create(formType, submitterEmail, formData);
      console.log(`Submission ${submissionId} created: ${formType}`);
      return submissionId;
    } catch (error) {
      console.error('Submission failed:', error);
      throw error;
    }
  },

  // Admin: Get all pending submissions
  async getPendingSubmissions() {
    return await SubmissionDB.getPending();
  },

  // Admin: Approve submission → create event + reservation record
  async approveSubmission(submissionId, reviewerNotes = '') {
    try {
      const submission = await SubmissionDB.getById(submissionId);
      if (!submission || submission.status !== 'pending') {
        throw new Error('Invalid submission');
      }

      const formData = submission.formData;
      // Map form fields to event (customize per type)
      const eventData = this.mapFormToEvent(submission.type, formData);

      // Create event
      const eventId = await EventDB.create(eventData);

      // Create reservation record
      await ReservationsDB.createFromSubmission(submissionId, eventId);

      // Update submission status
      await SubmissionDB.updateStatus(submissionId, 'approved', reviewerNotes);

      // Refresh calendar
      if (window.Calendar) Calendar.refresh();

      return { eventId, submissionId };
    } catch (error) {
      console.error('Approval failed:', error);
      throw error;
    }
  },

  // Admin: Reject submission
  async rejectSubmission(submissionId, reviewerNotes = '') {
    return await SubmissionDB.updateStatus(submissionId, 'rejected', reviewerNotes);
  },

  // Map form data to EventDB format (type-specific)
  mapFormToEvent(type, formData) {
    const baseEvent = {
      date: formData.eventDate || formData.dateNeeded || formData.beginningDate || null,
      endDate: formData.endingDate || null,
      description: formData.nameOfEvent || formData.purpose || formData.nameOfActivity || 'Reservation',
      categoryColor: '#e74c3c', // Red for reservations
      eventNotes: JSON.stringify({ 
        type, 
        submitter: formData.personInquiring || formData.requestedBy || '',
        email: formData.emailAddress,
        details: formData
      }, null, 2),
      attire: formData.artistsAttire || '',
      location: formData.venueOfEvent || formData.venueNeeded || ''
    };

    return baseEvent;
  },

  // Get submission details formatted
  async getFormattedSubmission(id) {
    const sub = await SubmissionDB.getById(id);
    return sub ? {
      ...sub,
      formData: JSON.parse(sub.formData || '{}') // Ensure parsed
    } : null;
  }
};

// Export
window.SubmissionsManager = SubmissionsManager;

