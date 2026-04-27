// Forms Manager - Handles tab switching & form submission
const FormsManager = {
  currentTab: 'ahb',
  initialized: false,

  init() {
    if (this.initialized) return;

    const ahbForm = document.getElementById('ahb-form-submit');
    const studioForm = document.getElementById('studio-form-submit');
    const gallagaForm = document.getElementById('gallaga-form-submit');

    if (ahbForm) {
      ahbForm.addEventListener('submit', (e) => this.handleSubmit(e, 'AHB'));
    }

    if (studioForm) {
      studioForm.addEventListener('submit', (e) => this.handleSubmit(e, 'Studio'));
    }

    if (gallagaForm) {
      gallagaForm.addEventListener('submit', (e) => this.handleSubmit(e, 'Gallaga'));
    }

    this.initialized = true;
  },

  switchTab(tab, clickEvent = null, options = {}) {
    const { updateRoute = true } = options;
    const targetButton = clickEvent?.currentTarget || document.querySelector(`.tab-btn[data-tab="${tab}"]`);

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.form-panel').forEach(panel => panel.classList.remove('active'));

    if (targetButton) {
      targetButton.classList.add('active');
    }

    const panel = document.getElementById(`${tab}-form`);
    if (panel) {
      panel.classList.add('active');
    }

    this.currentTab = tab;

    if (updateRoute && window.App) {
      if (window.App.isPublicFormsMode()) {
        window.App.navigateToPublicForm(tab);
      } else if (window.AdminManager?.checkLogin()) {
        window.App.navigateToAdminForm(tab);
      }
    }
  },

  async handleSubmit(e, formType) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.target));
    const submitterEmail = formData.emailAddress;

    if (!submitterEmail) {
      alert('Email required');
      return;
    }

    try {
      await SubmissionsManager.submitForm(formType, submitterEmail, formData);
      alert(`${formType} submitted successfully! Awaiting admin approval.`);
      e.target.reset();
    } catch (error) {
      alert(`Submission failed: ${error.message || 'Try again.'}`);
      console.error(error);
    }
  }
};

window.FormsManager = FormsManager;
