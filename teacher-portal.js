
window.TCET_TEACHER = (function () {
  let activeTab = "Mark Attendance";
  let selectedSubject = "Chemistry";
  let selectedDate = "23/11";
  let selectedTime = "10:30 - 11:30";
  let draftStatuses = {};

  const TABS = [
    "Mark Attendance",
    "Enter Exam Marks",
    "Syllabus Progress",
    "Announcements & Tasks"
  ];

  function setTab(tab) {
    activeTab = tab;
    window.TCET_APP.render();
  }

  function setDraftStatus(studentId, status) {
    draftStatuses[studentId] = status;
    window.TCET_APP.render();
  }

  function setAttendanceFilter(field, val) {
    if (field === "subject") selectedSubject = val;
    if (field === "date") selectedDate = val;
    if (field === "time") selectedTime = val;
    window.TCET_APP.render();
  }

function submitLiveAttendance() {
    const db = window.TCET_DB;
    const dateVal = selectedDate || "Today";
    const timeVal = selectedTime || "10:30 - 11:30";

    db.saveState(function (s) {
      if (!s.attendance) s.attendance = {};
      if (!s.attendance[selectedSubject]) s.attendance[selectedSubject] = [];
      if (!s.attendanceByStudent) s.attendanceByStudent = {};

      const baseLogs = s.attendance[selectedSubject].slice();
      (s.users.students || []).forEach(function (st) {
        const stStatus = draftStatuses[st.id] || "Present";
        if (!s.attendanceByStudent[st.id]) s.attendanceByStudent[st.id] = {};
        if (!s.attendanceByStudent[st.id][selectedSubject]) {
          s.attendanceByStudent[st.id][selectedSubject] = baseLogs.map(function (e) {
            return { date: e.date, time: e.time, status: e.status };
          });
        }
        s.attendanceByStudent[st.id][selectedSubject].push({
          date: dateVal,
          time: timeVal,
          status: stStatus
        });
      });
    }, "Live Attendance: " + selectedSubject + " (" + dateVal + ") saved");

    window.TCET_APP.showToast("Attendance saved LIVE for all students!");
  }

  function renderMarkAttendance() {
    const db = window.TCET_DB;
    const state = db.getState();
    const students = state.users.students;
    const subjects = ["Maths", "Chemistry", "EM", "PPS", "IIKS"];

    const subOpts = subjects.map(function (s) {
      return '<option value="' + s + '" ' + (selectedSubject === s ? "selected" : "") + ">" + s + "</option>";
    }).join("");

    const rows = students.map(function (st) {
      const current = draftStatuses[st.id] || "Present";
      return (
        "<tr>" +
          "<td><strong>" + st.rollNo + "</strong></td>" +
          "<td>" + st.name + " <small style=\"color:#64748b;\">(" + st.id + ")</small></td>" +
          "<td>" + st.branch + " - " + st.division + "</td>" +
          "<td>" +
            '<div class="att-toggle-group">' +
              '<button type="button" class="att-toggle-btn ' + (current === "Present" ? "selected-Present" : "") + '" data-action="teacher-set-att" data-student="' + st.id + '" data-status="Present">Present</button>' +
              '<button type="button" class="att-toggle-btn ' + (current === "Absent" ? "selected-Absent" : "") + '" data-action="teacher-set-att" data-student="' + st.id + '" data-status="Absent">Absent</button>' +
              '<button type="button" class="att-toggle-btn ' + (current === "Cancelled" ? "selected-Cancelled" : "") + '" data-action="teacher-set-att" data-student="' + st.id + '" data-status="Cancelled">Cancelled</button>' +
            "</div>" +
          "</td>" +
        "</tr>"
      );
    }).join("");

    return (
      '<div class="kpi-row">' +
        '<div class="kpi-card"><small>Division B Strength</small><div class="kpi-val">' + students.length + "</div></div>" +
        '<div class="kpi-card"><small>' + selectedSubject + ' Avg</small><div class="kpi-val">' + db.calcSubjectAttendance(selectedSubject) + "%</div></div>" +
        '<div class="kpi-card"><small>Overall Class Avg</small><div class="kpi-val">' + db.calcOverallAttendance() + "%</div></div>" +
        '<div class="kpi-card"><small>Live DB Sync</small><div class="kpi-val" style="font-size:18px;margin-top:10px;">Active</div></div>' +
      "</div>" +
      '<div class="card">' +
        '<h3 class="card-title">Mark Real-Time Lecture Attendance</h3>' +
        '<div class="toolbar-row">' +
          '<div class="form-group"><label>Subject</label><select id="t-att-subject" class="form-input" data-action="teacher-filter" data-field="subject">' + subOpts + "</select></div>" +
          '<div class="form-group"><label>Lecture Date</label><input id="t-att-date" class="form-input" value="' + selectedDate + '" data-action="teacher-filter" data-field="date" /></div>' +
          '<div class="form-group"><label>Time Slot</label><input id="t-att-time" class="form-input" value="' + selectedTime + '" data-action="teacher-filter" data-field="time" /></div>' +
          '<div><button type="button" class="btn-primary btn-teacher" data-action="teacher-submit-att">Submit Attendance Live</button></div>' +
        "</div>" +
        '<table class="data-table">' +
          "<thead><tr><th>Roll</th><th>Student</th><th>Batch</th><th>Attendance Status</th></tr></thead>" +
          "<tbody>" + rows + "</tbody>" +
        "</table>" +
      "</div>"
    );
  }

  function renderExamMarks() {
    const state = window.TCET_DB.getState();
    const examNames = Object.keys(state.exams);
    const examOpts = examNames.map(function (n) {
      return '<option value="' + n + '">' + n + "</option>";
    }).join("");

    return (
      '<div class="card">' +
        '<h3 class="card-title">Publish / Update Exam Marks (FE AIML Div B)</h3>' +
        '<form id="teacher-marks-form">' +
          '<div class="toolbar-row">' +
            '<div class="form-group"><label>Examination</label><select id="tm-exam" class="form-input">' + examOpts + "</select></div>" +
            '<div class="form-group"><label>Math (%)</label><input id="tm-Math" class="form-input" type="number" min="0" max="100" value="85" required /></div>' +
            '<div class="form-group"><label>Chem (%)</label><input id="tm-Chem" class="form-input" type="number" min="0" max="100" value="82" required /></div>' +
          "</div>" +
          '<div class="toolbar-row">' +
            '<div class="form-group"><label>EM (%)</label><input id="tm-EM" class="form-input" type="number" min="0" max="100" value="90" required /></div>' +
            '<div class="form-group"><label>PPS (%)</label><input id="tm-PPS" class="form-input" type="number" min="0" max="100" value="88" required /></div>' +
            '<div class="form-group"><label>IIKS (%)</label><input id="tm-IIKS" class="form-input" type="number" min="0" max="100" value="86" required /></div>' +
          "</div>" +
          '<button type="submit" class="btn-primary btn-teacher" style="max-width:260px;">Save &amp; Publish Marks</button>' +
        "</form>" +
      "</div>"
    );
  }

  function renderSyllabusProgress() {
    const state = window.TCET_DB.getState();
    const blocks = Object.keys(state.syllabus).map(function (subKey) {
      const mods = state.syllabus[subKey].map(function (m, idx) {
        return (
          '<div style="display:flex;align-items:center;gap:14px;padding:8px 0;border-bottom:1px solid #e2e8f0;">' +
            '<div style="flex:1;font-weight:600;">Module ' + m.id + ": " + m.title + "</div>" +
            '<input type="range" min="0" max="100" step="5" value="' + m.completion + '" data-action="teacher-syllabus-slider" data-subject="' + subKey + '" data-index="' + idx + '" style="width:160px;accent-color:#0f766e;" />' +
            '<strong style="width:44px;text-align:right;color:#0f766e;">' + m.completion + "%</strong>" +
          "</div>"
        );
      }).join("");
      return '<div class="card" style="margin-bottom:16px;"><h3 class="card-title">' + subKey + " Modules</h3>" + mods + "</div>";
    }).join("");
    return blocks;
  }

  function renderAnnouncementsAndTasks() {
    return (
      '<div class="announcements-grid">' +
        '<div class="card">' +
          '<h3 class="card-title">Post New Announcement</h3>' +
          '<form id="teacher-ann-form">' +
            '<div class="form-group"><label>Category</label><select id="ta-cat" class="form-input"><option value="Academic">Academic</option><option value="Events">Events</option></select></div>' +
            '<div class="form-group"><label>Title</label><input id="ta-title" class="form-input" placeholder="e.g. Chemistry Viva Schedule" required /></div>' +
            '<div class="form-group"><label>Details</label><textarea id="ta-body" class="form-input" rows="3" placeholder="Enter circular details..." required></textarea></div>' +
            '<div class="form-group"><label>Contact Info</label><input id="ta-contact" class="form-input" value="Prof. Rajesh Sharma on +91 98201 11223" required /></div>' +
            '<button type="submit" class="btn-primary btn-teacher">Publish Announcement</button>' +
          "</form>" +
        "</div>" +
        '<div class="card">' +
          '<h3 class="card-title">Add Upcoming Submission</h3>' +
          '<form id="teacher-sub-form">' +
            '<div class="form-group"><label>Submission Topic</label><input id="ts-topic" class="form-input" placeholder="e.g. PPS Mini Project Report" required /></div>' +
            '<div class="form-group"><label>Due Date (DD/MM)</label><input id="ts-date" class="form-input" placeholder="e.g. 25/11" required /></div>' +
            '<div class="form-group"><label>Timeline Group</label><select id="ts-group" class="form-input"><option value="thisWeek">This week</option><option value="thisMonth">This month</option></select></div>' +
            '<button type="submit" class="btn-primary btn-teacher">Add Submission Live</button>' +
          "</form>" +
        "</div>" +
      "</div>"
    );
  }

  function render(session) {
    const state = window.TCET_DB.getState();
    const teacher = state.users.teachers.find(function (t) { return t.id === session.userId; }) || state.users.teachers[0];

    const navHtml = TABS.map(function (tab) {
      return '<button type="button" class="nav-item ' + (activeTab === tab ? "active" : "") + '" data-action="teacher-tab" data-tab="' + tab + '">' + tab + "</button>";
    }).join("");

    let bodyHtml = "";
    if (activeTab === "Mark Attendance") bodyHtml = renderMarkAttendance();
    else if (activeTab === "Enter Exam Marks") bodyHtml = renderExamMarks();
    else if (activeTab === "Syllabus Progress") bodyHtml = renderSyllabusProgress();
    else if (activeTab === "Announcements & Tasks") bodyHtml = renderAnnouncementsAndTasks();

    return (
      '<div class="erp-shell role-teacher">' +
        '<div class="erp-logo-cell">' +
          '<div class="sketch-logo-square">' + window.TCET_AUTH.getLogoSvg(24) + "</div>" +
          '<div class="logo-text-stack"><strong>TCET</strong><span>Teacher Portal</span></div>' +
        "</div>" +
        '<header class="erp-topbar">' +
          '<h1 class="topbar-title">' + activeTab + "</h1>" +
          '<div class="topbar-right">' +
            '<span class="db-badge"><span class="db-dot"></span>Faculty Live Sync</span>' +
            '<div style="font-size:13.5px;font-weight:700;color:#0f766e;">' + teacher.name + "</div>" +
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
    setDraftStatus: setDraftStatus,
    setAttendanceFilter: setAttendanceFilter,
    submitLiveAttendance: submitLiveAttendance,
    render: render
  };
})();
