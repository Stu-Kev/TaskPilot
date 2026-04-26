// Admin Manager - Login gate + Waitlist
const AdminManager = {
  ADMIN_PASSWORD: 'admin123', // Change this!
  isLoggedIn: false,

  showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
  },

  hideLogin() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
  },

  login() {
    const password = document.getElementById('login-password').value;
    if (password === this.ADMIN_PASSWORD) {
      localStorage.setItem('adminLoggedIn', 'true');
      this.isLoggedIn = true;
      this.hideLogin();
      App.handleCurrentRoute();
    } else {
      alert('Invalid password');
    }
  },

  logout() {
    localStorage.removeItem('adminLoggedIn');
    this.isLoggedIn = false;
    location.reload();
  },

  checkLogin() {
    if (localStorage.getItem('adminLoggedIn')) {
      this.isLoggedIn = true;
    }
    return this.isLoggedIn;
  },

  async renderPending() {
    const submissions = await SubmissionsManager.getPendingSubmissions();
    
    // Update badge
    const badge = document.getElementById('waitlist-count-badge');
    if (badge) {
      badge.textContent = submissions.length;
      badge.style.display = submissions.length > 0 ? 'flex' : 'none';
    }
    
    document.getElementById('pending-count').textContent = submissions.length;

    const tbody = document.querySelector('#pending-table tbody');
    tbody.innerHTML = '';

    if (submissions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-light)">No pending submissions</td></tr>';
      return;
    }

    for (const sub of submissions) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${sub.id}</td>
        <td>${sub.type}</td>
        <td>${sub.submitterEmail}</td>
        <td>${new Date(sub.submittedDate).toLocaleDateString()}</td>
        <td><span class="status-badge status-${sub.status}">${sub.status.toUpperCase()}</span></td>
        <td>
          <button class="action-btn approve-btn" onclick="AdminManager.approve(${sub.id})">Approve</button>
          <button class="action-btn reject-btn" onclick="AdminManager.reject(${sub.id})">Reject</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  },

  async approve(id) {
    if (confirm('Approve this submission?')) {
      try {
        await SubmissionsManager.approveSubmission(id, 'Approved by admin');
        alert('Approved! Added to calendar.');
        await this.renderPending();
      } catch (e) {
        alert('Error approving');
      }
    }
  },

  async reject(id) {
    const notes = prompt('Reject reason:');
    if (notes !== null && confirm('Reject this submission?')) {
      try {
        await SubmissionsManager.rejectSubmission(id, notes || 'Rejected');
        await this.renderPending();
      } catch (e) {
        alert('Error rejecting');
      }
    }
  }
};

window.AdminManager = AdminManager;

