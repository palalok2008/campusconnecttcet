/* ==========================================================================
   Main Application Controller (js/app.js)
   Manages session routing, global event delegation, modals, toasts, and
   live UI re-rendering whenever the database updates.
   ========================================================================== */

window.TCET_APP = (function () {
  let session = null;

  function setSession(newSession) {
    session = newSession;
    render();
  }

  function logout() {
    session = null;
    closeModal();
    render();
    showToast("Logged out successfully.");
  }

  function openModal(html) {
    const overlay = document.getElementById("modal-overlay");
    const box = document.getElementById("modal-box");
    if (!overlay || !box) return;
    box.innerHTML = html;
    overlay.classList.remove("hidden");
  }

  function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.add("hidden");
  }

  function showToast(msg) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3400);
  }

  function render() {
    const root = document.getElementById("app");
    if (!root) return;
    if (!session) {
      root.innerHTML = window.TCET_AUTH.render();
      return;
    }
    if (session.role === "student") {
      root.innerHTML = window.TCET_STUDENT.render(session);
      window.TCET_STUDENT.afterRender();
    } else if (session.role === "teacher") {
      root.innerHTML = window.TCET_TEACHER.render(session);
    } else if (session.role === "admin") {
      root.innerHTML = window.TCET_ADMIN.render(session);
    }
  }

  /* Unified Click Delegation (keeps HTML clean and guarantees every button works) */
  document.addEventListener("click", function (ev) {
    const target = ev.target.closest("[data-action]");
    if (!target) {
      if (ev.target && ev.target.id === "modal-overlay") closeModal();
      return;
    }
    const action = target.getAttribute("data-action");

    if (action === "select-role") window.TCET_AUTH.setRole(target.getAttribute("data-role"));
    else if (action === "quick-login") window.TCET_AUTH.quickLogin(target.getAttribute("data-role"));
    else if (action === "logout") logout();
    else if (action === "close-modal") closeModal();
    else if (action === "student-tab") window.TCET_STUDENT.setTab(target.getAttribute("data-tab"));
    else if (action === "teacher-tab") window.TCET_TEACHER.setTab(target.getAttribute("data-tab"));
    else if (action === "admin-tab") window.TCET_ADMIN.setTab(target.getAttribute("data-tab"));
    else if (action === "open-announcement-modal") window.TCET_STUDENT.openAnnouncementModal(target.getAttribute("data-id"));
    else if (action === "open-exam-modal") window.TCET_STUDENT.openExamModal(target.getAttribute("data-exam"));
    else if (action === "open-syllabus-modal") window.TCET_STUDENT.openSyllabusModal(target.getAttribute("data-subject"));
    else if (action === "open-syllabus-pdf") window.TCET_STUDENT.openSyllabusPdfModal();
    else if (action === "print-syllabus") window.print();
    else if (action === "open-attendance-modal") window.TCET_STUDENT.openAttendanceModal(target.getAttribute("data-subject"));
    else if (action === "open-profile-modal") window.TCET_STUDENT.openProfileModal(target.getAttribute("data-student-id"), false);
    else if (action === "toggle-profile-edit") window.TCET_STUDENT.openProfileModal(target.getAttribute("data-student-id"), target.getAttribute("data-edit") === "1");
    else if (action === "teacher-set-att") window.TCET_TEACHER.setDraftStatus(target.getAttribute("data-student"), target.getAttribute("data-status"));
    else if (action === "teacher-submit-att") window.TCET_TEACHER.submitLiveAttendance();
    else if (action === "admin-del-ann") {
      const id = target.getAttribute("data-id");
      window.TCET_DB.saveState(function (s) {
        s.announcements = s.announcements.filter(function (a) { return a.id !== id; });
      }, "Announcement deleted");
      showToast("Announcement removed.");
    } else if (action === "ypt-toggle") {
      window.TCET_STUDENT.yptToggleRun();
    } else if (action === "ypt-toggle-focus") {
      window.TCET_STUDENT.yptToggleRun();
      window.TCET_STUDENT.yptOpenFocusModal();
    } else if (action === "ypt-save") {
      window.TCET_STUDENT.yptSaveSession();
    } else if (action === "ypt-save-close") {
      window.TCET_STUDENT.yptSaveSession();
      closeModal();
    } else if (action === "ypt-reset") {
      window.TCET_STUDENT.yptResetTimer();
    } else if (action === "ypt-focus") {
      window.TCET_STUDENT.yptOpenFocusModal();
    } else if (action === "ypt-mode") {
      window.TCET_STUDENT.yptSetMode(target.getAttribute("data-mode"));
    } else if (action === "ypt-select-subject") {
      window.TCET_STUDENT.yptSelectSubject(target.getAttribute("data-subject"));
    } else if (action === "ypt-del-todo") {
      const tid = target.getAttribute("data-id");
      window.TCET_DB.saveState(function (s) {
        if (s.studyTracker && s.studyTracker.todos) {
          s.studyTracker.todos = s.studyTracker.todos.filter(function (t) { return t.id !== tid; });
        }
      }, "Study task removed");
    } else if (action === "admin-reset-db") {
      window.TCET_DB.resetDemoData();
      showToast("All portal data restored to default seed values.");
    }
  });

  /* Unified Change / Input Delegation */
  document.addEventListener("change", function (ev) {
    const target = ev.target;
    const action = target && target.getAttribute("data-action");
    if (action === "teacher-filter") {
      window.TCET_TEACHER.setAttendanceFilter(target.getAttribute("data-field"), target.value);
    } else if (action === "ypt-toggle-todo") {
      const tid = target.getAttribute("data-id");
      window.TCET_DB.saveState(function (s) {
        if (s.studyTracker && s.studyTracker.todos) {
          const item = s.studyTracker.todos.find(function (t) { return t.id === tid; });
          if (item) item.done = Boolean(target.checked);
        }
      }, "Study task updated");
    } else if (action === "teacher-syllabus-slider") {
      const subKey = target.getAttribute("data-subject");
      const idx = Number(target.getAttribute("data-index"));
      const val = Number(target.value);
      window.TCET_DB.saveState(function (s) {
        if (s.syllabus[subKey] && s.syllabus[subKey][idx]) {
          s.syllabus[subKey][idx].completion = val;
        }
      }, "Syllabus updated: " + subKey);
      showToast(subKey + " module progress updated to " + val + "%");
    }
  });

  /* Unified Form Submit Delegation */
  document.addEventListener("submit", function (ev) {
    const form = ev.target;
    if (!form || !form.id) return;

    if (form.id === "login-form") {
      window.TCET_AUTH.handleFormSubmit(ev);
    } else if (form.id === "profile-edit-form") {
      ev.preventDefault();
      const sid = form.getAttribute("data-student-id");
      const name = document.getElementById("prof-name").value.trim();
      const age = Number(document.getElementById("prof-age").value);
      const branch = document.getElementById("prof-branch").value.trim();
      const division = document.getElementById("prof-div").value.trim();
      window.TCET_DB.saveState(function (s) {
        const st = s.users.students.find(function (u) { return u.id === sid; });
        if (st) {
          st.name = name;
          st.age = age;
          st.branch = branch;
          st.division = division;
        }
      }, "Student profile updated");
      closeModal();
      showToast("Profile updated successfully.");
    } else if (form.id === "teacher-marks-form") {
      ev.preventDefault();
      const examName = document.getElementById("tm-exam").value;
      const marks = {
        Math: Number(document.getElementById("tm-Math").value),
        Chem: Number(document.getElementById("tm-Chem").value),
        EM: Number(document.getElementById("tm-EM").value),
        PPS: Number(document.getElementById("tm-PPS").value),
        IIKS: Number(document.getElementById("tm-IIKS").value)
      };
      window.TCET_DB.saveState(function (s) {
        s.exams[examName] = { status: "published", subjects: marks };
      }, "Exam marks published: " + examName);
      showToast(examName + " marks published live to Student Portal!");
    } else if (form.id === "teacher-ann-form") {
      ev.preventDefault();
      const cat = document.getElementById("ta-cat").value;
      const title = document.getElementById("ta-title").value.trim();
      const body = document.getElementById("ta-body").value.trim();
      const contact = document.getElementById("ta-contact").value.trim();
      const today = new Date();
      const dateStr = String(today.getDate()).padStart(2, "0") + "/" + String(today.getMonth() + 1).padStart(2, "0") + "/" + today.getFullYear();
      window.TCET_DB.saveState(function (s) {
        s.announcements.unshift({
          id: "ann-" + Date.now(),
          category: cat,
          title: title,
          body: body,
          contact: contact,
          author: "Prof. Rajesh Sharma",
          date: dateStr
        });
      }, "New announcement posted: " + title);
      form.reset();
      showToast("Announcement published live!");
    } else if (form.id === "teacher-sub-form") {
      ev.preventDefault();
      const topic = document.getElementById("ts-topic").value.trim();
      const date = document.getElementById("ts-date").value.trim();
      const group = document.getElementById("ts-group").value;
      window.TCET_DB.saveState(function (s) {
        s.submissions[group].unshift({ title: topic, date: date });
        s.submissions.allList.unshift({ topic: topic, date: date });
      }, "New submission added: " + topic);
      form.reset();
      showToast("Upcoming submission added live!");
    } else if (form.id === "admin-add-student-form") {
      ev.preventDefault();
      const id = document.getElementById("as-id").value.trim();
      const name = document.getElementById("as-name").value.trim();
      const roll = document.getElementById("as-roll").value.trim();
      const div = document.getElementById("as-div").value.trim();
      window.TCET_DB.saveState(function (s) {
        s.users.students.push({
          id: id,
          password: "student123",
          name: name,
          age: 18,
          year: "FE",
          sem: "Sem I",
          branch: "AIML",
          division: div,
          rollNo: roll
        });
      }, "New student registered: " + name);
      form.reset();
      showToast("Student " + name + " added (default password: student123).");
    } else if (form.id === "admin-tt-form") {
      ev.preventDefault();
      const day = document.getElementById("att-day").value;
      const slot = document.getElementById("att-slot").value;
      const sub = document.getElementById("att-sub").value.trim();
      const fac = document.getElementById("att-fac").value.trim();
      window.TCET_DB.saveState(function (s) {
        if (!s.timetable[day]) s.timetable[day] = {};
        s.timetable[day][slot] = sub ? { subject: sub, faculty: fac || "Faculty" } : null;
      }, "Timetable updated: " + day + " " + slot);
      showToast("Timetable slot updated live!");
    } else if (form.id === "ypt-todo-form") {
      ev.preventDefault();
      const text = document.getElementById("ypt-todo-text").value.trim();
      const sub = document.getElementById("ypt-todo-sub").value;
      if (!text) return;
      window.TCET_DB.saveState(function (s) {
        if (!s.studyTracker) s.studyTracker = JSON.parse(JSON.stringify(window.TCET_INITIAL_DATA.studyTracker));
        s.studyTracker.todos.unshift({ id: "todo-" + Date.now(), subject: sub, text: text, done: false });
      }, "Study task added");
      form.reset();
      showToast("Added study task under " + sub + ".");
    } else if (form.id === "admin-fb-form") {
      ev.preventDefault();
      const url = document.getElementById("fb-url-input").value.trim();
      window.TCET_DB.setFirebaseUrl(url);
      showToast(url ? "Connected to Firebase Realtime Database!" : "Switched to Local Real-Time Sync.");
    }
  });

  /* Bootstrap Database & Subscribe for Real-Time Cross-Tab / Firebase Updates */
  function start() {
    window.TCET_DB.init();
    window.TCET_DB.subscribe(function (_state, reason) {
      render();
      if (session && session.role === "student" && reason && reason.indexOf("Live") === 0) {
        showToast(reason);
      }
    });
    render();
  }

  window.addEventListener("DOMContentLoaded", start);

  return {
    setSession: setSession,
    logout: logout,
    openModal: openModal,
    closeModal: closeModal,
    showToast: showToast,
    render: render
  };
})();
