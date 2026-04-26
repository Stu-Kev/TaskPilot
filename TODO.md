# TaskPilot - Reservation System Implementation

Status: **PLAN APPROVED** ✅ Ready to Execute

## New Feature: User/Admin Reservation Workflow
**OLD CLUB BOOKINGS → INTEGRATED INTO NEW SYSTEM**

## Breakdown Steps (Sequential Execution)

### Phase 1: Database Schema v3
- [ ] **js/db.js**: Add v3 w/ `submissions` (pending forms), `reservations` (approved)
  * submissions: ++id, type, status(pending/approved/rejected), submitterEmail, formData(JSON), submittedDate, reviewedDate
  * Auto-migrate existing events

### Phase 2: UI Structure
- [ ] **index.html**: 
  * Sidebar nav: 'Forms' (user tabs: AHB/Studio/Gallaga), 'Admin' (login-gated)
  * #forms-container (tabbed forms HTML w/ all fields)
  * #admin-container (table + approve/reject)
  * Login modal for admin
- [ ] **css/styles.css**: Form grids, admin table, tabs, status badges

### Phase 3: Core Logic
- [ ] **js/submissions.js** (new): SubmissionDB CRUD
- [ ] **js/forms.js** (new): Tab switch, form validation, submit→pending
- [ ] **js/admin.js** (new): Login check, list pending, approve→EventDB + calendar refresh
- [ ] **js/app.js**: switchView('forms'|'admin'), role=localStorage.adminKey

### Phase 4: Integration & Test
- [ ] Update app.js load order, sw.js cache
- [ ] Test flow: QR→form→submit→admin login→approve→calendar
- [ ] Responsive mobile QR access

## Progress Tracking
**Current: Step 0 - Creating this TODO**

**Next: Phase 1 (DB Schema) → Confirm → Edit files**

