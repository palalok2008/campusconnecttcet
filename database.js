
window.TCET_DB = (function () {
  const STORAGE_KEY = "tcet_erp_group6_db_v1";
  const FB_URL_KEY = "tcet_erp_firebase_url_v1";
  const CHANNEL_NAME = "tcet_erp_live_sync_channel";

  let state = null;
  let listeners = [];
  let channel = null;
  let pollTimer = null;
  let lastSavedHash = "";

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getFirebaseUrl() {
    let saved = "";
    try {
      saved = localStorage.getItem(FB_URL_KEY) || "";
    } catch (e) {}
    const fromConfig = (window.TCET_FIREBASE_CONFIG && window.TCET_FIREBASE_CONFIG.databaseURL) || "";
    const url = (saved || fromConfig).trim().replace(/\/+$/, "");
    return url.startsWith("https://") ? url : "";
  }

  function setFirebaseUrl(url) {
    const clean = (url || "").trim().replace(/\/+$/, "");
    try {
      if (clean) localStorage.setItem(FB_URL_KEY, clean);
      else localStorage.removeItem(FB_URL_KEY);
    } catch (e) {}
    startFirebasePolling();
    if (clean) {
      pushToFirebase(state);
    }
    notifyListeners("Database mode updated");
  }

  function loadInitialState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.studyTracker && window.TCET_INITIAL_DATA.studyTracker) {
          parsed.studyTracker = deepClone(window.TCET_INITIAL_DATA.studyTracker);
        }
        return parsed;
      }
    } catch (e) {}
    return deepClone(window.TCET_INITIAL_DATA);
  }

  function persistLocal(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  async function pushToFirebase(data) {
    const fbUrl = getFirebaseUrl();
    if (!fbUrl) return;
    try {
      await fetch(fbUrl + "/tcet_erp_group6.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn("Firebase write skipped/offline:", err);
    }
  }

  async function pullFromFirebase() {
    const fbUrl = getFirebaseUrl();
    if (!fbUrl) return;
    try {
      const res = await fetch(fbUrl + "/tcet_erp_group6.json");
      if (!res.ok) return;
      const remote = await res.json();
      if (remote && remote.attendance && remote.users) {
        const remoteStr = JSON.stringify(remote);
        if (remoteStr !== lastSavedHash) {
          lastSavedHash = remoteStr;
          state = remote;
          persistLocal(state);
          notifyListeners("Live cloud update received from Firebase");
        }
      }
    } catch (err) {
      console.warn("Firebase poll offline:", err);
    }
  }

  function startFirebasePolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (getFirebaseUrl()) {
      pullFromFirebase();
      pollTimer = setInterval(pullFromFirebase, 3000);
    }
  }

  function notifyListeners(reason) {
    listeners.forEach(function (fn) {
      try {
        fn(state, reason);
      } catch (e) {}
    });
  }

  function init() {
    state = loadInitialState();
    lastSavedHash = JSON.stringify(state);
    persistLocal(state);

    /* Real-time cross-tab sync via BroadcastChannel */
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = function (ev) {
          if (ev.data && ev.data.payload) {
            state = ev.data.payload;
            lastSavedHash = JSON.stringify(state);
            persistLocal(state);
            notifyListeners(ev.data.reason || "Live update received");
          }
        };
      } catch (e) {}
    }

    /* Fallback cross-tab sync via window storage event */
    window.addEventListener("storage", function (ev) {
      if (ev.key === STORAGE_KEY && ev.newValue) {
        try {
          state = JSON.parse(ev.newValue);
          lastSavedHash = ev.newValue;
          notifyListeners("Live update received");
        } catch (e) {}
      }
    });

    startFirebasePolling();
  }

  function getState() {
    if (!state) init();
    return state;
  }

  function saveState(mutatorFn, reason) {
    if (!state) init();
    mutatorFn(state);
    lastSavedHash = JSON.stringify(state);
    persistLocal(state);

    if (channel) {
      try {
        channel.postMessage({ payload: state, reason: reason || "Data updated" });
      } catch (e) {}
    }

    pushToFirebase(state);
    notifyListeners(reason || "Saved");
  }

  function resetDemoData() {
    state = deepClone(window.TCET_INITIAL_DATA);
    lastSavedHash = JSON.stringify(state);
    persistLocal(state);
    if (channel) {
      try {
        channel.postMessage({ payload: state, reason: "Demo data reset" });
      } catch (e) {}
    }
    pushToFirebase(state);
    notifyListeners("Demo data restored to defaults");
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  /* Helper: Compute attendance percentage for a subject (ignores Cancelled) */
 function getStudentAttendanceLogs(subjectKey, studentId) {
    const s = getState();
    const baseLogs = (s.attendance && s.attendance[subjectKey]) || [];
    if (studentId && s.attendanceByStudent && s.attendanceByStudent[studentId] && s.attendanceByStudent[studentId][subjectKey]) {
      return s.attendanceByStudent[studentId][subjectKey];
    }
    return baseLogs;
  }

  function calcSubjectAttendance(subjectKey, studentId) {
    const logs = getStudentAttendanceLogs(subjectKey, studentId);
    let present = 0;
    let conducted = 0;
    logs.forEach(function (entry) {
      if (entry.status === "Present") { present++; conducted++; }
      else if (entry.status === "Absent") { conducted++; }
    });
    return conducted === 0 ? 100 : Math.round((present / conducted) * 100);
  }

  function calcOverallAttendance(studentId) {
    const keys = Object.keys(getState().attendance || {});
    if (!keys.length) return 0;
    let total = 0;
    keys.forEach(function (k) { total += calcSubjectAttendance(k, studentId); });
    return Math.round(total / keys.length);
  }

  function calcExamOverall(examName) {
    const exam = getState().exams[examName];
    if (!exam || exam.status !== "published") return null;
    const vals = Object.values(exam.subjects).filter(function (v) {
      return typeof v === "number";
    });
    if (!vals.length) return null;
    return Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length);
  }

  function calcAllExamsOverall() {
    const names = Object.keys(getState().exams || {});
    const scores = [];
    names.forEach(function (n) {
      const avg = calcExamOverall(n);
      if (avg !== null) scores.push(avg);
    });
    if (!scores.length) return 0;
    return Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length);
  }

  function calcSubjectExamAverage(shortSub) {
    const exams = getState().exams || {};
    const scores = [];
    Object.keys(exams).forEach(function (name) {
      const ex = exams[name];
      if (ex.status === "published" && typeof ex.subjects[shortSub] === "number") {
        scores.push(ex.subjects[shortSub]);
      }
    });
    if (!scores.length) return 0;
    return Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length);
  }

  function calcSyllabusSubjectPct(subKey) {
    const mods = (getState().syllabus && getState().syllabus[subKey]) || [];
    if (!mods.length) return 0;
    const sum = mods.reduce(function (a, m) { return a + Number(m.completion || 0); }, 0);
    return Math.round(sum / mods.length);
  }

  function calcOverallSyllabusPct() {
    const keys = Object.keys(getState().syllabus || {});
    if (!keys.length) return 0;
    const sum = keys.reduce(function (a, k) { return a + calcSyllabusSubjectPct(k); }, 0);
    return Math.round(sum / keys.length);
  }

  return {
    init: init,
    getState: getState,
    saveState: saveState,
    resetDemoData: resetDemoData,
    subscribe: subscribe,
    getFirebaseUrl: getFirebaseUrl,
    setFirebaseUrl: setFirebaseUrl,
    getStudentAttendanceLogs: getStudentAttendanceLogs,
    calcSubjectAttendance: calcSubjectAttendance,
    calcOverallAttendance: calcOverallAttendance,
    calcExamOverall: calcExamOverall,
    calcAllExamsOverall: calcAllExamsOverall,
    calcSubjectExamAverage: calcSubjectExamAverage,
    calcSyllabusSubjectPct: calcSyllabusSubjectPct,
    calcOverallSyllabusPct: calcOverallSyllabusPct
  };
})();
