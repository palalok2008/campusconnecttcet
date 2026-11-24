

window.TCET_ADMIN = (function () {
  let activeTab = "Overview";

  const TABS = [
    "Overview",
    "Manage Users",
    "Timetable Editor",
    "Database Setup"
  ];

  function setTab(tab) {
    activeTab = tab;
    window.TCET_APP.render();
  }

  function renderOverview() {
    const db = window.TCET_DB;
    const state = db.getState();
    const isCloud = Boolean(db.getFirebaseUrl());

    const annRows = state.announcements.map(function (a) {
      return (
        "<tr>" +
          "<td><strong>" + a.title + "</strong></td>" +
          "<td>" + a.category + "</td>" +
          "<td>" + a.date + "</td>" +
          '<td><button type="button" class="btn-outline" data-action="admin-del-ann" data-id="' + a.id + '">Delete</button></td>' +
        "</tr>"
      );
    }).join("");

    return (
      '<div class="kpi-row">' +
        '<div class="kpi-card"><small>Total Students</small><div class="kpi-val">' + state.users.students.length + "</div></div>" +
        '<div class="kpi-card"><small>Total Faculty</small><div class="kpi-val">' + state.users.teachers.length + "</div></div>" +
        '<div class="kpi-card"><small>Avg Attendance</small><div class="kpi-val">' + db.calcOverallAttendance() + "%</div></div>" +
        '<div class="kpi-card"><small>Backend Mode</small><div class="kpi-val" style="font-size:17px;margin-top:10px;">' + (isCloud ? "Firebase Cloud" : "Local Live") + "</div></div>" +
      "</div>" +
      '<div class="card">' +
        '<h3 class="card-title">Manage Campus Announcements</h3>' +
        '<table class="data-table">' +
          "<thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Action</th></tr></thead>" +
          "<tbody>" + annRows + "</tbody>" +
        "</table>" +
      "</div>"
    );
  }

  function renderManageUsers() {
    const state = window.TCET_DB.getState();
    const rows = state.users.students.map(function (s) {
      return (
        "<tr>" +
          "<td><strong>" + s.id + "</strong></td>" +
          "<td>" + s.name + "</td>" +
          "<td>" + s.branch + " / Div " + s.division + "</td>" +
          "<td>" + s.rollNo + "</td>" +
        "</tr>"
      );
    }).join("");

    return (
      '<div class="announcements-grid">' +
        '<div class="card">' +
          '<h3 class="card-title">Enrolled Students (FE AIML)</h3>' +
          '<table class="data-table">' +
            "<thead><tr><th>ID</th><th>Name</th><th>Branch</th><th>Roll</th></tr></thead>" +
            "<tbody>" + rows + "</tbody>" +
          "</table>" +
        "</div>" +
        '<div class="card">' +
          '<h3 class="card-title">Register New Student</h3>' +
          '<form id="admin-add-student-form">' +
            '<div class="form-group"><label>Student ID</label><input id="as-id" class="form-input" placeholder="e.g. STU202605" required /></div>' +
            '<div class="form-group"><label>Full Name</label><input id="as-name" class="form-input" placeholder="e.g. Kabir Mehta" required /></div>' +
            '<div class="form-group"><label>Roll Number</label><input id="as-roll" class="form-input" placeholder="e.g. B-18" required /></div>' +
            '<div class="form-group"><label>Division</label><input id="as-div" class="form-input" value="B" required /></div>' +
            '<button type="submit" class="btn-primary btn-admin">Add Student Account</button>' +
          "</form>" +
        "</div>" +
      "</div>"
    );
  }

  function renderTimetableEditor() {
    const state = window.TCET_DB.getState();
    const dayOpts = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(function (d) {
      return '<option value="' + d + '">' + d + "</option>";
    }).join("");
    const slotOpts = state.timeSlots.map(function (t) {
      return '<option value="' + t + '">' + t + "</option>";
    }).join("");

    return (
      '<div class="card" style="max-width:640px;">' +
        '<h3 class="card-title">Update Weekly Timetable Slot (Live)</h3>' +
        '<form id="admin-tt-form">' +
          '<div class="toolbar-row">' +
            '<div class="form-group"><label>Day</label><select id="att-day" class="form-input">' + dayOpts + "</select></div>" +
            '<div class="form-group"><label>Time Slot</label><select id="att-slot" class="form-input">' + slotOpts + "</select></div>" +
          "</div>" +
          '<div class="toolbar-row">' +
            '<div class="form-group"><label>Subject (leave blank to clear)</label><input id="att-sub" class="form-input" placeholder="e.g. Math / PPS Lab" /></div>' +
            '<div class="form-group"><label>Faculty Name</label><input id="att-fac" class="form-input" placeholder="e.g. Prof. Joshi" /></div>' +
          "</div>" +
          '<button type="submit" class="btn-primary btn-admin" style="max-width:240px;">Update Timetable Live</button>' +
        "</form>" +
      "</div>"
    );
  }

  function renderDatabaseSetup() {
    const currentUrl = window.TCET_DB.getFirebaseUrl();
    return (
      '<div class="card" style="max-width:720px;">' +
        '<h3 class="card-title">Firebase Realtime Database Backend</h3>' +
        '<p style="font-size:14px;color:#475569;margin-top:0;">Paste your free <strong>Firebase Realtime Database URL</strong> below to sync attendance, marks, and announcements live across different laptops and mobile phones. Leave empty to use instant Local Real-Time Sync across browser tabs.</p>' +
        '<form id="admin-fb-form">' +
          '<div class="form-group">' +
            '<label for="fb-url-input">Firebase Realtime Database URL (HTTPS)</label>' +
            '<input id="fb-url-input" class="form-input" type="url" placeholder="https://your-project-default-rtdb.firebaseio.com" value="' + currentUrl + '" />' +
          "</div>" +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            '<button type="submit" class="btn-primary btn-admin" style="width:auto;padding:11px 20px;">Save Firebase Connection</button>' +
            '<button type="button" class="btn-outline" data-action="admin-reset-db">Reset Demo Data to Defaults</button>' +
          "</div>" +
        "</form>" +
      "</div>"
    );
  }

  function render(session) {
    const state = window.TCET_DB.getState();
    const admin = state.users.admins.find(function (a) { return a.id === session.userId; }) || state.users.admins[0];

    const navHtml = TABS.map(function (tab) {
      return '<button type="button" class="nav-item ' + (activeTab === tab ? "active" : "") + '" data-action="admin-tab" data-tab="' + tab + '">' + tab + "</button>";
    }).join("");

    let bodyHtml = "";
    if (activeTab === "Overview") bodyHtml = renderOverview();
    else if (activeTab === "Manage Users") bodyHtml = renderManageUsers();
    else if (activeTab === "Timetable Editor") bodyHtml = renderTimetableEditor();
    else if (activeTab === "Database Setup") bodyHtml = renderDatabaseSetup();

    return (
      '<div class="erp-shell role-admin">' +
        '<div class="erp-logo-cell">' +
          '<div class="sketch-logo-square">' + window.TCET_AUTH.getLogoSvg(24) + "</div>" +
          '<div class="logo-text-stack"><strong>TCET</strong><span>Admin Portal</span></div>' +
        "</div>" +
        '<header class="erp-topbar">' +
          '<h1 class="topbar-title">' + activeTab + "</h1>" +
          '<div class="topbar-right">' +
            '<div style="font-size:13.5px;font-weight:700;color:#b45309;">' + admin.name + "</div>" +
          "</div>" +
        "</header>" +
        '<aside class="erp-sidebar">' +
          '<nav class="sidebar-nav">' + navHtml + "</nav>" +
          '<div class="sidebar-footer">' +
            '<button type="button" class="logout-btn" data-action="logout">Logout / Switch Role</button>' +
          "</div>" +
        "</aside>" +
        '<main class="erp-main">' + bodyHtml + "</main>" +
      "</div>"
    );
  }

  return {
    setTab: setTab,
    render: render
  };
})();
