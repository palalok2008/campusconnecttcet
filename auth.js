/* ==========================================================================
   Authentication & Login Screen (js/auth.js)
   Handles 3-role login: Student, Teacher, Administrator
   ========================================================================== */

window.TCET_AUTH = (function () {
  let selectedRole = "student";
  let loginError = "";

  const DEMO_CREDS = {
    student: { id: "STU202601", pass: "student123" },
    teacher: { id: "FAC202601", pass: "teacher123" },
    admin:   { id: "ADM202601", pass: "admin123" }
  };

  function getLogoSvg(_size) {
    return '<img src="assets/tcet-logo.jpg" alt="TCET Mumbai Logo" class="tcet-logo-img" />';
  }

  function setRole(role) {
    selectedRole = role;
    loginError = "";
    window.TCET_APP.render();
  }

  function quickLogin(role) {
    selectedRole = role;
    const creds = DEMO_CREDS[role];
    attemptLogin(creds.id, creds.pass, role);
  }

  function attemptLogin(userId, password, roleOverride) {
    const role = roleOverride || selectedRole;
    const state = window.TCET_DB.getState();
    const listMap = {
      student: state.users.students,
      teacher: state.users.teachers,
      admin:   state.users.admins
    };
    const pool = listMap[role] || [];
    const found = pool.find(function (u) {
      return u.id.toLowerCase() === (userId || "").trim().toLowerCase() && u.password === password;
    });

    if (!found) {
      loginError = "Invalid ID or password for " + role + " login. Use the Quick Demo buttons on the left.";
      window.TCET_APP.render();
      return;
    }

    loginError = "";
    window.TCET_APP.setSession({ role: role, userId: found.id });
    window.TCET_APP.showToast("Signed in as " + found.name + " (" + role.toUpperCase() + ")");
  }

  function handleFormSubmit(ev) {
    ev.preventDefault();
    const idEl = document.getElementById("login-userid");
    const pwEl = document.getElementById("login-password");
    attemptLogin(idEl ? idEl.value : "", pwEl ? pwEl.value : "");
  }

  function render() {
    const isCloud = Boolean(window.TCET_DB.getFirebaseUrl());
    const creds = DEMO_CREDS[selectedRole];
    const btnClass =
      selectedRole === "teacher"
        ? "btn-primary btn-teacher"
        : selectedRole === "admin"
        ? "btn-primary btn-admin"
        : "btn-primary";

    return (
      '<div class="login-wrapper">' +
        '<div class="login-card">' +
          '<div class="login-brand">' +
            '<div class="brand-top">' +
              '<div class="brand-logo-box">' + getLogoSvg(30) + "</div>" +
              "<div>" +
                '<h1 class="brand-title">TCET Mumbai</h1>' +
                '<p class="brand-sub">Thakur College of Engineering &amp; Technology</p>' +
              "</div>" +
            "</div>" +
            '<div class="brand-hero">' +
              "<h2>Campus Connect</h2>" +
              "<p>Separate dashboards for Students, Faculty, and Administrators with real-time attendance sync, exam analytics, syllabus tracking, and digital circulars.</p>" +
            "</div>" +
            '<div class="demo-box">' +
              '<div class="demo-box-title">' +
                "<span>1-Click Viva Demo Login</span>" +
                '<span class="db-badge ' + (isCloud ? "cloud" : "") + '"><span class="db-dot"></span>' + (isCloud ? "Firebase Cloud" : "Live Sync Ready") + "</span>" +
              "</div>" +
              '<div style="opacity:0.9;margin-bottom:6px;">Open two tabs (Teacher + Student) to see live attendance updates!</div>' +
              '<div class="demo-quick-btns">' +
                '<button type="button" class="demo-btn" data-action="quick-login" data-role="student">Student Demo (STU202601)</button>' +
                '<button type="button" class="demo-btn" data-action="quick-login" data-role="teacher">Teacher Demo (FAC202601)</button>' +
                '<button type="button" class="demo-btn" data-action="quick-login" data-role="admin">Admin Demo (ADM202601)</button>' +
              "</div>" +
            "</div>" +
          "</div>" +

          '<div class="login-form-pane">' +
            '<h2 style="margin:0 0 6px;font-size:22px;font-weight:800;">Sign in to your Portal</h2>' +
            '<p style="margin:0 0 18px;font-size:13.5px;color:#475569;">Select your role to launch your dedicated dashboard.</p>' +
            '<div class="role-tabs">' +
              '<button type="button" class="role-tab ' + (selectedRole === "student" ? "active-student" : "") + '" data-action="select-role" data-role="student">Student</button>' +
              '<button type="button" class="role-tab ' + (selectedRole === "teacher" ? "active-teacher" : "") + '" data-action="select-role" data-role="teacher">Teacher</button>' +
              '<button type="button" class="role-tab ' + (selectedRole === "admin" ? "active-admin" : "") + '" data-action="select-role" data-role="admin">Administrator</button>' +
            "</div>" +
            (loginError ? '<div class="login-error">' + loginError + "</div>" : "") +
            '<form id="login-form">' +
              '<div class="form-group">' +
                '<label for="login-userid">' + selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) + ' ID</label>' +
                '<input id="login-userid" class="form-input" type="text" value="' + creds.id + '" required />' +
              "</div>" +
              '<div class="form-group">' +
                '<label for="login-password">Password</label>' +
                '<input id="login-password" class="form-input" type="password" value="' + creds.pass + '" required />' +
              "</div>" +
              '<button type="submit" class="' + btnClass + '">Login as ' + selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) + "</button>" +
            "</form>" +
            '<p style="margin:14px 0 0;font-size:12px;color:#64748b;text-align:center;">FE AI &amp; ML Division B &bull; Academic Year 2026–27</p>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  return {
    getLogoSvg: getLogoSvg,
    setRole: setRole,
    quickLogin: quickLogin,
    handleFormSubmit: handleFormSubmit,
    render: render
  };
})();
