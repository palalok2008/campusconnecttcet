/* ==========================================================================
   Initial Seed Data for TCET Mumbai — FE Sem I (AI & ML, Division B)
   Matches every subject, percentage, exam, module, and schedule in the
   Group 6 PS rough sketch PDF.
   ========================================================================== */

window.TCET_INITIAL_DATA = {
  college: {
    name: "Thakur College of Engineering and Technology (TCET), Mumbai",
    shortName: "TCET Mumbai",
    projectTag: "Group 6 — PS ERP Portal"
  },

  users: {
    students: [
      {
        id: "STU202601",
        password: "student123",
        name: "Aarav Deshmukh",
        age: 18,
        year: "FE",
        sem: "Sem I",
        branch: "AIML",
        division: "B",
        rollNo: "B-14"
      },
      {
        id: "STU202602",
        password: "student123",
        name: "Ananya Kulkarni",
        age: 18,
        year: "FE",
        sem: "Sem I",
        branch: "AIML",
        division: "B",
        rollNo: "B-15"
      },
      {
        id: "STU202603",
        password: "student123",
        name: "Rohan Patil",
        age: 19,
        year: "FE",
        sem: "Sem I",
        branch: "AIML",
        division: "B",
        rollNo: "B-16"
      },
      {
        id: "STU202604",
        password: "student123",
        name: "Priya Nair",
        age: 18,
        year: "FE",
        sem: "Sem I",
        branch: "AIML",
        division: "B",
        rollNo: "B-17"
      }
    ],
    teachers: [
      {
        id: "FAC202601",
        password: "teacher123",
        name: "Prof. Rajesh Sharma",
        department: "Applied Sciences & Humanities",
        subject: "Chemistry",
        phone: "+91 98201 11223"
      },
      {
        id: "FAC202602",
        password: "teacher123",
        name: "Prof. Sneha Joshi",
        department: "Engineering Mathematics",
        subject: "Maths",
        phone: "+91 98201 44556"
      }
    ],
    admins: [
      {
        id: "ADM202601",
        password: "admin123",
        name: "Dr. Meera Kulkarni",
        designation: "ERP Portal Administrator",
        department: "TCET Administration"
      }
    ]
  },

  subjects: [
    { key: "Maths", short: "Math", fullName: "Engineering Mathematics - I", faculty: "Prof. Sneha Joshi" },
    { key: "Chemistry", short: "Chem", fullName: "Engineering Chemistry", faculty: "Prof. Rajesh Sharma" },
    { key: "EM", short: "EM", fullName: "Engineering Mechanics", faculty: "Prof. Vikram Rao" },
    { key: "PPS", short: "PPS", fullName: "Programming for Problem Solving", faculty: "Prof. Neha Verma" },
    { key: "IIKS", short: "IIKS", fullName: "Indian Knowledge System", faculty: "Prof. Amit Desai" }
  ],

  /* Attendance logs per subject (drives Student Dashboard, Attendance tab, and Chemistry detail modal) */
  attendance: {
    Maths: [
      { date: "18/08", time: "10:30 - 11:30", status: "Present" },
      { date: "19/08", time: "11:30 - 12:30", status: "Present" },
      { date: "20/08", time: "11:30 - 12:30", status: "Present" },
      { date: "21/08", time: "11:30 - 12:30", status: "Present" },
      { date: "22/08", time: "09:30 - 10:30", status: "Absent" },
      { date: "25/08", time: "10:30 - 11:30", status: "Present" },
      { date: "26/08", time: "11:30 - 12:30", status: "Present" },
      { date: "27/08", time: "11:30 - 12:30", status: "Present" }
    ],
    Chemistry: [
      { date: "18/08", time: "08:30 - 09:30", status: "Present" },
      { date: "19/08", time: "11:30 - 12:30", status: "Absent" },
      { date: "19/08", time: "12:30 - 13:30", status: "Present" },
      { date: "21/08", time: "08:30 - 09:30", status: "Cancelled" },
      { date: "21/08", time: "14:30 - 15:30", status: "Present" },
      { date: "25/08", time: "11:30 - 12:30", status: "Present" },
      { date: "26/08", time: "12:30 - 13:30", status: "Present" },
      { date: "27/08", time: "10:30 - 11:30", status: "Present" },
      { date: "28/08", time: "11:30 - 12:30", status: "Present" },
      { date: "29/08", time: "09:30 - 10:30", status: "Present" }
    ],
    EM: [
      { date: "18/08", time: "09:30 - 10:30", status: "Present" },
      { date: "19/08", time: "11:30 - 12:30", status: "Present" },
      { date: "20/08", time: "12:30 - 13:30", status: "Present" },
      { date: "21/08", time: "10:30 - 11:30", status: "Present" },
      { date: "25/08", time: "09:30 - 10:30", status: "Present" },
      { date: "26/08", time: "11:30 - 12:30", status: "Present" }
    ],
    PPS: [
      { date: "18/08", time: "12:30 - 13:30", status: "Present" },
      { date: "19/08", time: "10:30 - 11:30", status: "Present" },
      { date: "22/08", time: "11:30 - 12:30", status: "Present" },
      { date: "25/08", time: "12:30 - 13:30", status: "Present" },
      { date: "26/08", time: "10:30 - 11:30", status: "Present" }
    ],
    IIKS: [
      { date: "19/08", time: "13:30 - 14:30", status: "Present" },
      { date: "21/08", time: "13:30 - 14:30", status: "Absent" },
      { date: "22/08", time: "12:30 - 13:30", status: "Present" },
      { date: "26/08", time: "13:30 - 14:30", status: "Present" },
      { date: "28/08", time: "13:30 - 14:30", status: "Present" },
      { date: "29/08", time: "12:30 - 13:30", status: "Absent" },
      { date: "30/08", time: "10:30 - 11:30", status: "Present" }
    ]
  },

  /* Weekly Timetable (Sketch Page 2 Bottom + horizontal scrollable slots) */
  timeSlots: ["09:30", "10:30", "11:30", "12:30", "13:30", "14:30"],
  timetable: {
    Mon: {
      "09:30": { subject: "EM", faculty: "Prof. Rao" },
      "10:30": { subject: "Math", faculty: "Prof. Joshi" },
      "11:30": { subject: "Chem", faculty: "Prof. Sharma" },
      "12:30": { subject: "PPS", faculty: "Prof. Verma" },
      "13:30": null,
      "14:30": { subject: "PPS Lab", faculty: "Prof. Verma" }
    },
    Tue: {
      "09:30": null,
      "10:30": { subject: "PPS", faculty: "Prof. Verma" },
      "11:30": { subject: "EM", faculty: "Prof. Rao" },
      "12:30": { subject: "Chem", faculty: "Prof. Sharma" },
      "13:30": { subject: "IIKS", faculty: "Prof. Desai" },
      "14:30": null
    },
    Wed: {
      "09:30": null,
      "10:30": null,
      "11:30": { subject: "Math", faculty: "Prof. Joshi" },
      "12:30": { subject: "EM", faculty: "Prof. Rao" },
      "13:30": { subject: "Chem Lab", faculty: "Prof. Sharma" },
      "14:30": { subject: "Chem Lab", faculty: "Prof. Sharma" }
    },
    Thu: {
      "09:30": null,
      "10:30": { subject: "EM", faculty: "Prof. Rao" },
      "11:30": { subject: "Math", faculty: "Prof. Joshi" },
      "12:30": { subject: "Chem", faculty: "Prof. Sharma" },
      "13:30": { subject: "IIKS", faculty: "Prof. Desai" },
      "14:30": null
    },
    Fri: {
      "09:30": null,
      "10:30": { subject: "Math", faculty: "Prof. Joshi" },
      "11:30": { subject: "PPS", faculty: "Prof. Verma" },
      "12:30": { subject: "IIKS", faculty: "Prof. Desai" },
      "13:30": { subject: "EM Lab", faculty: "Prof. Rao" },
      "14:30": null
    },
    Sat: {
      "09:30": { subject: "PS Lab", faculty: "Prof. Verma" },
      "10:30": { subject: "PS Lab", faculty: "Prof. Verma" },
      "11:30": { subject: "Math Tut", faculty: "Prof. Joshi" },
      "12:30": null,
      "13:30": null,
      "14:30": null
    }
  },

  tomorrowTimetable: [
    { subject: "EM", time: "09:30 - 10:30" },
    { subject: "Math", time: "10:30 - 11:30" },
    { subject: "Chem", time: "11:30 - 12:30" },
    { subject: "PPS", time: "12:30 - 13:30" }
  ],

  submissions: {
    daily: [
      { date: "11/08", title: "EM Practical" },
      { date: "12/08", title: "Nothing" }
    ],
    thisWeek: [
      { title: "Chem PPT", date: "13/08" },
      { title: "PPS PPT", date: "17/08" }
    ],
    thisMonth: [
      { title: "IIKS PPT", date: "21/08" },
      { title: "EM Practical", date: "29/08" }
    ],
    allList: [
      { topic: "EM Practical", date: "27/08" },
      { topic: "Chem Prac", date: "29/08" },
      { topic: "Chem Presentation", date: "03/09" },
      { topic: "PPS Lab Journal", date: "08/09" },
      { topic: "IIKS Essay", date: "12/09" }
    ]
  },

  /* Announcements (Sketch Page 3 Top & Page 4 Top) */
  announcements: [
    {
      id: "ann-1",
      category: "Academic",
      title: "Submission of Aadhaar Card Xerox",
      body: "Please submit a clear photocopy of your Aadhaar card to the TCET Admin Office (Room 104) by 29 September for Mumbai University enrollment verification.",
      contact: "Prof. Rajesh Sharma on +91 98201 11223",
      author: "Prof. Rajesh Sharma",
      date: "20/08/2026"
    },
    {
      id: "ann-2",
      category: "Academic",
      title: "ISE 1 Examination Hall Tickets Released",
      body: "Students of FE AI & ML Division B can collect their signed ISE 1 hall tickets from the class coordinator before 4:00 PM on Friday.",
      contact: "Prof. Sneha Joshi on +91 98201 44556",
      author: "Exam Cell, TCET",
      date: "18/08/2026"
    },
    {
      id: "ann-3",
      category: "Academic",
      title: "Engineering Chemistry Lab Safety Coat Mandatory",
      body: "All first-year students must bring their white laboratory apron and practical journal for every Chemistry lab session starting next week.",
      contact: "Prof. Rajesh Sharma on +91 98201 11223",
      author: "Chemistry Dept.",
      date: "16/08/2026"
    },
    {
      id: "ann-4",
      category: "Academic",
      title: "PS Group Project Progress Review",
      body: "All FE Project Seminar groups (Groups 1 to 10) must present their working prototype and code documentation during Saturday's PS Lab slot.",
      contact: "Prof. Neha Verma on +91 98201 77889",
      author: "AIML Department",
      date: "14/08/2026"
    },
    {
      id: "ann-5",
      category: "Events",
      title: "Zephyr 2026 Technical Fest Registrations Open",
      body: "Register for coding hackathons, robotics challenges, and AI workshops at TCET's annual technical festival Zephyr 2026.",
      contact: "Student Council Desk, Ground Floor",
      author: "TCET Student Council",
      date: "21/08/2026"
    },
    {
      id: "ann-6",
      category: "Events",
      title: "AI & ML Club Introductory Bootcamp",
      body: "Join the hands-on Python and Machine Learning orientation session in the Auditorium this Saturday at 2:00 PM.",
      contact: "AIML Student Chapter",
      author: "TCET AI Club",
      date: "19/08/2026"
    },
    {
      id: "ann-7",
      category: "Events",
      title: "Inter-Department Chess & Table Tennis Trials",
      body: "Interested FE students can report to the TCET Gymkhana at 4:30 PM with their college ID card for selection trials.",
      contact: "Sports Coordinator, Gymkhana",
      author: "TCET Sports Committee",
      date: "15/08/2026"
    }
  ],

  /* Exams (Sketch Page 3 Bottom & Page 4 Bottom) */
  exams: {
    "ISE 1": {
      status: "published",
      subjects: { Math: 80, Chem: 75, EM: 90, PPS: 95, IIKS: 85 }
    },
    "ISE 2": {
      status: "published",
      subjects: { Math: 78, Chem: 74, EM: 86, PPS: 76, IIKS: 81 }
    },
    "ISE 3": {
      status: "published",
      subjects: { Math: 84, Chem: 79, EM: 92, PPS: 74, IIKS: 86 }
    },
    "IE": {
      status: "published",
      subjects: { Math: 78, Chem: 72, EM: 92, PPS: 65, IIKS: 78 }
    },
    "Term Work": {
      status: "pending",
      subjects: { Math: null, Chem: null, EM: null, PPS: null, IIKS: null }
    },
    "Practicals": {
      status: "pending",
      subjects: { Math: null, Chem: null, EM: null, PPS: null, IIKS: null }
    },
    "End Sem": {
      status: "pending",
      subjects: { Math: null, Chem: null, EM: null, PPS: null, IIKS: null }
    }
  },

  /* Syllabus Modules (Sketch Page 5 Top & Page 6 Top) */
  syllabus: {
    Maths: [
      { id: "I", title: "Matrices", completion: 100 },
      { id: "II", title: "Vectors", completion: 80 },
      { id: "III", title: "Complex Numbers", completion: 60 },
      { id: "IV", title: "Calculus", completion: 0 }
    ],
    PPS: [
      { id: "I", title: "Algorithms & Flowcharts", completion: 70 },
      { id: "II", title: "C Fundamentals & Operators", completion: 50 },
      { id: "III", title: "Control Statements & Loops", completion: 0 },
      { id: "IV", title: "Functions, Arrays & Pointers", completion: 0 }
    ],
    Chem: [
      { id: "I", title: "Atomic & Molecular Structure", completion: 90 },
      { id: "II", title: "Water Technology", completion: 80 },
      { id: "III", title: "Polymers & Nanomaterials", completion: 50 },
      { id: "IV", title: "Green Chemistry & Fuels", completion: 0 }
    ],
    IIKS: [
      { id: "I", title: "Foundations of Indian Knowledge System", completion: 100 },
      { id: "II", title: "Ancient Indian Mathematics & Astronomy", completion: 100 },
      { id: "III", title: "Town Planning & Architecture", completion: 68 },
      { id: "IV", title: "Traditional Healthcare & Sustainability", completion: 0 }
    ],
    EM: [
      { id: "I", title: "System of Coplanar Forces", completion: 90 },
      { id: "II", title: "Equilibrium of Rigid Bodies", completion: 78 },
      { id: "III", title: "Friction & Centroid", completion: 0 },
      { id: "IV", title: "Kinematics of Particles", completion: 0 }
    ]
  },

  /* YPT-Style Study Timer, Daily To-Do & TCET Group Leaderboard */
  studyTracker: {
    dailyGoalMinutes: 240,
    streakDays: 5,
    subjectSeconds: {
      Maths: 3300,
      Chemistry: 2400,
      EM: 1800,
      PPS: 2700,
      IIKS: 900
    },
    todos: [
      { id: "todo-1", subject: "Maths", text: "Solve 10 Matrices & Rank problems", done: true },
      { id: "todo-2", subject: "PPS", text: "Practice C pointers & arrays lab questions", done: false },
      { id: "todo-3", subject: "Chemistry", text: "Revise Water Technology numericals", done: false }
    ],
    sessions: [
      { subject: "Maths", start: "07:15", end: "08:10", seconds: 3300 },
      { subject: "PPS", start: "08:30", end: "09:15", seconds: 2700 },
      { subject: "Chemistry", start: "09:30", end: "10:10", seconds: 2400 }
    ],
    peers: [
      { id: "STU202602", name: "Ananya Kulkarni", status: "Studying", activeSubject: "Maths", secondsToday: 12900 },
      { id: "STU202603", name: "Rohan Patil", status: "Studying", activeSubject: "PPS", secondsToday: 9600 },
      { id: "STU202604", name: "Priya Nair", status: "On Break", activeSubject: "EM", secondsToday: 7200 }
    ]
  }
};
