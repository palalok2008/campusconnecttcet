
window.TCET_STUDENT = (function () {
  let activeTab = "Dashboard";
  let currentStudentId="";

  const TABS = [
    "Dashboard",
    "Time Table",
    "Announcements",
    "Exams",
    "Syllabus",
    "Attendance",
    "Study Timer"
  ];

  /* YPT Study Timer live state */
  let yptMode = "stopwatch"; /* "stopwatch" or "pomodoro" */
  let yptSubject = "Maths";
  let yptRunning = false;
  let yptElapsed = 0;        /* current unsaved session seconds */
  let yptPomoRemaining = 25 * 60;
  let yptInterval = null;
  let yptStartClock = "";

  function getTab() {
    return activeTab;
  }

  function setTab(tab) {
    activeTab = tab;
    window.TCET_APP.render();
  }

  function pctClass(val) {
    if (val >= 85) return "pct-high";
    if (val >= 75) return "pct-mid";
    return "pct-low";
  }

  function getStudent(userId) {
    const list = window.TCET_DB.getState().users.students;
    return list.find(function (s) { return s.id === userId; }) || list[0];
  }

  function renderDashboard(student) {
    const db = window.TCET_DB;
    const state = db.getState();

    const dailyHtml = state.submissions.daily.map(function (item) {
      const isEmpty = item.title.toLowerCase() === "nothing";
      return (
        '<div class="day-sub-block">' +
          '<div class="day-sub-label">' + item.date + "</div>" +
          '<div class="day-sub-box ' + (isEmpty ? "empty" : "") + '">' + item.title + "</div>" +
        "</div>"
      );
    }).join("");

    const weekHtml = state.submissions.thisWeek.map(function (item) {
      return '<div class="period-sub-row"><span>' + item.title + "</span><strong>" + item.date + "</strong></div>";
    }).join("");

    const monthHtml = state.submissions.thisMonth.map(function (item) {
      return '<div class="period-sub-row"><span>' + item.title + "</span><strong>" + item.date + "</strong></div>";
    }).join("");

    const tomorrowHtml = state.tomorrowTimetable.map(function (slot) {
      return '<div class="tomorrow-row"><strong>' + slot.subject + "</strong><span>" + slot.time + "</span></div>";
    }).join("");

    const attList = [
      { label: "Math", key: "Maths" },
      { label: "EM", key: "EM" },
      { label: "Chem", key: "Chemistry" },
      { label: "IIKS", key: "IIKS" },
      { label: "PPS", key: "PPS" }
    ];
    const attHtml = attList.map(function (sub) {
      const pct = db.calcSubjectAttendance(student.id);
      return (
        '<div class="mini-att-row" data-action="open-attendance-modal" data-subject="' + sub.key + '">' +
          "<strong>" + sub.label + "</strong>" +
          '<span class="pct-pill ' + pctClass(pct) + '">' + pct + "%</span>" +
        "</div>"
      );
    }).join("");

    const latestAnn = state.announcements.slice(0, 3).map(function (ann) {
      return (
        '<button type="button" class="announcement-pill" data-action="open-announcement-modal" data-id="' + ann.id + '">' +
          "<span>" + ann.title + "</span>" +
          "<small>" + ann.date.slice(0, 5) + "</small>" +
        "</button>"
      );
    }).join("");

    return (
      '<div class="greeting-block">' +
        "<h2>Hey " + student.name + ",</h2>" +
        "<p>(" + student.year + ", " + student.sem + ", " + student.branch + " — Div " + student.division + ")</p>" +
      "</div>" +
      '<div class="dashboard-grid">' +
        '<div class="dashboard-col">' +
          '<div class="card">' +
            '<h3 class="card-title">Upcoming Submissions</h3>' +
            '<div class="submissions-split">' +
              "<div>" + dailyHtml + "</div>" +
              "<div>" +
                '<div class="period-sub-group"><h4>This week</h4>' + weekHtml + "</div>" +
                '<div class="period-sub-group"><h4>This month</h4>' + monthHtml + "</div>" +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="card">' +
            '<h3 class="card-title">Tomorrow\'s Time Table</h3>' +
            tomorrowHtml +
          "</div>" +
        "</div>" +
        '<div class="dashboard-col">' +
          '<div class="card">' +
            '<h3 class="card-title"><span>Attendance</span><small style="font-size:12px;color:#64748b;">Click subject</small></h3>' +
            attHtml +
          "</div>" +
          '<div class="card">' +
            '<h3 class="card-title">Announcements</h3>' +
            latestAnn +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function renderTimeTable() {
    const state = window.TCET_DB.getState();
    const slots = state.timeSlots;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const headerCells = "<th></th>" + slots.map(function (t) {
      return "<th>" + t + "</th>";
    }).join("");

    const rowsHtml = days.map(function (day) {
      const dayData = state.timetable[day] || {};
      const cells = slots.map(function (t) {
        const entry = dayData[t];
        if (!entry) {
          return '<td><div class="tt-slot-empty"></div></td>';
        }
        return (
          '<td><div class="tt-slot-box">' +
            "<strong>" + entry.subject + "</strong>" +
            "<span>" + entry.faculty + "</span>" +
          "</div></td>"
        );
      }).join("");
      return '<tr><td class="tt-day-cell">' + day + "</td>" + cells + "</tr>";
    }).join("");

    const subRows = state.submissions.allList.map(function (s) {
      return "<tr><td>" + s.topic + '</td><td class="right">' + s.date + "</td></tr>";
    }).join("");

    return (
      '<div class="timetable-layout">' +
        '<div class="card">' +
          '<div id="tt-scroll-viewport" class="tt-scroll-viewport">' +
            '<table class="tt-grid-table">' +
              "<thead><tr>" + headerCells + "</tr></thead>" +
              "<tbody>" + rowsHtml + "</tbody>" +
            "</table>" +
          "</div>" +
          '<div class="slider-control-bar">' +
            "<span>&larr; Slider &rarr;</span>" +
            '<input id="tt-horizontal-slider" type="range" min="0" max="100" value="0" aria-label="Scroll timetable horizontally" />' +
          "</div>" +
        "</div>" +
        '<div class="card">' +
          '<h3 class="card-title">Submissions</h3>' +
          '<table class="clickable-table">' +
            '<thead><tr><th>Topic</th><th class="right">Date</th></tr></thead>' +
            "<tbody>" + subRows + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>"
    );
  }

  function renderAnnouncements() {
    const state = window.TCET_DB.getState();
    const academic = state.announcements.filter(function (a) { return a.category === "Academic"; });
    const events = state.announcements.filter(function (a) { return a.category === "Events"; });

    function makePills(list) {
      if (!list.length) return '<p style="color:#64748b;font-size:14px;">No announcements yet.</p>';
      return list.map(function (a) {
        return (
          '<button type="button" class="announcement-pill" data-action="open-announcement-modal" data-id="' + a.id + '">' +
            "<span>" + a.title + "</span>" +
            "<small>" + a.date + "</small>" +
          "</button>"
        );
      }).join("");
    }

    return (
      '<div class="announcements-grid">' +
        '<div class="card">' +
          '<h3 class="column-header-rule">Academic</h3>' +
          makePills(academic) +
        "</div>" +
        '<div class="card">' +
          '<h3 class="column-header-rule">Events</h3>' +
          makePills(events) +
        "</div>" +
      "</div>"
    );
  }

  function renderExams() {
    const db = window.TCET_DB;
    const examOrder = ["ISE 1", "ISE 2", "ISE 3", "IE", "Term Work", "Practicals", "End Sem"];

    const examButtons = examOrder.map(function (name) {
      const avg = db.calcExamOverall(name);
      const isFull = name === "End Sem";
      return (
        '<button type="button" class="exam-box-btn ' + (isFull ? "full-span" : "") + '" data-action="open-exam-modal" data-exam="' + name + '">' +
          '<div class="exam-box-label">' + name + "</div>" +
          '<div class="exam-box-score">' + (avg !== null ? avg + "%" : "&mdash; %") + "</div>" +
        "</button>"
      );
    }).join("");

    const overallPct = db.calcAllExamsOverall();
    const subOrder = ["Math", "EM", "Chem", "PPS", "IIKS"];
    const subRows = subOrder.map(function (s) {
      return "<tr><td>" + s + '</td><td class="right">' + db.calcSubjectExamAverage(s) + "%</td></tr>";
    }).join("");

    return (
      '<div class="exams-layout">' +
        '<div class="card">' +
          '<div class="exam-cards-grid">' + examButtons + "</div>" +
        "</div>" +
        '<div class="dashboard-col">' +
          '<div class="card overall-big-card">' +
            '<div style="font-size:16px;font-weight:800;color:#475569;">Overall</div>' +
            '<div class="big-pct">' + overallPct + "%</div>" +
          "</div>" +
          '<div class="card">' +
            '<table class="clickable-table">' +
              '<thead><tr><th>Subject</th><th class="right">Marks</th></tr></thead>' +
              "<tbody>" + subRows + "</tbody>" +
            "</table>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function renderSyllabus() {
    const db = window.TCET_DB;
    const order = ["Maths", "PPS", "Chem", "IIKS", "EM"];
    const rows = order.map(function (subKey) {
      const pct = db.calcSyllabusSubjectPct(subKey);
      return (
        '<tr data-action="open-syllabus-modal" data-subject="' + subKey + '">' +
          "<td>" + subKey + "</td>" +
          '<td class="right">' + pct + "%</td>" +
        "</tr>"
      );
    }).join("");

    const overall = db.calcOverallSyllabusPct();

    return (
      '<div class="syllabus-top-action">' +
        '<button type="button" class="btn-pdf-view" data-action="open-syllabus-pdf">Click to view pdf</button>' +
      "</div>" +
      '<div class="syllabus-layout">' +
        '<div class="card">' +
          '<table class="clickable-table">' +
            '<thead><tr><th>Subject</th><th class="right">Completed</th></tr></thead>' +
            "<tbody>" + rows + "</tbody>" +
          "</table>" +
        "</div>" +
        '<div class="card overall-big-card">' +
          '<div style="font-size:16px;font-weight:800;color:#475569;">Overall</div>' +
          '<div class="big-pct">' + overall + "%</div>" +
        "</div>" +
      "</div>"
    );
  }

  function renderAttendance() {
    const db = window.TCET_DB;
    const overall = db.calcOverallAttendance(currentStudentId);
    const subjects = ["Maths", "Chemistry", "EM", "PPS", "IIKS"];

    const rows = subjects.map(function (subKey) {
      const pct = db.calcSubjectAttendance(subKey, currentStudentId);
      return (
        '<div class="attendance-subject-row" data-action="open-attendance-modal" data-subject="' + subKey + '">' +
          "<span>" + subKey + "</span>" +
          "<span>" + pct + "%</span>" +
        "</div>"
      );
    }).join("");

    return (
      '<div class="card attendance-main-card">' +
        '<div class="attendance-overall-row">' +
          "<h3>Overall</h3>" +
          '<span class="overall-num">' + overall + "%</span>" +
        "</div>" +
        rows +
        '<p style="margin:14px 0 0;font-size:12.5px;color:#64748b;text-align:center;">Click any subject to inspect date-wise lecture attendance. Updates automatically when your teacher marks attendance.</p>' +
      "</div>"
    );
  }

  /* ---- YPT Study Timer Helpers & View ---- */
  function fmtHMS(totalSec) {
    const s = Math.max(0, Math.floor(totalSec || 0));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return (
      String(hrs).padStart(2, "0") + ":" +
      String(mins).padStart(2, "0") + ":" +
      String(secs).padStart(2, "0")
    );
  }

  function fmtShortHM(totalSec) {
    const s = Math.max(0, Math.floor(totalSec || 0));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    return hrs + "h " + String(mins).padStart(2, "0") + "m";
  }

  function getStudyData() {
    const state = window.TCET_DB.getState();
    if (!state.studyTracker) {
      state.studyTracker = JSON.parse(JSON.stringify(window.TCET_INITIAL_DATA.studyTracker));
    }
    return state.studyTracker;
  }

  function getMyTotalStudySeconds() {
    const st = getStudyData();
    const saved = Object.values(st.subjectSeconds || {}).reduce(function (a, b) {
      return a + Number(b || 0);
    }, 0);
    return saved + yptElapsed;
  }

  function updateClockDom() {
    const displayStr = yptMode === "pomodoro" ? fmtHMS(yptPomoRemaining) : fmtHMS(yptElapsed);
    const mainClock = document.getElementById("ypt-clock-display");
    if (mainClock) mainClock.textContent = displayStr;
    const focusClock = document.getElementById("ypt-focus-clock");
    if (focusClock) focusClock.textContent = displayStr;

    const st = getStudyData();
    const subSec = Number((st.subjectSeconds && st.subjectSeconds[yptSubject]) || 0) + yptElapsed;
    const subClock = document.getElementById("ypt-sub-time-" + yptSubject);
    if (subClock) subClock.textContent = fmtHMS(subSec);

    const totalEl = document.getElementById("ypt-total-today");
    if (totalEl) totalEl.textContent = fmtShortHM(getMyTotalStudySeconds());
  }

  function stopYptInterval() {
    if (yptInterval) {
      clearInterval(yptInterval);
      yptInterval = null;
    }
  }

  function yptToggleRun() {
    if (yptRunning) {
      yptRunning = false;
      stopYptInterval();
      window.TCET_APP.render();
      return;
    }
    if (!yptStartClock) {
      const now = new Date();
      yptStartClock = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    }
    yptRunning = true;
    stopYptInterval();
    yptInterval = setInterval(function () {
      yptElapsed += 1;
      if (yptMode === "pomodoro") {
        yptPomoRemaining = Math.max(0, yptPomoRemaining - 1);
        if (yptPomoRemaining === 0) {
          yptSaveSession();
          window.TCET_APP.showToast("Pomodoro complete! 25m session logged to " + yptSubject + ".");
          yptPomoRemaining = 25 * 60;
          return;
        }
      }
      updateClockDom();
    }, 1000);
    window.TCET_APP.render();
  }

  function yptSetMode(mode) {
    if (yptMode === mode) return;
    yptRunning = false;
    stopYptInterval();
    yptMode = mode;
    if (mode === "pomodoro" && yptPomoRemaining === 0) {
      yptPomoRemaining = 25 * 60;
    }
    window.TCET_APP.render();
  }

  function yptSelectSubject(subKey) {
    if (yptElapsed >= 5 && subKey !== yptSubject) {
      yptSaveSession();
    }
    yptSubject = subKey;
    window.TCET_APP.render();
  }

  function yptResetTimer() {
    yptRunning = false;
    stopYptInterval();
    yptElapsed = 0;
    yptPomoRemaining = 25 * 60;
    yptStartClock = "";
    window.TCET_APP.render();
  }

  function yptSaveSession() {
    yptRunning = false;
    stopYptInterval();
    const logged = yptElapsed;
    if (logged < 1) {
      window.TCET_APP.showToast("Start the timer first to log a study session.");
      return;
    }
    const now = new Date();
    const endClock = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const startClock = yptStartClock || endClock;
    const sub = yptSubject;

    yptElapsed = 0;
    yptStartClock = "";
    if (yptMode === "pomodoro") yptPomoRemaining = 25 * 60;

    window.TCET_DB.saveState(function (s) {
      if (!s.studyTracker) {
        s.studyTracker = JSON.parse(JSON.stringify(window.TCET_INITIAL_DATA.studyTracker));
      }
      if (!s.studyTracker.subjectSeconds[sub]) s.studyTracker.subjectSeconds[sub] = 0;
      s.studyTracker.subjectSeconds[sub] += logged;
      s.studyTracker.sessions.unshift({
        subject: sub,
        start: startClock,
        end: endClock,
        seconds: logged
      });
    }, "Study session saved: " + sub + " (" + fmtHMS(logged) + ")");

    window.TCET_APP.showToast("Saved " + fmtHMS(logged) + " to " + sub + " study tracker!");
  }

  function yptOpenFocusModal() {
    const displayStr = yptMode === "pomodoro" ? fmtHMS(yptPomoRemaining) : fmtHMS(yptElapsed);
    const html =
      '<div class="modal-header">' +
        "<h3>Focus Mode — " + yptSubject + "</h3>" +
        '<button type="button" class="modal-close-btn" data-action="close-modal">&times;</button>' +
      "</div>" +
      '<div class="ypt-focus-overlay">' +
        '<div class="ypt-active-sub-pill">' + (yptMode === "pomodoro" ? "Pomodoro 25m" : "Stopwatch") + " &bull; " + (yptRunning ? "Studying Now" : "Paused") + "</div>" +
        '<div id="ypt-focus-clock" class="ypt-clock">' + displayStr + "</div>" +
        '<p style="margin:0 0 20px;font-size:14px;color:#475569;">Stay in this distraction-free view until your study block finishes.</p>' +
        '<div class="ypt-controls">' +
          '<button type="button" class="btn-primary" data-action="ypt-toggle-focus">' + (yptRunning ? "Pause" : "Start Focus") + "</button>" +
          '<button type="button" class="btn-outline" data-action="ypt-save-close">Save &amp; Exit</button>' +
        "</div>" +
      "</div>";
    window.TCET_APP.openModal(html);
  }

  function renderStudyTimer(student) {
    const st = getStudyData();
    const subjects = ["Maths", "Chemistry", "EM", "PPS", "IIKS"];
    const displayClock = yptMode === "pomodoro" ? fmtHMS(yptPomoRemaining) : fmtHMS(yptElapsed);
    const totalSec = getMyTotalStudySeconds();
    const goalSec = Math.max(60, Number(st.dailyGoalMinutes || 240) * 60);
    const goalPct = Math.min(100, Math.round((totalSec / goalSec) * 100));

    const subjectRows = subjects.map(function (subKey) {
      const baseSec = Number((st.subjectSeconds && st.subjectSeconds[subKey]) || 0);
      const liveSec = baseSec + (yptSubject === subKey ? yptElapsed : 0);
      const isActive = yptSubject === subKey;
      return (
        '<div class="ypt-subject-row ' + (isActive ? "active" : "") + '" data-action="ypt-select-subject" data-subject="' + subKey + '">' +
          '<div class="ypt-sub-left">' +
            '<span class="ypt-play-icon">' + (isActive && yptRunning ? "&#10074;&#10074;" : "&#9654;") + "</span>" +
            "<div>" +
              "<strong>" + subKey + "</strong>" +
              '<div style="font-size:12px;color:#64748b;">' + (isActive ? (yptRunning ? "Studying now..." : "Selected subject") : "Click to switch") + "</div>" +
            "</div>" +
          "</div>" +
          '<span id="ypt-sub-time-' + subKey + '" class="ypt-sub-time">' + fmtHMS(liveSec) + "</span>" +
        "</div>"
      );
    }).join("");

    const todoItems = (st.todos || []).map(function (t) {
      return (
        '<div class="ypt-todo-item ' + (t.done ? "done" : "") + '">' +
          '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;flex:1;">' +
            '<input type="checkbox" ' + (t.done ? "checked" : "") + ' data-action="ypt-toggle-todo" data-id="' + t.id + '" />' +
            '<span class="todo-title" style="font-size:14px;font-weight:600;">' + t.text + "</span>" +
          "</label>" +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span class="pct-pill pct-high" style="font-size:11.5px;">' + t.subject + "</span>" +
            '<button type="button" class="btn-outline" style="padding:4px 8px;font-size:12px;" data-action="ypt-del-todo" data-id="' + t.id + '">&times;</button>' +
          "</div>" +
        "</div>"
      );
    }).join("");

    const sessionRows = (st.sessions || []).slice(0, 6).map(function (ses) {
      return (
        "<tr>" +
          "<td><strong>" + ses.subject + "</strong></td>" +
          "<td>" + ses.start + " &ndash; " + ses.end + "</td>" +
          '<td class="right">' + fmtHMS(ses.seconds) + "</td>" +
        "</tr>"
      );
    }).join("");

    /* Build live sorted TCET Study Group Leaderboard */
    const groupList = (st.peers || []).map(function (p) {
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        activeSubject: p.activeSubject,
        secondsToday: p.secondsToday,
        isMe: false
      };
    });
    groupList.push({
      id: student.id,
      name: student.name + " (You)",
      status: yptRunning ? "Studying" : "On Break",
      activeSubject: yptSubject,
      secondsToday: totalSec,
      isMe: true
    });
    groupList.sort(function (a, b) { return b.secondsToday - a.secondsToday; });

    const groupRows = groupList.map(function (m, idx) {
      const dotCls = m.status === "Studying" ? "ypt-status-studying" : (m.status === "On Break" ? "ypt-status-break" : "ypt-status-offline");
      return (
        '<div class="ypt-group-row ' + (m.isMe ? "is-me" : "") + '">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span class="ypt-rank-badge">#' + (idx + 1) + "</span>" +
            "<div>" +
              '<div style="font-size:14px;font-weight:700;">' + m.name + "</div>" +
              '<div style="font-size:12px;color:#64748b;"><span class="ypt-status-dot ' + dotCls + '"></span>' + (m.status === "Studying" ? "Studying " + m.activeSubject : m.status) + "</div>" +
            "</div>" +
          "</div>" +
          '<strong style="font-variant-numeric:tabular-nums;color:#1d4ed8;font-size:14px;">' + fmtShortHM(m.secondsToday) + "</strong>" +
        "</div>"
      );
    }).join("");

    const subOpts = subjects.map(function (s) {
      return '<option value="' + s + '">' + s + "</option>";
    }).join("");

    return (
      '<div class="dashboard-grid">' +
        '<div class="dashboard-col">' +
          '<div class="card">' +
            '<div class="card-title">' +
              "<span>Study Timer</span>" +
              '<div class="ypt-mode-bar">' +
                '<button type="button" class="ypt-mode-btn ' + (yptMode === "stopwatch" ? "active" : "") + '" data-action="ypt-mode" data-mode="stopwatch">Stopwatch</button>' +
                '<button type="button" class="ypt-mode-btn ' + (yptMode === "pomodoro" ? "active" : "") + '" data-action="ypt-mode" data-mode="pomodoro">Pomodoro 25m</button>' +
              "</div>" +
            "</div>" +
            '<div class="ypt-timer-stage">' +
              '<div class="ypt-active-sub-pill">' + yptSubject + " &bull; " + (yptRunning ? "Live Focus Active" : "Ready") + "</div>" +
              '<div id="ypt-clock-display" class="ypt-clock">' + displayClock + "</div>" +
              '<div class="ypt-controls">' +
                '<button type="button" class="btn-primary" data-action="ypt-toggle">' + (yptRunning ? "Pause Timer" : "Start Studying") + "</button>" +
                '<button type="button" class="btn-outline" data-action="ypt-save">Save Session</button>' +
                '<button type="button" class="btn-outline" data-action="ypt-reset">Reset</button>' +
                '<button type="button" class="btn-outline" data-action="ypt-focus">Focus Mode</button>' +
              "</div>" +
            "</div>" +
            subjectRows +
          "</div>" +

          '<div class="card">' +
            '<h3 class="card-title">Daily Study To-Do &amp; Planner</h3>' +
            '<form id="ypt-todo-form" class="toolbar-row" style="margin-bottom:14px;">' +
              '<div class="form-group" style="flex:2;"><input id="ypt-todo-text" class="form-input" placeholder="Add study task (e.g. Revise EM Friction)" required /></div>' +
              '<div class="form-group" style="flex:1;min-width:110px;"><select id="ypt-todo-sub" class="form-input">' + subOpts + "</select></div>" +
              '<div><button type="submit" class="btn-primary" style="width:auto;padding:11px 16px;font-size:13.5px;">Add Task</button></div>' +
            "</form>" +
            (todoItems || '<p style="font-size:13.5px;color:#64748b;">No study tasks yet. Add your first goal above.</p>') +
          "</div>" +
        "</div>" +

        '<div class="dashboard-col">' +
          '<div class="card overall-big-card">' +
            '<div style="font-size:15px;font-weight:800;color:#475569;">Today&apos;s Total Study</div>' +
            '<div id="ypt-total-today" class="big-pct" style="font-size:38px;">' + fmtShortHM(totalSec) + "</div>" +
            '<div class="ypt-progress-track"><div class="ypt-progress-fill" style="width:' + goalPct + '%;"></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;color:#475569;">' +
              "<span>" + goalPct + "% of " + Math.round(goalSec / 3600) + "h Goal</span>" +
              "<span>Streak: " + (st.streakDays || 1) + " Days</span>" +
            "</div>" +
          "</div>" +

          '<div class="card">' +
            '<h3 class="card-title"><span>FE AIML Study Group</span><small style="font-size:12px;color:#64748b;">Live Rank</small></h3>' +
            groupRows +
          "</div>" +

          '<div class="card">' +
            '<h3 class="card-title">Today&apos;s Study Timeline</h3>' +
            '<table class="clickable-table">' +
              '<thead><tr><th>Subject</th><th>Time</th><th class="right">Duration</th></tr></thead>' +
              "<tbody>" + sessionRows + "</tbody>" +
            "</table>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  /* ---- Clickable Detail Modals (Sketch Pages 4, 6, 7) ---- */
  function openAnnouncementModal(id) {
    const ann = window.TCET_DB.getState().announcements.find(function (a) { return a.id === id; });
    if (!ann) return;
    const html =
      '<div class="modal-header">' +
        "<h3>" + ann.title + "</h3>" +
        '<button type="button" class="modal-close-btn" data-action="close-modal">&times;</button>' +
      "</div>" +
      '<p style="font-size:15px;line-height:1.65;margin:0 0 14px;">' + ann.body + "</p>" +
      '<p style="font-size:14.5px;margin:0 0 20px;color:#1e40af;font-weight:600;">In case of any queries, contact ' + ann.contact + ".</p>" +
      '<div style="border-top:1px solid #e2e8f0;padding-top:12px;font-size:13.5px;color:#475569;">' +
        "<div><strong>Announcement by " + ann.author + "</strong></div>" +
        "<div>" + ann.date + "</div>" +
      "</div>";
    window.TCET_APP.openModal(html);
  }

  function openExamModal(examName) {
    const db = window.TCET_DB;
    const exam = db.getState().exams[examName];
    if (!exam) return;
    const avg = db.calcExamOverall(examName);
    const fmt = function (v) { return typeof v === "number" ? v + "%" : "Pending"; };

    const html =
      '<div class="modal-header">' +
        "<h3>" + examName + "</h3>" +
        '<button type="button" class="modal-close-btn" data-action="close-modal">&times;</button>' +
      "</div>" +
      '<div class="exam-detail-row-3">' +
        '<div class="exam-sub-card"><div class="sub-name">Math</div><div class="sub-val">' + fmt(exam.subjects.Math) + "</div></div>" +
        '<div class="exam-sub-card"><div class="sub-name">Chem</div><div class="sub-val">' + fmt(exam.subjects.Chem) + "</div></div>" +
        '<div class="exam-sub-card"><div class="sub-name">EM</div><div class="sub-val">' + fmt(exam.subjects.EM) + "</div></div>" +
      "</div>" +
      '<div class="exam-detail-row-2">' +
        '<div class="exam-sub-card"><div class="sub-name">PPS</div><div class="sub-val">' + fmt(exam.subjects.PPS) + "</div></div>" +
        '<div class="exam-sub-card"><div class="sub-name">IIKS</div><div class="sub-val">' + fmt(exam.subjects.IIKS) + "</div></div>" +
      "</div>" +
      '<div class="exam-overall-box">' +
        '<div style="font-size:15px;font-weight:700;color:#475569;">Overall</div>' +
        '<div style="font-size:32px;font-weight:900;color:#1d4ed8;">' + (avg !== null ? avg + "%" : "Pending") + "</div>" +
      "</div>";
    window.TCET_APP.openModal(html);
  }

  function openSyllabusModal(subKey) {
    const db = window.TCET_DB;
    const mods = db.getState().syllabus[subKey] || [];
    const total = db.calcSyllabusSubjectPct(subKey);

    const rows = mods.map(function (m) {
      return "<tr><td><strong>" + m.id + " :</strong> " + m.title + '</td><td class="right">' + m.completion + "%</td></tr>";
    }).join("");

    const html =
      '<div class="modal-header">' +
        "<h3>" + subKey + " Syllabus</h3>" +
        '<button type="button" class="modal-close-btn" data-action="close-modal">&times;</button>' +
      "</div>" +
      '<table class="clickable-table">' +
        '<thead><tr><th>Module</th><th class="right">Completion</th></tr></thead>' +
        "<tbody>" + rows + "</tbody>" +
        '<tfoot><tr><td style="padding-top:16px;font-size:17px;font-weight:800;">Total</td><td class="right" style="padding-top:16px;font-size:18px;font-weight:900;color:#1d4ed8;">' + total + "%</td></tr></tfoot>" +
      "</table>";
    window.TCET_APP.openModal(html);
  }

  function openSyllabusPdfModal() {
    const state = window.TCET_DB.getState();
    const sections = Object.keys(state.syllabus).map(function (subKey) {
      const items = state.syllabus[subKey].map(function (m) {
        return "<li><strong>Module " + m.id + ":</strong> " + m.title + " (" + m.completion + "% completed)</li>";
      }).join("");
      return '<div style="margin-bottom:14px;"><h4 style="margin:0 0 6px;color:#1d4ed8;">' + subKey + "</h4><ul style=\"margin:0;padding-left:20px;font-size:14px;\">" + items + "</ul></div>";
    }).join("");

    const html =
      '<div class="modal-header">' +
        "<h3>TCET FE Sem I (AI &amp; ML) — Official Syllabus PDF</h3>" +
        '<button type="button" class="modal-close-btn" data-action="close-modal">&times;</button>' +
      "</div>" +
      '<div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:16px;margin-bottom:14px;">' +
        sections +
      "</div>" +
      '<div style="display:flex;justify-content:flex-end;gap:10px;">' +
        '<button type="button" class="btn-outline" data-action="print-syllabus">Print / Save as PDF</button>' +
        '<button type="button" class="btn-outline" data-action="close-modal">Close</button>' +
      "</div>";
    window.TCET_APP.openModal(html);
  }

  function openAttendanceModal(subKey) {
    const db = window.TCET_DB;
    const logs = db.getStudentAttendanceLogs(subKey, currentStudentId).slice().reverse();
    const pct = db.calcSubjectAttendance(subKey, currentStudentId);

    const rows = logs.map(function (entry) {
      return (
        "<tr>" +
          "<td><strong>" + entry.date + "</strong></td>" +
          "<td>" + entry.time + "</td>" +
          '<td class="right"><span class="status-badge status-' + entry.status + '">' + entry.status + "</span></td>" +
        "</tr>"
      );
    }).join("");

    const html =
      '<div class="modal-header">' +
        "<h3>" + subKey + " Attendance</h3>" +
        '<button type="button" class="modal-close-btn" data-action="close-modal">&times;</button>' +
      "</div>" +
      '<div class="att-detail-layout">' +
        '<div class="vertical-slider-rail" title="Vertical Attendance Slider">' +
          '<input id="att-vertical-slider" type="range" min="0" max="100" value="0" aria-label="Scroll attendance list" />' +
        "</div>" +
        '<div id="att-detail-scroll" class="att-detail-scroll">' +
          '<table class="data-table">' +
            '<thead><tr><th>Date</th><th>Time</th><th style="text-align:right;">Status</th></tr></thead>' +
            "<tbody>" + rows + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>" +
      '<div style="text-align:center;margin-top:16px;font-size:20px;font-weight:900;color:#1d4ed8;">Overall : ' + pct + "%</div>";

    window.TCET_APP.openModal(html);

    /* Wire up Sketch Page 6 Left Vertical Slider */
    const slider = document.getElementById("att-vertical-slider");
    const box = document.getElementById("att-detail-scroll");
    if (slider && box) {
      slider.addEventListener("input", function () {
        const maxScroll = box.scrollHeight - box.clientHeight;
        box.scrollTop = (Number(slider.value) / 100) * Math.max(0, maxScroll);
      });
      box.addEventListener("scroll", function () {
        const maxScroll = box.scrollHeight - box.clientHeight;
        if (maxScroll > 0) {
          slider.value = String(Math.round((box.scrollTop / maxScroll) * 100));
        }
      });
    }
  }

  function openProfileModal(studentId, editMode) {
    const student = getStudent(studentId);
    const initials = student.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();

    const fieldsHtml = editMode
      ? '<form id="profile-edit-form" data-student-id="' + student.id + '">' +
          '<div class="form-group"><label>Name</label><input id="prof-name" class="form-input" value="' + student.name + '" required /></div>' +
          '<div class="form-group"><label>Age</label><input id="prof-age" class="form-input" type="number" min="15" max="30" value="' + student.age + '" required /></div>' +
          '<div class="form-group"><label>Branch</label><input id="prof-branch" class="form-input" value="' + student.branch + '" required /></div>' +
          '<div class="form-group"><label>Division</label><input id="prof-div" class="form-input" value="' + student.division + '" required /></div>' +
          '<button type="submit" class="btn-primary">Save Profile</button>' +
        "</form>"
      : '<div>' +
          '<div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:4px;">Name</div><div class="profile-field-pill">' + student.name + "</div>" +
          '<div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:4px;">Age</div><div class="profile-field-pill">' + student.age + "</div>" +
          '<div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:4px;">Branch</div><div class="profile-field-pill">' + student.branch + "</div>" +
          '<div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:4px;">Division</div><div class="profile-field-pill">' + student.division + "</div>" +
        "</div>";

    const html =
      '<div class="modal-header">' +
        "<h3>Profile</h3>" +
        '<button type="button" class="modal-close-btn" data-action="close-modal">&times;</button>' +
      "</div>" +
      '<div class="profile-modal-grid">' +
        '<div class="profile-avatar-wrap">' +
          '<div class="profile-avatar-circle">' + initials + "</div>" +
          '<button type="button" class="profile-edit-pencil" data-action="toggle-profile-edit" data-student-id="' + student.id + '" data-edit="' + (editMode ? "0" : "1") + '" title="Edit Profile">&#9998;</button>' +
        "</div>" +
        fieldsHtml +
      "</div>";
    window.TCET_APP.openModal(html);
  }

  function render(session) {
    const student = getStudent(session.userId);
    currentStudentId= student.id;
    const initials = student.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    const isCloud = Boolean(window.TCET_DB.getFirebaseUrl());

    const navHtml = TABS.map(function (tab) {
      return (
        '<button type="button" class="nav-item ' + (activeTab === tab ? "active" : "") + '" data-action="student-tab" data-tab="' + tab + '">' +
          tab +
        "</button>"
      );
    }).join("");

    let bodyHtml = "";
    if (activeTab === "Dashboard") bodyHtml = renderDashboard(student);
    else if (activeTab === "Time Table") bodyHtml = renderTimeTable();
    else if (activeTab === "Announcements") bodyHtml = renderAnnouncements();
    else if (activeTab === "Exams") bodyHtml = renderExams();
    else if (activeTab === "Syllabus") bodyHtml = renderSyllabus();
    else if (activeTab === "Attendance") bodyHtml = renderAttendance();
    else if (activeTab === "Study Timer") bodyHtml = renderStudyTimer(student);

    return (
      '<div class="erp-shell role-student">' +
        '<div class="erp-logo-cell">' +
          '<div class="sketch-logo-square">' + window.TCET_AUTH.getLogoSvg(24) + "</div>" +
          '<div class="logo-text-stack"><strong>TCET</strong><span>Student Portal</span></div>' +
        "</div>" +
        '<header class="erp-topbar">' +
          '<h1 class="topbar-title">' + activeTab + "</h1>" +
          '<div class="topbar-right">' +
            '<span class="db-badge ' + (isCloud ? "cloud" : "") + '"><span class="db-dot"></span>' + (isCloud ? "Firebase Live" : "Live Sync") + "</span>" +
            '<button type="button" class="profile-pill-btn" data-action="open-profile-modal" data-student-id="' + student.id + '">' +
              '<span class="profile-pill-avatar">' + initials + "</span>" +
              "<span>Profile</span>" +
            "</button>" +
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

  function afterRender() {
    /* Bind Timetable horizontal slider from Sketch Page 2 Bottom */
    const slider = document.getElementById("tt-horizontal-slider");
    const viewport = document.getElementById("tt-scroll-viewport");
    if (slider && viewport) {
      slider.addEventListener("input", function () {
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        viewport.scrollLeft = (Number(slider.value) / 100) * Math.max(0, maxScroll);
      });
      viewport.addEventListener("scroll", function () {
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        if (maxScroll > 0) {
          slider.value = String(Math.round((viewport.scrollLeft / maxScroll) * 100));
        }
      });
    }
  }

  return {
    getTab: getTab,
    setTab: setTab,
    render: render,
    afterRender: afterRender,
    openAnnouncementModal: openAnnouncementModal,
    openExamModal: openExamModal,
    openSyllabusModal: openSyllabusModal,
    openSyllabusPdfModal: openSyllabusPdfModal,
    openAttendanceModal: openAttendanceModal,
    openProfileModal: openProfileModal,
    yptToggleRun: yptToggleRun,
    yptSetMode: yptSetMode,
    yptSelectSubject: yptSelectSubject,
    yptResetTimer: yptResetTimer,
    yptSaveSession: yptSaveSession,
    yptOpenFocusModal: yptOpenFocusModal
  };
})();
