const modal = document.querySelector("#info-modal");
const modalTitle = document.querySelector("#modal-title");
const modalDescription = document.querySelector("#modal-description");
const modalContent = document.querySelector("#modal-content");
const modalDone = document.querySelector("#modal-done");
const modalClose = modal.querySelector(".modal-close");
const modalPanel = modal.querySelector(".modal-panel");
const sidebar = document.querySelector("#main-sidebar");
const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
const aiToggleButton = document.querySelector("#ai-toggle-btn");
const aiChatWindow = document.querySelector("#ai-chat-window");
const aiChatMessages = document.querySelector("#ai-chat-messages");
const aiChatForm = document.querySelector("#ai-chat-form");
const aiUserInput = document.querySelector("#chatInput, #ai-user-input");
const micButton = document.querySelector("#micBtn");
const aiVoiceToggle = document.querySelector("#ai-voice-toggle");
const aiSendButton = document.querySelector("#ai-send-btn");
let aiVoiceEnabled = true;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let speechRecognition = null;
let isListening = false;
if (SpeechRecognition && micButton) {
  speechRecognition = new SpeechRecognition();
  speechRecognition.lang = "hi-IN";
  speechRecognition.interimResults = false;
  speechRecognition.maxAlternatives = 1;
  speechRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    aiUserInput.value = transcript;
    void sendAiMessage();
  };
  speechRecognition.onend = () => {
    isListening = false;
    micButton.classList.remove("listening");
  };
  speechRecognition.onerror = (event) => {
    console.error("Speech recognition failed.", event.error);
    isListening = false;
    micButton.classList.remove("listening");
  };
} else if (micButton) {
  micButton.disabled = true;
  micButton.title = "Voice input is not supported in this browser";
  micButton.setAttribute("aria-label", "Voice input is not supported in this browser");
}
const searchInput = document.querySelector("#dashboard-search");
const cards = [...document.querySelectorAll(".dashboard-card")];
const filterTabs = [...document.querySelectorAll(".filter-tab")];
const emptyState = document.querySelector("#empty-state");
const announcementCard = document.querySelector(".card-announcements");
const announcementCount = document.querySelector("[data-announcement-count]");
const announcementBadge = document.querySelector("[data-announcement-badge]");
const announcementPreview = document.querySelector("[data-announcement-preview]");
const announcementUpdated = document.querySelector("[data-announcement-updated]");
const announcementError = document.querySelector("[data-announcement-error]");
const dashboardOverview = document.querySelector("#dashboard-overview");
const adminView = document.querySelector("#admin-view");
const adminManagementView = document.querySelector("#admin-management-view");
const adminNoticeForm = document.querySelector("#admin-notice-form");
const adminNoticeRows = document.querySelector("#admin-notice-rows");
const adminNavLink = document.querySelector(".admin-nav-link");
const authorizedFacultyEmail = "sparshshri2003@gmail.com";
const firebaseConfig = {
  apiKey: "AIzaSyBxuuyR8C3qbi4WHxsjOVF6f_oZZ5A0arY",
  authDomain: "ai-ds-portal.firebaseapp.com",
  projectId: "ai-ds-portal",
  messagingSenderId: "1026402710531",
  appId: "1:1026402710531:web:dd89d3994206cea15b8a36",
  measurementId: "G-FETNGNKNK6"
};
let firebaseAuth = null;
let firestore = null;
let announcementsCollection = null;
let firebaseInitializationError = "";
try {
  const firebaseApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
  firebaseAuth = firebaseApp.auth();
  firestore = firebaseApp.firestore();
  announcementsCollection = firestore.collection("announcements");
} catch (error) {
  firebaseInitializationError = "Firebase could not be initialized. Check the Firebase CDN connection and configuration.";
  console.error(firebaseInitializationError, error);
}
let activeFilter = "all";
let lastFocusedElement = null;
let activeSemester = "";
let announcements = [];
let adminSession = "";
let adminActiveSection = "announcements";
let adminStorageError = "";
let activeModalModule = "";
let activeSubjectSelection = "";
let activeSubjectId = "";
let subjectResources = [];
let subjectResourceError = "";
let activeAdminCategoryEdit = null;
let portalStructure = [];
let portalStructureError = "";
const moduleErrors = {};
const moduleRecords = {
  subjects: [],
  timetables: [],
  projects: [],
  syllabus: [],
  placement: [],
  outcomes: [],
  connect: []
};
const moduleSubscriptions = [];
const subjectResourceCategories = [
  { name: "Syllabus", icon: "scroll-text" },
  { name: "Subject Notes", icon: "notebook-tabs" },
  { name: "Assignments", icon: "clipboard-check" },
  { name: "Quizzes", icon: "circle-help" },
  { name: "Lab Experiments", icon: "flask-conical" },
  { name: "MST Old Papers", icon: "file-clock" },
  { name: "Question Bank", icon: "library" },
  { name: "RGPV Old Papers", icon: "graduation-cap" },
  { name: "Important Links", icon: "link-2" }
];
const defaultSemesterNames = ["3rd Sem", "5th Sem", "7th Sem"];
let defaultSemesterBootstrapInProgress = false;
let defaultSemesterBootstrapComplete = false;
const semesterPills = document.querySelector("#semester-pills");
const semesterCount = document.querySelector("#semester-count");
const activeSemesterStat = document.querySelector("#active-semester-stat");
const moduleDefinitions = {
  announcements: {
    collection: "announcements",
    label: "Announcements & Notices",
    icon: "megaphone",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "category", label: "Category", type: "select", options: ["New", "Academic", "General"], required: true },
      { name: "body", label: "Content", type: "textarea", required: true },
      { name: "link", label: "Google Drive URL / PDF Link", type: "url" }
    ]
  },
  subjects: {
    collection: "subjects",
    label: "Semesters & Subjects",
    icon: "book-open-check",
    fields: [
      { name: "semester", label: "Semester", required: true },
      { name: "subjectName", label: "Subject Name", required: true },
      { name: "facultyName", label: "Faculty / Mentor Name" },
      { name: "contactNumber", label: "Contact Number", type: "tel" },
      { name: "facultyEmail", label: "Faculty Email Address", type: "email" },
      { name: "subjectDescription", label: "Subject Description / General Information", type: "textarea" },
      { name: "syllabusUrl", label: "Syllabus Drive URL", type: "url" },
      { name: "notesUrl", label: "Notes Drive URL", type: "url" }
    ]
  },
  timetables: {
    collection: "timetables",
    label: "Timetables & Schedules",
    icon: "calendar-clock",
    fields: [
      { name: "batchSem", label: "Batch / Semester", required: true, maxLength: 100 },
      { name: "title", label: "Title", required: true },
      { name: "timetableLink", label: "Timetable Drive Link", type: "url", required: true, googleDrive: true }
    ]
  },
  projects: {
    collection: "projectResources",
    label: "Project Tracker",
    icon: "folder-kanban",
    fields: [
      { name: "projectType", label: "Project Type", type: "select", options: ["Minor", "Major"], required: true },
      { name: "guidelinesLink", label: "Guidelines Drive Link", type: "url" },
      { name: "submissionsLink", label: "Submissions Drive Link", type: "url" }
    ]
  },
  syllabus: {
    collection: "schemeSyllabus",
    label: "Scheme & Syllabus",
    icon: "files",
    fields: [
      { name: "branchSem", label: "Branch / Semester", required: true, maxLength: 100 },
      { name: "repositoryLink", label: "Repository Drive URL", type: "url", required: true, googleDrive: true }
    ]
  },
  placement: {
    collection: "trainingPlacement",
    label: "Training & Placement",
    icon: "briefcase-business",
    fields: [
      { name: "trainingUpdatesLink", label: "Training Updates Drive Link", type: "url" },
      { name: "placementRulesLink", label: "Placement Rules Drive Link", type: "url" },
      { name: "resumeLinks", label: "Resume Links Drive URL", type: "url" }
    ]
  },
  outcomes: {
    collection: "outcomes",
    label: "CO-PO & PSO Outcomes",
    icon: "chart-no-axes-combined",
    fields: [
      { name: "documentLink", label: "Outcomes Document Drive Link", type: "url", required: true }
    ]
  },
  connect: {
    collection: "connectLinks",
    label: "Connect & Explore",
    icon: "link-2",
    fields: [
      { name: "platform", label: "Social Media / Resource Name", required: true },
      { name: "driveLink", label: "Social Media / Department Drive Link", type: "url", required: true }
    ]
  }
};

const modalDetails = {
  announcements: {
    title: "Announcements & notices",
    description: "Department updates posted by faculty and administrators.",
    content: ""
  },
  schedule: {
    title: "Timetables & schedules",
    description: "Find the schedule information you need for the semester.",
    content: "<ul><li>Class and laboratory timetables</li><li>Examination schedules and academic calendar</li><li>Check with your faculty for the latest confirmed timings</li></ul>"
  },
  projects: {
    title: "Project tracker",
    description: "Plan, build, and present your minor or major project.",
    content: ""
  },
  syllabus: {
    title: "Scheme & syllabus",
    description: "The academic repository for scheme and syllabus resources.",
    content: "<ul><li>Browse curriculum and course structure by semester</li><li>Confirm you are using the current academic-year version</li></ul>"
  },
  placement: {
    title: "Training & placement",
    description: "Explore resources to prepare for the next step in your career.",
    content: "<ul><li>Training and skill-building resources</li><li>Career preparation and interview guidance</li><li>Placement updates and opportunities</li></ul>"
  },
  outcomes: {
    title: "CO–PO & PSO framework",
    description: "Understand how course and program outcomes connect.",
    content: "<ul><li>Course Outcomes (CO)</li><li>Program Outcomes (PO)</li><li>Program Specific Outcomes (PSO)</li></ul>"
  },
  about: {
    title: "About the department",
    description: "Computer Science – Artificial Intelligence & Data Science at JNCT Bhopal.",
    content: "A place to build strong foundations in computing, explore intelligent technologies, and turn ideas into practical solutions. Connect with your department for current program information."
  },
  credits: {
    title: "Credits",
    description: "Designed as a shared academic home for the JNCT Bhopal AI & Data Science community.",
    content: "Department of Computer Science – AI & Data Science · Jai Narain College of Technology, Bhopal."
  },
  privacy: {
    title: "Privacy policy",
    description: "This dashboard uses Firebase for department announcements and faculty sign-in.",
    content: "Announcements, curriculum, schedules, and department resources are read from the department's Firebase Firestore database. Faculty sign-in is handled by Firebase Authentication."
  },
  guidelines: {
    title: "AI & Data Science department guidelines",
    description: "A quick reminder for using department resources.",
    content: "<ul><li>Use current department-approved academic material and schedules.</li><li>Respect academic integrity, privacy, and responsible use of AI tools.</li><li>Confirm important notices and submissions with your faculty coordinator.</li></ul>"
  },
  help: {
    title: "Your department hub",
    description: "Use the dashboard to get to the right resource, faster.",
    content: "<ul><li>Filter resources by Academics, Student life, or Department.</li><li>Search by keyword to find the right dashboard card.</li><li>Ask your faculty coordinator if a resource needs an update.</li></ul>"
  },
};

function safeAnnouncementLink(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isGoogleDriveLink(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:"
      && ["drive.google.com", "docs.google.com", "drive.usercontent.google.com"]
        .some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function formatAnnouncementDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently posted";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function localInputDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderAnnouncementDashboard() {
  const count = announcements.length;
  announcementCount.textContent = String(count).padStart(2, "0");
  announcementBadge.textContent = `${count} NEW`;

  if (!count) {
    announcementPreview.textContent = "Stay in the loop with the latest department updates and circulars.";
    announcementUpdated.textContent = "No announcements yet";
    announcementCard.dataset.announcementTitle = "";
    announcementCard.dataset.announcementDate = "";
    announcementCard.dataset.announcementDescription = "";
  } else {
    const latest = announcements[0];
    announcementPreview.textContent = latest.title;
    const date = formatAnnouncementDate(latest.date || latest.createdAt);
    announcementUpdated.textContent = `Posted ${date}`;
    announcementCard.dataset.announcementTitle = latest.title || "";
    announcementCard.dataset.announcementDate = date;
    announcementCard.dataset.announcementDescription = latest.body || "";
  }

  announcementCard.dataset.search = `announcements notices circulars latest news updates ${announcements.map(({ title, body }) => `${title} ${body}`).join(" ")}`;
  filterCards();
}

function setAnnouncementError(message) {
  announcementError.textContent = message;
  announcementError.hidden = !message;
}

function firebaseErrorMessage(error, action = "complete the request") {
  if (error?.message?.includes("Cloud Firestore API has not been used") || error?.message?.includes("Cloud Firestore API is disabled")) {
    return "Enable the Cloud Firestore API for the ai-ds-portal Firebase project, then reload this page.";
  }
  const messages = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-login-credentials": "The email or password is incorrect.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid faculty email address.",
    "auth/user-disabled": "This faculty account has been disabled.",
    "auth/too-many-requests": "Too many sign-in attempts. Please wait and try again.",
    "auth/network-request-failed": "Could not reach Firebase Authentication. Check your internet connection.",
    "auth/operation-not-allowed": "Email/Password sign-in is not enabled in Firebase Authentication.",
    "permission-denied": "Firebase denied this operation. Check your Firestore security rules.",
    "unavailable": "Firebase is temporarily unavailable. Try again shortly."
  };
  return messages[error?.code] || `Could not ${action}. ${error?.message || "Check your Firebase configuration and security rules."}`;
}

function isAuthorizedFaculty(user = firebaseAuth?.currentUser) {
  return String(user?.email || "").trim().toLowerCase() === authorizedFacultyEmail;
}

async function signInFaculty(email, password, errorElement, submitButton, onSuccess = () => {}) {
  if (!firebaseAuth) {
    errorElement.textContent = firebaseInitializationError || "Firebase Authentication is unavailable.";
    return;
  }
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail !== authorizedFacultyEmail) {
    errorElement.textContent = `Only ${authorizedFacultyEmail} can access faculty management.`;
    return;
  }
  submitButton.disabled = true;
  errorElement.textContent = "";
  try {
    await firebaseAuth.signInWithEmailAndPassword(normalizedEmail, password);
    onSuccess();
  } catch (error) {
    errorElement.textContent = firebaseErrorMessage(error, "sign in");
    console.error("Firebase faculty sign-in failed.", error);
  } finally {
    if (submitButton.isConnected) submitButton.disabled = false;
  }
}

function handleAuthState(user) {
  if (user && !isAuthorizedFaculty(user)) {
    document.querySelector("#admin-auth-message").textContent = `Access is limited to ${authorizedFacultyEmail}.`;
    if (!adminView.hidden) showDashboardView("overview");
    firebaseAuth.signOut().catch((error) => {
      console.error("Firebase sign out for an unauthorized faculty account failed.", error);
    });
    return;
  }
  adminSession = user?.email || "";
  if (user) {
    if (!portalStructure.length) void ensureDefaultSemesters();
    document.querySelector("#admin-session-name").textContent = adminSession;
    document.querySelector("#admin-auth-message").textContent = "";
    if (modal.classList.contains("open") && modalPanel.classList.contains("portal-modal")) {
      closeModal();
      showDashboardView("admin", adminNavLink);
    }
  } else if (!adminView.hidden) {
    showDashboardView("overview");
  }
}

function startModuleListeners() {
  if (!firestore) {
    setAnnouncementError(firebaseInitializationError || "Firebase is unavailable. Announcements could not be loaded.");
    subjectResourceError = firebaseInitializationError || "Firebase is unavailable. Subject materials could not be loaded.";
    portalStructureError = firebaseInitializationError || "Firebase is unavailable. Department semesters and subjects could not be loaded.";
    renderSemesterShortcuts();
    Object.keys(moduleDefinitions).forEach((key) => {
      moduleErrors[key] = firebaseInitializationError || "Firebase is unavailable. This resource could not be loaded.";
    });
    return;
  }

  setAnnouncementError("Connecting to live announcements...");
  Object.entries(moduleDefinitions).forEach(([moduleKey, definition]) => {
    const collection = firestore.collection(definition.collection);
    moduleSubscriptions.push(collection.onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
      const records = snapshot.docs.map((document) => {
        const data = document.data();
        const createdAtValue = data.createdAt || null;
        const createdAt = createdAtValue?.toDate
          ? createdAtValue.toDate().toISOString()
          : (typeof createdAtValue === "string" ? createdAtValue : "");
        return { ...data, id: document.id, createdAt, createdAtValue };
      });
      if (moduleKey === "announcements") {
        announcements = records.map((record) => ({
          ...record,
          author: typeof record.author === "string" ? record.author.slice(0, 80) : "Department",
          title: typeof record.title === "string" ? record.title.slice(0, 100) : "",
          body: typeof record.body === "string" ? record.body.slice(0, 1000) : "",
          category: ["New", "Academic", "General"].includes(record.category) ? record.category : "General",
          date: typeof record.date === "string" ? record.date : (record.createdAt || localInputDate()).slice(0, 10),
          link: safeAnnouncementLink(record.link) ? record.link : ""
        })).filter((record) => record.title && record.body);
        announcements.sort((left, right) => new Date(right.createdAt || right.date).getTime() - new Date(left.createdAt || left.date).getTime());
        adminStorageError = "";
        delete moduleErrors.announcements;
        setAnnouncementError(snapshot.metadata.fromCache ? "Connecting to live announcements..." : "");
        renderAnnouncementDashboard();
        if (modal.classList.contains("open") && modalTitle.textContent === "Announcements & notices") renderAnnouncementList();
      } else {
        moduleRecords[moduleKey] = records;
        delete moduleErrors[moduleKey];
        if (modal.classList.contains("open") && activeModalModule === moduleKey && moduleKey !== "subjects") {
          renderModuleModal(moduleKey, activeSemester);
        }
        if (moduleKey === "subjects" && modal.classList.contains("open") && !activeSubjectSelection) {
          renderSemesterModal(activeSemester);
        } else if (moduleKey === "subjects" && modal.classList.contains("open") && activeSubjectSelection) {
          renderSubjectDashboard(activeSemester, activeSubjectSelection, activeSubjectId);
        }
        renderModuleAdminList(moduleKey);
        if (moduleKey === "subjects") {
          refreshStructureAdmin();
        }
      }
    }, (error) => {
      const message = firebaseErrorMessage(error, `load ${definition.label.toLowerCase()}`);
      if (moduleKey === "announcements") {
        adminStorageError = message;
        setAnnouncementError(message);
        if (!adminView.hidden) renderAdminNotices();
      } else {
        moduleErrors[moduleKey] = message;
        renderModuleAdminList(moduleKey);
        if (modal.classList.contains("open") && activeModalModule === moduleKey) {
          if (moduleKey === "subjects" && activeSubjectSelection) renderSubjectDashboard(activeSemester, activeSubjectSelection, activeSubjectId);
          else if (moduleKey === "subjects") renderSemesterModal(activeSemester);
          else renderModuleModal(moduleKey, activeSemester);
        }
      }
      console.error(`Firestore ${moduleKey} listener failed.`, error);
    }));
  });

  moduleSubscriptions.push(firestore.collection("subjectResources").onSnapshot((snapshot) => {
    subjectResources = snapshot.docs.map((document) => {
      const data = document.data();
      const createdAtValue = data.createdAt || null;
      const createdAt = createdAtValue?.toDate
        ? createdAtValue.toDate().toISOString()
        : (typeof createdAtValue === "string" ? createdAtValue : "");
      return { ...data, id: document.id, createdAt, createdAtValue };
    }).filter((record) => record.semester && record.subjectName && record.category && safeAnnouncementLink(record.url));
    subjectResourceError = "";
    renderSubjectResourceAdminGrid();
    if (modal.classList.contains("open") && activeModalModule === "subjects" && activeSubjectSelection) {
      renderSubjectDashboard(activeSemester, activeSubjectSelection, activeSubjectId);
    }
  }, (error) => {
    subjectResourceError = firebaseErrorMessage(error, "load subject materials");
    renderSubjectResourceAdminGrid();
    if (modal.classList.contains("open") && activeModalModule === "subjects" && activeSubjectSelection) {
      renderSubjectDashboard(activeSemester, activeSubjectSelection, activeSubjectId);
    }
    console.error("Firestore subject resources listener failed.", error);
  }));

  moduleSubscriptions.push(firestore.collection("portalStructure").onSnapshot((snapshot) => {
    portalStructure = snapshot.docs.map((document) => {
      const data = document.data();
      return {
        id: document.id,
        semesterName: typeof data.semesterName === "string" ? data.semesterName.trim() : "",
        subjects: Array.isArray(data.subjects)
          ? [...new Set(data.subjects.filter((subject) => typeof subject === "string").map((subject) => subject.trim()).filter(Boolean))]
          : []
      };
    }).filter((record) => record.semesterName).sort(compareSemesters);
    portalStructureError = "";
    renderSemesterShortcuts();
    refreshStructureAdmin();
    if (!portalStructure.length) void ensureDefaultSemesters();
    if (modal.classList.contains("open") && activeModalModule === "subjects") {
      const activeRecord = getSemesterRecord(activeSemester);
      if (activeSubjectSelection && activeRecord?.subjects.includes(activeSubjectSelection)) {
        renderSubjectDashboard(activeRecord.semesterName, activeSubjectSelection, activeSubjectId);
      } else {
        activeSubjectSelection = "";
        renderSemesterModal(activeRecord?.semesterName || portalStructure[0]?.semesterName || "");
      }
    }
  }, (error) => {
    portalStructureError = firebaseErrorMessage(error, "load department semesters and subjects");
    renderSemesterShortcuts();
    refreshStructureAdmin();
    if (modal.classList.contains("open") && activeModalModule === "subjects") {
      renderSemesterModal(activeSemester);
    }
    console.error("Firestore portal structure listener failed.", error);
  }));
}

function showDashboardView(section = "overview", selectedNavItem = null) {
  if (section === "admin" && !isAuthorizedFaculty()) {
    showModal("login");
    return;
  }
  const isAdmin = section === "admin";
  dashboardOverview.hidden = isAdmin;
  adminView.hidden = !isAdmin;
  const activeItem = selectedNavItem || (isAdmin
    ? document.querySelector(".admin-nav-link")
    : document.querySelector('[data-nav="Overview"]'));

  document.querySelectorAll(".nav-link").forEach((link) => {
    const selected = link === activeItem;
    link.classList.toggle("active", selected);
    if (link.hasAttribute("aria-current")) link.setAttribute("aria-current", selected ? "page" : "false");
  });

  if (isAdmin) {
    adminManagementView.hidden = false;
    document.querySelector("#admin-session-name").textContent = adminSession;
    renderAdminNotices();
    renderAdminSection(adminActiveSection);
    Object.keys(moduleRecords).forEach(renderModuleAdminList);
  }
}

function renderAdminSection(section) {
  adminActiveSection = section;
  document.querySelectorAll("[data-admin-section]").forEach((panel) => {
    panel.hidden = panel.dataset.adminSection !== section;
  });
  document.querySelectorAll("[data-admin-tab]").forEach((tab) => {
    const selected = tab.dataset.adminTab === section;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  if (moduleDefinitions[section] && section !== "announcements") renderModuleAdminPanel(section);
}

function renderModuleAdminPanel(moduleKey) {
  const panel = document.querySelector(`[data-module-panel="${moduleKey}"]`);
  const definition = moduleDefinitions[moduleKey];
  if (!panel || !definition) return;
  if (moduleKey === "subjects") {
    panel.replaceChildren();
    renderSubjectStructureAdminPanel(panel);
    return;
  }

  const fields = definition.fields.map((field) => {
    const control = field.type === "textarea"
      ? `<textarea name="${field.name}" rows="3" ${field.required ? "required" : ""} maxlength="1000"></textarea>`
      : field.type === "select"
        ? `<select name="${field.name}" ${field.required ? "required" : ""}>${field.options.map((option) => `<option value="${option}">${option}</option>`).join("")}</select>`
        : `<input name="${field.name}" type="${field.type || "text"}" ${field.required ? "required" : ""} ${field.maxLength ? `maxlength="${field.maxLength}"` : ""} ${field.type === "url" ? 'placeholder="https://drive.google.com/..." autocomplete="url"' : ""}>`;
    return `<label class="admin-field ${field.type === "textarea" ? "admin-field-wide" : ""}">${field.label}${control}</label>`;
  }).join("");

  panel.innerHTML = `
    <section class="admin-card">
      <div class="admin-card-heading"><div><h2>${definition.label}</h2><p>Changes sync live to the student dashboard on every connected device.</p></div></div>
      <form class="admin-form" data-module-form="${moduleKey}">
        <input type="hidden" name="id">
        <div class="admin-form-grid">${fields}</div>
        <p class="admin-message" data-module-status="${moduleKey}" aria-live="polite"></p>
        <div class="admin-form-actions">
          <button class="admin-primary-button" type="submit"><i data-lucide="send"></i><span data-module-submit-label="${moduleKey}">Publish</span></button>
          <button class="admin-outline-button" type="button" data-module-cancel="${moduleKey}" hidden>Cancel edit</button>
        </div>
      </form>
    </section>
    <section class="admin-card admin-list-card">
      <div class="admin-card-heading"><div><h2>Published ${definition.label}</h2><p>Update or remove published records.</p></div></div>
      <div class="admin-project-grid" data-module-records="${moduleKey}"></div>
    </section>`;
  renderModuleAdminList(moduleKey);
}

function renderSubjectStructureAdminPanel(panel) {
  panel.innerHTML = `
    <section class="admin-card">
      <div class="admin-card-heading"><div><h2>Manage semesters &amp; subjects</h2><p>Changes are saved to Firestore and appear in the student curriculum automatically.</p></div></div>
      <form class="admin-form" id="semester-create-form">
        <div class="admin-form-grid">
          <label class="admin-field">New semester name<input name="semesterName" maxlength="60" placeholder="e.g. 8th Sem" required></label>
        </div>
        <div class="admin-form-actions"><button class="admin-primary-button" type="submit"><i data-lucide="plus"></i>Add semester</button></div>
      </form>
      <form class="admin-form" id="subject-create-form">
        <input type="hidden" name="subjectRecordId">
        <input type="hidden" name="originalSubjectName">
        <div class="admin-form-grid">
          <label class="admin-field">Semester<select name="semester" required></select></label>
          <label class="admin-field">Subject name<input name="subjectName" maxlength="100" placeholder="e.g. Neural Networks" required></label>
          <label class="admin-field">Faculty / Mentor Name<input name="facultyName" maxlength="100" placeholder="e.g. Prof. Rani Kushwaha"></label>
          <label class="admin-field">Contact Number<input name="contactNumber" type="tel" maxlength="30" placeholder="+91 96697 49406"></label>
          <label class="admin-field">Faculty Email Address<input name="facultyEmail" type="email" maxlength="254" placeholder="faculty@jnctbhopal.ac.in"></label>
          <label class="admin-field admin-field-wide">Subject Description / General Information<textarea name="subjectDescription" rows="3" maxlength="1000" placeholder="Subject-specific guidance, course overview, or notices..."></textarea></label>
        </div>
        <div class="admin-form-actions">
          <button class="admin-primary-button" type="submit"><i data-lucide="book-plus"></i><span id="subject-submit-label">Add subject</span></button>
          <button class="admin-outline-button" type="button" id="subject-cancel-edit" hidden>Cancel edit</button>
        </div>
      </form>
      <p class="admin-message" id="structure-admin-status" aria-live="polite"></p>
      <div id="structure-admin-groups" class="admin-project-grid"></div>
    </section>
    <section class="admin-card">
      <div class="admin-card-heading"><div><h2>Subject learning materials</h2><p>Add multiple titled links per category, including unit notes, lab experiments, old papers, and assignment deadlines. Changes sync live to student dashboards.</p></div></div>
      <form class="admin-form" id="subject-resource-form">
        <div class="admin-form-grid">
          <label class="admin-field">Semester<select name="semester" required></select></label>
          <label class="admin-field">Subject<select name="subjectName" required></select></label>
        </div>
      </form>
      <p class="admin-message" id="subject-resource-status" aria-live="polite"></p>
      <div id="subject-resource-admin-grid" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"></div>
    </section>`;
  refreshStructureAdmin();
  refreshIcons();
}

function updateSemesterSelect(select, selectedValue = "") {
  if (!select) return;
  const value = selectedValue || select.value;
  const semesters = portalStructure.length
    ? portalStructure
    : defaultSemesterNames.map((semesterName) => ({
      id: semesterDocumentId(semesterName),
      semesterName,
      subjects: []
    }));
  select.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a semester";
  placeholder.disabled = true;
  select.append(placeholder);
  semesters.forEach((record) => {
    const option = document.createElement("option");
    option.value = record.semesterName;
    option.textContent = record.semesterName;
    select.append(option);
  });
  if (semesters.some((record) => sameSemester(record.semesterName, value))) {
    select.value = semesters.find((record) => sameSemester(record.semesterName, value)).semesterName;
  } else if (!value && semesters.length) {
    select.value = semesters[0].semesterName;
  } else {
    select.value = "";
  }
}

function refreshStructureAdmin() {
  const subjectForm = document.querySelector("#subject-create-form");
  const resourceForm = document.querySelector("#subject-resource-form");
  if (!subjectForm && !resourceForm) return;
  const subjectSemester = subjectForm?.elements.semester.value || "";
  const resourceSemester = resourceForm?.elements.semester.value || "";
  const resourceSubject = resourceForm?.elements.subjectName.value || "";
  updateSemesterSelect(subjectForm?.elements.semester, subjectSemester);
  updateSemesterSelect(resourceForm?.elements.semester, resourceSemester);
  refreshResourceSubjectSelect(resourceSubject);
  renderStructureAdminGroups();
  renderSubjectResourceAdminGrid();
}

function refreshResourceSubjectSelect(selectedValue = "") {
  const form = document.querySelector("#subject-resource-form");
  if (!form) return;
  const structure = getSemesterRecord(form.elements.semester.value);
  const select = form.elements.subjectName;
  select.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = structure?.subjects.length ? "Select a subject" : "Add a subject first";
  placeholder.disabled = true;
  select.append(placeholder);
  (structure?.subjects || []).forEach((subjectName) => {
    const option = document.createElement("option");
    option.value = subjectName;
    option.textContent = subjectName;
    select.append(option);
  });
  if (structure?.subjects.some((subject) => subject === selectedValue)) select.value = selectedValue;
  else if (!selectedValue && structure?.subjects.length) select.value = structure.subjects[0];
}

async function ensureDefaultSemesters() {
  if (!firestore || portalStructure.length || defaultSemesterBootstrapInProgress || defaultSemesterBootstrapComplete) return;
  if (typeof firestore.runTransaction !== "function" || typeof firestore.collection !== "function") {
    const message = "Firebase Firestore Compat is unavailable. Reload the page and check the Firebase SDK scripts.";
    setNoticeStatus(document.querySelector("#structure-admin-status"), "error", message);
    console.error(message);
    return;
  }
  defaultSemesterBootstrapInProgress = true;
  const semesterReferences = defaultSemesterNames.map((semesterName) =>
    firestore.collection("portalStructure").doc(semesterDocumentId(semesterName))
  );
  try {
    await firestore.runTransaction(async (transaction) => {
      const snapshots = await Promise.all(semesterReferences.map((reference) => transaction.get(reference)));
      snapshots.forEach((snapshot, index) => {
        if (snapshot.exists) return;
        transaction.set(semesterReferences[index], {
          semesterName: defaultSemesterNames[index],
          subjects: [],
          author: firebaseAuth?.currentUser?.email || "Department",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    });
    defaultSemesterBootstrapComplete = true;
    setNoticeStatus(document.querySelector("#structure-admin-status"), "success", "Default semesters are ready.");
  } catch (error) {
    setNoticeStatus(document.querySelector("#structure-admin-status"), "error", firebaseErrorMessage(error, "initialize default semesters"));
    console.error("Firestore default semester initialization failed.", error);
  } finally {
    defaultSemesterBootstrapInProgress = false;
  }
}

function renderStructureAdminGroups() {
  const container = document.querySelector("#structure-admin-groups");
  if (!container) return;
  container.replaceChildren();
  if (portalStructureError) {
    const error = document.createElement("p");
    error.className = "admin-error";
    error.textContent = portalStructureError;
    container.append(error);
    return;
  }
  if (!portalStructure.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty-projects";
    empty.textContent = "No semesters yet. Add one above to begin building the student curriculum.";
    container.append(empty);
    return;
  }
  portalStructure.forEach((semester) => {
    const card = document.createElement("article");
    card.className = "admin-project-card";
    const heading = document.createElement("div");
    heading.className = "flex items-start justify-between gap-3";
    const title = document.createElement("h3");
    title.className = "admin-project-title";
    title.textContent = semester.semesterName;
    const removeSemester = document.createElement("button");
    removeSemester.type = "button";
    removeSemester.className = "admin-row-button admin-delete-button";
    removeSemester.dataset.structureDeleteSemester = semester.id;
    removeSemester.setAttribute("aria-label", `Delete ${semester.semesterName}`);
    removeSemester.innerHTML = '<i data-lucide="trash-2"></i>';
    heading.append(title, removeSemester);
    card.append(heading);
    if (!semester.subjects.length) {
      const empty = document.createElement("p");
      empty.className = "mt-2 text-sm text-slate-500";
      empty.textContent = "No subjects added yet.";
      card.append(empty);
    } else {
      const list = document.createElement("ul");
      list.className = "mt-3 space-y-2";
      semester.subjects.forEach((subjectName) => {
        const item = document.createElement("li");
        item.className = "flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2";
        const name = document.createElement("span");
        name.className = "text-sm text-slate-700";
        name.textContent = subjectName;
        const actions = document.createElement("div");
        actions.className = "flex shrink-0 items-center gap-1";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "admin-row-button";
        edit.dataset.structureEditSubject = semester.id;
        edit.dataset.subjectName = subjectName;
        edit.setAttribute("aria-label", `Edit ${subjectName}`);
        edit.innerHTML = '<i data-lucide="pencil"></i>';
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "admin-row-button admin-delete-button";
        remove.dataset.structureDeleteSubject = semester.id;
        remove.dataset.subjectName = subjectName;
        remove.setAttribute("aria-label", `Delete ${subjectName} from ${semester.semesterName}`);
        remove.innerHTML = '<i data-lucide="trash-2"></i>';
        actions.append(edit, remove);
        item.append(name, actions);
        list.append(item);
      });
      card.append(list);
    }
    container.append(card);
  });
  refreshIcons();
}

function renderSubjectResourceAdminGrid() {
  const container = document.querySelector("#subject-resource-admin-grid");
  if (!container) return;
  const form = document.querySelector("#subject-resource-form");
  const semester = form?.elements.semester.value || "";
  const subjectName = form?.elements.subjectName.value || "";
  if (!semester || !subjectName) {
    const prompt = document.createElement("p");
    prompt.className = "rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 sm:col-span-2 lg:col-span-3";
    prompt.textContent = "Select a managed semester and subject to manage learning-material links.";
    container.replaceChildren(prompt);
    return;
  }
  renderSubjectCategoryGrid(container, semester, subjectName, "", { admin: true });
}

async function addSemester(form) {
  const semesterName = String(new FormData(form).get("semesterName") || "").trim();
  const status = document.querySelector("#structure-admin-status");
  if (!semesterName) {
    setNoticeStatus(status, "error", "Enter a semester name.");
    return;
  }
  if (!normalizeSemesterName(semesterName)) {
    setNoticeStatus(status, "error", "Semester name must include letters or numbers.");
    return;
  }
  if (!isAuthorizedFaculty()) {
    setNoticeStatus(status, "error", `Sign in as ${authorizedFacultyEmail} before managing the curriculum.`);
    return;
  }
  if (portalStructure.some((record) => sameSemester(record.semesterName, semesterName))) {
    setNoticeStatus(status, "error", "That semester already exists.");
    return;
  }
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  setNoticeStatus(status, "", "Saving semester...");
  try {
    if (typeof firestore?.collection !== "function" || typeof firestore?.runTransaction !== "function") {
      throw new Error("Firebase Firestore Compat is unavailable. Reload the page and check the Firebase SDK scripts.");
    }
    const semesterReference = firestore.collection("portalStructure").doc(semesterDocumentId(semesterName));
    await firestore.runTransaction(async (transaction) => {
      const existing = await transaction.get(semesterReference);
      if (existing.exists) throw new Error("That semester already exists.");
      transaction.set(semesterReference, {
        semesterName,
        subjects: [],
        author: firebaseAuth.currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    form.reset();
    setNoticeStatus(status, "success", `${semesterName} added to the student curriculum.`);
  } catch (error) {
    setNoticeStatus(status, "error", firebaseErrorMessage(error, "add semester"));
    console.error("Firestore semester creation failed.", error);
  } finally {
    submit.disabled = false;
  }
}

async function addStructureSubject(form) {
  const data = new FormData(form);
  const semesterName = String(form.elements.semester.value || data.get("semester") || "").trim();
  const subjectName = String(form.elements.subjectName.value || data.get("subjectName") || "").trim();
  const originalSubjectName = String(form.elements.originalSubjectName.value || "").trim();
  const isEditing = Boolean(form.elements.subjectRecordId.value || originalSubjectName);
  const subjectRecordId = String(form.elements.subjectRecordId.value || "").trim();
  const facultyName = String(data.get("facultyName") || "").trim();
  const contactNumber = String(data.get("contactNumber") || "").trim();
  const facultyEmail = String(data.get("facultyEmail") || "").trim();
  const subjectDescription = String(data.get("subjectDescription") || "").trim();
  const status = document.querySelector("#structure-admin-status");
  const semester = getSemesterRecord(semesterName);
  if (!semesterName || !semester || !subjectName) {
    setNoticeStatus(status, "error", "Select a semester and enter a subject name.");
    return;
  }
  if (!isAuthorizedFaculty()) {
    setNoticeStatus(status, "error", `Sign in as ${authorizedFacultyEmail} before managing the curriculum.`);
    return;
  }
  if (facultyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(facultyEmail)) {
    setNoticeStatus(status, "error", "Enter a valid faculty email address.");
    return;
  }
  if (semester.subjects.some((subject) =>
    subject.toLowerCase() === subjectName.toLowerCase()
    && (!isEditing || subject.toLowerCase() !== originalSubjectName.toLowerCase())
  )) {
    setNoticeStatus(status, "error", `${subjectName} already exists under ${semester.semesterName}.`);
    return;
  }
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  setNoticeStatus(status, "", "Saving subject...");
  try {
    if (typeof firestore?.collection !== "function" || typeof firestore?.runTransaction !== "function") {
      throw new Error("Firebase Firestore Compat is unavailable. Reload the page and check the Firebase SDK scripts.");
    }
    const semesterReference = firestore.collection("portalStructure").doc(semester.id);
    const matchingMetadata = moduleRecords.subjects.find((record) =>
      sameSemester(record.semester, semester.semesterName)
      && String(record.subjectName || "").trim().toLowerCase() === originalSubjectName.toLowerCase()
    );
    const metadata = subjectRecordId
      ? moduleRecords.subjects.find((record) => record.id === subjectRecordId)
      : matchingMetadata;
    const subjectsCollection = firestore.collection("subjects");
    const subjectDocumentId = metadata?.id || subjectRecordId;
    const subjectReference = subjectDocumentId
      ? subjectsCollection.doc(subjectDocumentId)
      : subjectsCollection.doc();
    await firestore.runTransaction(async (transaction) => {
      const currentSemester = await transaction.get(semesterReference);
      const isDefaultSemester = defaultSemesterNames.some((name) => sameSemester(name, semester.semesterName));
      if (!currentSemester.exists && !isDefaultSemester) {
        throw new Error("This semester no longer exists. Refresh the page and try again.");
      }
      const currentSubjects = currentSemester.exists && Array.isArray(currentSemester.data().subjects)
        ? currentSemester.data().subjects
        : [];
      if (currentSubjects.some((subject) =>
        String(subject).trim().toLowerCase() === subjectName.toLowerCase()
        && (!isEditing || String(subject).trim().toLowerCase() !== originalSubjectName.toLowerCase())
      )) {
        throw new Error(`${subjectName} already exists under ${semester.semesterName}.`);
      }
      const nextSubjects = [
        ...currentSubjects.filter((subject) =>
          !isEditing || String(subject).trim().toLowerCase() !== originalSubjectName.toLowerCase()
        ),
        subjectName
      ];
      if (currentSemester.exists) {
        transaction.update(semesterReference, {
          subjects: nextSubjects,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        transaction.set(semesterReference, {
          semesterName: semester.semesterName,
          subjects: nextSubjects,
          author: firebaseAuth.currentUser.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      transaction.set(subjectReference, {
        semester: semester.semesterName,
        subjectName,
        facultyName,
        contactNumber,
        facultyEmail,
        subjectDescription,
        author: firebaseAuth.currentUser.email,
        ...(!metadata ? { createdAt: firebase.firestore.FieldValue.serverTimestamp() } : {}),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
    resetStructureSubjectForm(semester.semesterName);
    setNoticeStatus(status, "success", `${subjectName} ${isEditing ? "updated" : "added"} under ${semester.semesterName}.`);
  } catch (error) {
    setNoticeStatus(status, "error", firebaseErrorMessage(error, isEditing ? "update subject" : "add subject"));
    console.error(`Firestore subject ${isEditing ? "update" : "creation"} failed.`, error);
  } finally {
    submit.disabled = false;
  }
}

function resetStructureSubjectForm(semesterName = "") {
  const form = document.querySelector("#subject-create-form");
  if (!form) return;
  form.reset();
  form.elements.semester.value = semesterName || portalStructure[0]?.semesterName || "";
  form.elements.subjectRecordId.value = "";
  form.elements.originalSubjectName.value = "";
  form.elements.subjectName.readOnly = false;
  document.querySelector("#subject-submit-label").textContent = "Add subject";
  document.querySelector("#subject-cancel-edit").hidden = true;
}

function editStructureSubject(semesterId, subjectName) {
  const semester = portalStructure.find((record) => record.id === semesterId);
  const form = document.querySelector("#subject-create-form");
  if (!semester || !form) return;
  const metadata = moduleRecords.subjects.find((record) =>
    sameSemester(record.semester, semester.semesterName)
    && String(record.subjectName || "").trim().toLowerCase() === subjectName.toLowerCase()
  );
  form.elements.semester.value = semester.semesterName;
  form.elements.subjectName.value = subjectName;
  form.elements.subjectName.readOnly = true;
  form.elements.subjectRecordId.value = metadata?.id || "";
  form.elements.originalSubjectName.value = subjectName;
  form.elements.facultyName.value = metadata?.facultyName || "";
  form.elements.contactNumber.value = metadata?.contactNumber || "";
  form.elements.facultyEmail.value = metadata?.facultyEmail || "";
  form.elements.subjectDescription.value = metadata?.subjectDescription || "";
  document.querySelector("#subject-submit-label").textContent = "Save subject";
  document.querySelector("#subject-cancel-edit").hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  form.elements.subjectName.focus();
}

async function deleteStructureSubject(semesterId, subjectName) {
  if (!isAuthorizedFaculty()) {
    setNoticeStatus(document.querySelector("#structure-admin-status"), "error", `Sign in as ${authorizedFacultyEmail} before managing the curriculum.`);
    return;
  }
  const semester = portalStructure.find((record) => record.id === semesterId);
  if (!semester || !semester.subjects.includes(subjectName)) return;
  if (!window.confirm(`Delete "${subjectName}" from ${semester.semesterName} and remove its published materials?`)) return;
  const status = document.querySelector("#structure-admin-status");
  try {
    const resourceSnapshot = await firestore.collection("subjectResources").where("subjectName", "==", subjectName).get();
    const relatedResources = resourceSnapshot.docs.filter((document) =>
      sameSemester(document.data().semester, semester.semesterName)
    );
    const subjectSnapshot = await firestore.collection("subjects").where("subjectName", "==", subjectName).get();
    const relatedSubjects = subjectSnapshot.docs.filter((document) =>
      sameSemester(document.data().semester, semester.semesterName)
    );
    if (relatedResources.length + relatedSubjects.length > 499) {
      setNoticeStatus(status, "error", "This subject has too many linked records to remove in one batch. Delete its materials first.");
      return;
    }
    const batch = firestore.batch();
    batch.update(firestore.collection("portalStructure").doc(semester.id), {
      subjects: firebase.firestore.FieldValue.arrayRemove(subjectName),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    relatedResources.forEach((document) => batch.delete(document.ref));
    relatedSubjects.forEach((document) => batch.delete(document.ref));
    await batch.commit();
    setNoticeStatus(status, "success", `${subjectName}, its published materials, and its legacy subject record were removed.`);
  } catch (error) {
    setNoticeStatus(status, "error", firebaseErrorMessage(error, "delete subject"));
    console.error("Firestore subject deletion failed.", error);
  }
}

async function deleteStructureSemester(semesterId) {
  if (!isAuthorizedFaculty()) {
    setNoticeStatus(document.querySelector("#structure-admin-status"), "error", `Sign in as ${authorizedFacultyEmail} before managing the curriculum.`);
    return;
  }
  const semester = portalStructure.find((record) => record.id === semesterId);
  if (!semester || !window.confirm(`Delete "${semester.semesterName}" and all its subjects and materials?`)) return;
  const status = document.querySelector("#structure-admin-status");
  try {
    const resourceSnapshot = await firestore.collection("subjectResources").get();
    const relatedResources = resourceSnapshot.docs.filter((document) =>
      sameSemester(document.data().semester, semester.semesterName)
    );
    const subjectSnapshot = await firestore.collection("subjects").get();
    const relatedSubjects = subjectSnapshot.docs.filter((document) =>
      sameSemester(document.data().semester, semester.semesterName)
    );
    if (relatedResources.length + relatedSubjects.length > 499) {
      setNoticeStatus(status, "error", "This semester has too many linked records to remove in one batch. Delete its materials first.");
      return;
    }
    const batch = firestore.batch();
    batch.delete(firestore.collection("portalStructure").doc(semester.id));
    relatedResources.forEach((document) => batch.delete(document.ref));
    relatedSubjects.forEach((document) => batch.delete(document.ref));
    await batch.commit();
    setNoticeStatus(status, "success", `${semester.semesterName}, its materials, and its legacy subject records were removed.`);
  } catch (error) {
    setNoticeStatus(status, "error", firebaseErrorMessage(error, "delete semester"));
    console.error("Firestore semester deletion failed.", error);
  }
}

function renderModuleAdminList(moduleKey) {
  const container = document.querySelector(`[data-module-records="${moduleKey}"]`);
  const definition = moduleDefinitions[moduleKey];
  if (!container || !definition) return;
  container.replaceChildren();
  if (moduleErrors[moduleKey]) {
    const error = document.createElement("p");
    error.className = "admin-error";
    error.textContent = moduleErrors[moduleKey];
    container.append(error);
    return;
  }
  const records = moduleKey === "announcements" ? announcements : moduleRecords[moduleKey];
  if (!records.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty-projects";
    empty.textContent = `No ${definition.label.toLowerCase()} records have been published yet.`;
    container.append(empty);
    return;
  }

  records.forEach((record) => {
    const card = document.createElement("article");
    card.className = "admin-project-card";
    const heading = document.createElement("h3");
    heading.className = "admin-project-title";
    const primaryField = definition.fields.find((field) => field.type !== "url" && field.type !== "textarea" && field.name !== "category");
    heading.textContent = String(record[primaryField?.name] || definition.label);
    card.append(heading);
    definition.fields.filter((field) => field.name !== primaryField?.name).forEach((field) => {
      const value = record[field.name];
      if (!value) return;
      const line = document.createElement("p");
      if (field.type === "url" && safeAnnouncementLink(value)) {
        const link = document.createElement("a");
        link.className = "admin-attachment";
        link.href = value;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `${field.label} · Open link`;
        line.append(link);
      } else {
        line.textContent = `${field.label}: ${value}`;
      }
      card.append(line);
    });
    const actions = document.createElement("div");
    actions.className = "admin-row-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "admin-row-button";
    edit.dataset.moduleEdit = moduleKey;
    edit.dataset.recordId = record.id;
    edit.setAttribute("aria-label", `Edit ${heading.textContent}`);
    edit.innerHTML = '<i data-lucide="pencil"></i>';
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "admin-row-button admin-delete-button";
    remove.dataset.moduleDelete = moduleKey;
    remove.dataset.recordId = record.id;
    remove.setAttribute("aria-label", `Delete ${heading.textContent}`);
    remove.innerHTML = '<i data-lucide="trash-2"></i>';
    actions.append(edit, remove);
    card.append(actions);
    container.append(card);
  });
  refreshIcons();
}

function editModuleRecord(moduleKey, record) {
  const form = document.querySelector(`[data-module-form="${moduleKey}"]`);
  if (!form) return;
  form.elements.id.value = record.id;
  moduleDefinitions[moduleKey].fields.forEach((field) => {
    form.elements[field.name].value = record[field.name] || "";
  });
  document.querySelector(`[data-module-submit-label="${moduleKey}"]`).textContent = "Save changes";
  document.querySelector(`[data-module-cancel="${moduleKey}"]`).hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  form.querySelector("input:not([type=hidden]), select, textarea")?.focus();
}

async function saveModuleRecord(moduleKey, form) {
  const definition = moduleDefinitions[moduleKey];
  const status = document.querySelector(`[data-module-status="${moduleKey}"]`);
  const data = new FormData(form);
  const id = String(data.get("id") || "");
  const record = {};
  for (const field of definition.fields) {
    const value = String(data.get(field.name) || "").trim();
    if (field.required && !value) {
      setNoticeStatus(status, "error", `${field.label} is required.`);
      return;
    }
    if (field.type === "url" && value && !safeAnnouncementLink(value)) {
      setNoticeStatus(status, "error", `Enter a valid http:// or https:// URL for ${field.label}.`);
      return;
    }
    if (field.googleDrive && value && !isGoogleDriveLink(value)) {
      setNoticeStatus(status, "error", `Enter a valid Google Drive URL for ${field.label}.`);
      return;
    }
    if (field.maxLength && value.length > field.maxLength) {
      setNoticeStatus(status, "error", `${field.label} must be ${field.maxLength} characters or fewer.`);
      return;
    }
    record[field.name] = value;
  }
  if (!isAuthorizedFaculty()) {
    setNoticeStatus(status, "error", `Sign in as ${authorizedFacultyEmail} before publishing.`);
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  setNoticeStatus(status, "", "Saving and syncing...");
  try {
    const collection = firestore.collection(definition.collection);
    const reference = id ? collection.doc(id) : collection.doc();
    const existingRecords = moduleKey === "announcements" ? announcements : moduleRecords[moduleKey];
    const oldRecord = existingRecords.find((item) => item.id === id);
    await reference.set({
      ...record,
      author: firebaseAuth.currentUser.email || "Faculty",
      createdAt: oldRecord?.createdAtValue || firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    form.reset();
    form.elements.id.value = "";
    document.querySelector(`[data-module-submit-label="${moduleKey}"]`).textContent = "Publish";
    document.querySelector(`[data-module-cancel="${moduleKey}"]`).hidden = true;
    setNoticeStatus(status, "success", "Saved and syncing across connected devices.");
  } catch (error) {
    setNoticeStatus(status, "error", firebaseErrorMessage(error, `save ${definition.label.toLowerCase()}`));
    console.error(`Firestore ${moduleKey} save failed.`, error);
  } finally {
    button.disabled = false;
  }
}

async function saveSubjectCategory(form) {
  const resourceForm = document.querySelector("#subject-resource-form");
  const semester = String(resourceForm?.elements.semester.value || "");
  const subjectName = String(resourceForm?.elements.subjectName.value || "").trim();
  const category = form.dataset.subjectCategory;
  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();
  const deadline = String(formData.get("deadline") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const resourceId = String(formData.get("resourceId") || "").trim();
  const status = document.querySelector("#subject-resource-status");
  const submit = form.querySelector('button[type="submit"]');
  const structure = getSemesterRecord(semester);
  if (!structure || !structure.subjects.includes(subjectName)) {
    setNoticeStatus(status, "error", "Select a subject managed under the selected semester first.");
    return;
  }
  if (!subjectResourceCategories.some((item) => item.name === category)) {
    setNoticeStatus(status, "error", "This subject-material category is not supported.");
    return;
  }
  if (!safeAnnouncementLink(url)) {
    setNoticeStatus(status, "error", "Enter a valid http:// or https:// Google Drive or PDF URL.");
    return;
  }
  if (!title) {
    setNoticeStatus(status, "error", "Enter a resource title, unit, experiment, or assignment name.");
    return;
  }
  if (category === "Assignments" && deadline && Number.isNaN(Date.parse(`${deadline}T00:00:00`))) {
    setNoticeStatus(status, "error", "Enter a valid assignment deadline.");
    return;
  }
  if (!isAuthorizedFaculty()) {
    setNoticeStatus(status, "error", `Sign in as ${authorizedFacultyEmail} before publishing.`);
    return;
  }
  submit.disabled = true;
  setNoticeStatus(status, "", `Saving ${category} link...`);
  try {
    const resourceCollection = firestore.collection("subjectResources");
    const existingResource = resourceId ? subjectResources.find((record) => record.id === resourceId) : null;
    if (resourceId && !existingResource) {
      throw new Error("This resource is no longer available. Refresh the subject materials and try again.");
    }
    const resourceReference = existingResource ? resourceCollection.doc(resourceId) : resourceCollection.doc();
    await resourceReference.set({
      semester,
      subjectName,
      category,
      title,
      deadline: category === "Assignments" ? deadline : "",
      url,
      author: firebaseAuth.currentUser.email,
      createdAt: existingResource?.createdAtValue || firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    activeAdminCategoryEdit = null;
    setNoticeStatus(status, "success", `${title} saved and syncing to student dashboards.`);
    renderSubjectResourceAdminGrid();
  } catch (error) {
    setNoticeStatus(status, "error", firebaseErrorMessage(error, `save ${category.toLowerCase()} link`));
    console.error(`Firestore subject category save failed for ${category}.`, error);
  } finally {
    submit.disabled = false;
  }
}

async function deleteSubjectResource(resourceId) {
  const resource = subjectResources.find((item) => item.id === resourceId);
  if (!resource || !isAuthorizedFaculty()) return;
  if (!window.confirm(`Delete "${resource.title || resource.category}"?`)) return;
  const status = document.querySelector("#subject-resource-status");
  try {
    await firestore.collection("subjectResources").doc(resource.id).delete();
    if (activeAdminCategoryEdit?.resourceId === resource.id) activeAdminCategoryEdit = null;
    setNoticeStatus(status, "success", "Resource deleted.");
  } catch (error) {
    setNoticeStatus(status, "error", firebaseErrorMessage(error, "delete subject resource"));
    console.error("Firestore subject resource deletion failed.", error);
  }
}

function formatAdminDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function renderAdminNotices() {
  if (!adminNoticeRows) return;
  const rowCount = announcements.length;
  const currentMonth = new Date();
  const monthCount = announcements.filter((notice) => {
    const date = new Date(`${notice.date || notice.createdAt.slice(0, 10)}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  }).length;
  document.querySelector("#admin-notice-count").textContent = String(rowCount);
  document.querySelector("#admin-month-count").textContent = String(monthCount);
  document.querySelector("#admin-link-count").textContent = String(announcements.filter((notice) => notice.link).length);
  adminNoticeRows.replaceChildren();

  if (adminStorageError) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "admin-empty-row admin-error-row";
    cell.textContent = adminStorageError;
    row.append(cell);
    adminNoticeRows.append(row);
    return;
  }

  if (!rowCount) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "admin-empty-row";
    cell.textContent = "No notices yet. Use the form above to publish the first department notice.";
    row.append(cell);
    adminNoticeRows.append(row);
    return;
  }

  announcements.forEach((notice) => {
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    const title = document.createElement("strong");
    title.className = "admin-notice-title";
    title.textContent = notice.title;
    const description = document.createElement("span");
    description.className = "admin-notice-summary";
    description.textContent = notice.body;
    titleCell.append(title, description);

    const categoryCell = document.createElement("td");
    const category = document.createElement("span");
    category.className = `admin-tag admin-tag-${notice.category.toLowerCase()}`;
    category.textContent = notice.category;
    categoryCell.append(category);

    const dateCell = document.createElement("td");
    dateCell.textContent = formatAdminDate(notice.date);
    const linkCell = document.createElement("td");
    if (safeAnnouncementLink(notice.link)) {
      const attachment = document.createElement("a");
      attachment.className = "admin-attachment";
      attachment.href = notice.link;
      attachment.target = "_blank";
      attachment.rel = "noopener noreferrer";
      attachment.textContent = "Open link";
      linkCell.append(attachment);
    } else {
      linkCell.textContent = "—";
    }

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "admin-row-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "admin-row-button";
    edit.dataset.adminEdit = notice.id;
    edit.setAttribute("aria-label", `Edit ${notice.title}`);
    edit.innerHTML = '<i data-lucide="pencil"></i>';
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "admin-row-button admin-delete-button";
    remove.dataset.adminDelete = notice.id;
    remove.setAttribute("aria-label", `Delete ${notice.title}`);
    remove.innerHTML = '<i data-lucide="trash-2"></i>';
    actions.append(edit, remove);
    actionsCell.append(actions);
    row.append(titleCell, categoryCell, dateCell, linkCell, actionsCell);
    adminNoticeRows.append(row);
  });
  refreshIcons();
}

function setNoticeStatus(status, type, message) {
  status.className = `admin-message ${type ? `admin-${type}` : ""}`.trim();
  status.textContent = message;
}

async function publishAnnouncementForm(form) {
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const body = String(data.get("body") || "").trim();
  const linkInput = String(data.get("link") || "").trim();
  const id = String(data.get("id") || "");
  const status = form.querySelector("#admin-notice-message");
  const submitButton = form.querySelector('button[type="submit"]');
  const previous = announcements.find((item) => item.id === id);

  if (!title || !body) return;
  if (linkInput && !safeAnnouncementLink(linkInput)) {
    setNoticeStatus(status, "error", "Enter a valid http:// or https:// attachment link.");
    return;
  }
  if (!isAuthorizedFaculty() || !announcementsCollection) {
    setNoticeStatus(status, "error", `Sign in as ${authorizedFacultyEmail} before publishing.`);
    return;
  }

  submitButton.disabled = true;
  setNoticeStatus(status, "", "Publishing announcement...");
  try {
    const documentReference = id ? announcementsCollection.doc(id) : announcementsCollection.doc();
    const notice = {
      title,
      body,
      category: ["New", "Academic", "General"].includes(data.get("category")) ? data.get("category") : "General",
      date: String(data.get("date") || localInputDate()),
      link: linkInput,
      author: firebaseAuth.currentUser.email || "Faculty",
      createdAt: previous?.createdAtValue || firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await documentReference.set(notice);
    resetAdminNoticeForm();
    setNoticeStatus(status, "success", id ? "Notice updated and synchronized across devices." : "Notice published and synchronized across devices.");
  } catch (error) {
    setNoticeStatus(status, "error", firebaseErrorMessage(error, "publish the announcement"));
    console.error("Firestore announcement save failed.", error);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteAnnouncement(notice) {
  const status = document.querySelector("#admin-notice-message");
  if (!isAuthorizedFaculty()) {
    setNoticeStatus(status, "error", `Sign in as ${authorizedFacultyEmail} before deleting notices.`);
    return;
  }
  try {
    await announcementsCollection.doc(notice.id).delete();
    setNoticeStatus(status, "success", "Notice deleted and synchronized across devices.");
  } catch (error) {
    setNoticeStatus(status, "error", firebaseErrorMessage(error, "delete the announcement"));
    console.error("Firestore announcement delete failed.", error);
  }
}

function resetAdminNoticeForm() {
  adminNoticeForm.reset();
  adminNoticeForm.elements.id.value = "";
  adminNoticeForm.elements.date.value = localInputDate();
  document.querySelector("#admin-form-heading").textContent = "Quick action · Add a notice";
  document.querySelector("#admin-notice-submit").textContent = "Publish notice";
  document.querySelector("#admin-cancel-edit").hidden = true;
}

function setModalView(className) {
  modalPanel.classList.remove("semester-modal", "project-modal", "announcement-modal", "portal-modal");
  modalContent.classList.remove("semester-content", "project-content", "announcement-content", "portal-content");
  modalPanel.classList.add(className);
  modalDone.hidden = className === "project-modal" || className === "portal-modal";
}

function renderAnnouncementList() {
  activeModalModule = "announcements";
  setModalView("announcement-modal");
  modalTitle.textContent = "Announcements & notices";
  modalDescription.textContent = "The latest updates from the AI & Data Science department.";
  modalContent.classList.add("announcement-content");
  modalContent.replaceChildren();

  if (!announcements.length) {
    const empty = document.createElement("div");
    empty.className = "announcement-empty";
    const icon = document.createElement("i");
    icon.dataset.lucide = "inbox";
    const title = document.createElement("strong");
    title.textContent = "No announcements yet";
    const detail = document.createElement("p");
    detail.textContent = "New department notices will appear here when published.";
    empty.append(icon, title, detail);
    modalContent.append(empty);
  } else {
    const list = document.createElement("div");
    list.className = "announcement-list";
    announcements.forEach((announcement) => {
      const item = document.createElement("article");
      item.className = "announcement-item";
      const top = document.createElement("div");
      top.className = "announcement-item-meta";
      const date = document.createElement("span");
      date.textContent = formatAnnouncementDate(announcement.date || announcement.createdAt);
      const author = document.createElement("span");
      author.textContent = `By ${announcement.author}`;
      top.append(date, author);
      const category = document.createElement("span");
      category.className = `announcement-category announcement-category-${announcement.category.toLowerCase()}`;
      category.textContent = announcement.category;
      const title = document.createElement("h3");
      title.textContent = announcement.title;
      const body = document.createElement("p");
      body.textContent = announcement.body;
      item.append(top, category, title, body);
      if (announcement.link) {
        const link = document.createElement("a");
        link.className = "announcement-attachment";
        link.href = announcement.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open attachment";
        item.append(link);
      }
      list.append(item);
    });
    modalContent.append(list);
  }
  refreshIcons();
}

function renderPortalLogin() {
  setModalView("portal-modal");
  modalTitle.textContent = "Admin / Faculty Portal";
  modalDescription.textContent = "Sign in with your faculty Firebase account to open the department management panel.";
  modalContent.classList.add("portal-content");
  modalContent.innerHTML = `
    <form id="portal-login-form" class="portal-form">
      <label class="portal-label">Faculty email
        <input type="email" name="email" autocomplete="username" placeholder="${authorizedFacultyEmail}" required>
      </label>
      <label class="portal-label">Password
        <input type="password" name="password" autocomplete="current-password" placeholder="Enter your password" required>
      </label>
      <div class="portal-demo-note"><i data-lucide="shield-check"></i><span>Sign in with the authorized faculty account: ${authorizedFacultyEmail}.</span></div>
      <p id="portal-error" class="portal-error" aria-live="polite"></p>
      <button class="modal-primary" type="submit">Sign in <i data-lucide="arrow-right"></i></button>
    </form>
  `;
  refreshIcons();
  modalContent.querySelector('input[name="email"]').focus();
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function toggleAiChat() {
  const isOpening = aiChatWindow.hidden;
  aiChatWindow.hidden = !isOpening;
  aiToggleButton.hidden = isOpening;
  aiToggleButton.setAttribute("aria-expanded", String(isOpening));
  if (isOpening) aiUserInput.focus();
}

function appendAiMessage(text, role, isError = false) {
  const message = document.createElement("div");
  message.className = `ai-chat-message ai-chat-message--${role}${isError ? " ai-chat-message--error" : ""}`;
  message.textContent = text;
  aiChatMessages.append(message);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  return message;
}

function speakText(text) {
  if (
    !aiVoiceEnabled
    || !("speechSynthesis" in window)
    || typeof window.SpeechSynthesisUtterance !== "function"
  ) return;

  const cleanText = text
    .replace(/[*_`#~>|]/g, " ")
    .replace(/[^\p{L}\p{N}\s.,!?;:।-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleanText) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(cleanText);
    utterance.lang = "hi-IN";
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Could not speak assistant response.", error);
  }
}

function normalizeNoticeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, " ").trim();
}

function getDepartmentNoticeQueryCategory(query) {
  const normalizedQuery = normalizeNoticeText(query);
  if (/\b(mid|sem|midsem|exam|timetable|schedule)\b|time\s+table|टाइम\s*टेबल|टाइमटेबल|एग्जाम|परीक्षा|मिड\s*सेम/i.test(normalizedQuery)) return "midSem";
  if (/\b(minor|project|proect|submission)\b|प्रोजेक्ट/i.test(normalizedQuery)) return "minorProject";
  if (/\b(notice|announcement|annoucemnt|update|naya|latest|date)\b|\bkya\s+hai\b|नोटिस|अनाउंसमेंट/i.test(normalizedQuery)) return "latest";
  return "";
}

function getNoticeFromDOM(query) {
  const noOfficialNoticeReply = "Abhi iska koi official notice available nahi hai. Portal check karte rahein!";
  const normalize = normalizeNoticeText;
  const queryCategory = getDepartmentNoticeQueryCategory(query);
  if (!queryCategory) return "";

  const selectors = [
    ".announcement-item",
    ".announcement-card",
    "[data-announcement-card]",
    "[data-notice-card]",
    ".card-announcements",
    ".announcement-list > article",
    '[class*="notice" i] article',
    '[class*="announcement" i] article'
  ];
  const noticeCards = new Set(document.querySelectorAll(selectors.join(", ")));

  document.querySelectorAll(
    "#modal-content h1, #modal-content h2, #modal-content h3, " +
    '[id*="notice" i] h1, [id*="notice" i] h2, [id*="notice" i] h3, ' +
    '[class*="notice" i] h1, [class*="notice" i] h2, [class*="notice" i] h3, ' +
    '[id*="announcement" i] h1, [id*="announcement" i] h2, [id*="announcement" i] h3, ' +
    '[class*="announcement" i] h1, [class*="announcement" i] h2, [class*="announcement" i] h3'
  ).forEach((heading) => {
    const card = heading.closest(selectors.join(", "));
    if (card) {
      noticeCards.add(card);
    } else if (heading.closest("#modal-content")) {
      noticeCards.add(heading.parentElement);
    }
  });

  const allNotices = [];
  document.querySelectorAll(selectors.join(", ")).forEach((card) => noticeCards.add(card));
  noticeCards.forEach((card) => {
    if (!card) return;
    const isDashboardCard = card.matches(".card-announcements");
    const title = isDashboardCard
      ? card.dataset.announcementTitle || ""
      : card.dataset.announcementTitle
        || card.dataset.noticeTitle
        || card.querySelector("h1, h2, h3, [data-announcement-title], [data-notice-title]")?.textContent.trim()
        || "";
    const date = isDashboardCard
      ? card.dataset.announcementDate || ""
      : card.dataset.announcementDate
        || card.dataset.noticeDate
        || card.querySelector("time, .announcement-item-meta span, [data-announcement-date], [data-notice-date]")?.textContent.trim()
        || "";
    const description = isDashboardCard
      ? card.dataset.announcementDescription || ""
      : card.dataset.announcementDescription
        || card.dataset.noticeDescription
        || card.querySelector(".announcement-item > p, [data-announcement-description], [data-notice-description], p")?.textContent.trim()
        || "";
    const text = isDashboardCard
      ? normalize(`${title} ${description}`)
      : normalize(card.innerText || card.textContent || "");
    if (title || description) {
      allNotices.push({ title, date, description, text, isDashboardCard });
    }
  });

  let notices = allNotices;
  if (allNotices.some((notice) => !notice.isDashboardCard)) {
    notices = allNotices.filter((notice) => !notice.isDashboardCard);
  }
  const seenNotices = new Set();
  notices = notices.filter((notice) => {
    const key = `${notice.date}|${notice.title}|${notice.description}`;
    if (seenNotices.has(key)) return false;
    seenNotices.add(key);
    return true;
  });

  if (!notices.length) return noOfficialNoticeReply;

  if (queryCategory === "latest") {
    const summaries = notices.map((notice) => {
      const heading = [notice.date, notice.title].filter(Boolean).join(" : ");
      const summary = notice.description
        ? `${heading}${heading ? " - " : ""}${notice.description}`
        : heading;
      return `- ${summary}`;
    });
    return `Portal par yeh naye announcements available hain:\n${summaries.join("\n")}`;
  }

  const noticeRegex = queryCategory === "midSem"
    ? /mid\s*sem|timetable|schedule|exam|टाइम\s*टेबल|टाइमटेबल|एग्जाम|परीक्षा|मिड\s*सेम/i
    : /minor\s+project|प्रोजेक्ट/i;
  const matchingNotice = notices.find((notice) => {
    const noticeText = normalize(`${notice.title} ${notice.description} ${notice.text}`);
    return noticeRegex.test(noticeText);
  });

  if (!matchingNotice) return noOfficialNoticeReply;
  return [
    matchingNotice.date,
    matchingNotice.title,
    matchingNotice.description
  ].filter(Boolean).join("\n");
}

async function sendAiMessage() {
  const noOfficialUpdateReply = "Abhi iska koi official notice available nahi hai. Portal check karte rahein!";
  const query = aiUserInput.value.trim();
  if (!query || aiSendButton.disabled) return;
  const lowerQuery = query.toLowerCase().trim();

  appendAiMessage(query, "user");
  aiUserInput.value = "";
  aiUserInput.disabled = true;
  aiSendButton.disabled = true;

  const loadingId = `loading-${Date.now()}`;
  const loadingMessage = appendAiMessage("Thinking...", "assistant");
  loadingMessage.id = loadingId;
  loadingMessage.classList.add("ai-chat-message--loading");

  let botResponse = "";
  try {
    if (/project\s*tracker|tracker|projects|minor\s*project/i.test(lowerQuery)) {
      botResponse = "Aap 'Project Tracker' card par click karke apne minor/major projects ka status aur submissions track kar sakte hain.";
    } else if (/timetable|schedule|time\s*table|routine/i.test(lowerQuery)) {
      botResponse = "Aap 'Timetables & Schedules' card par click karke weekly class schedule aur exam time tables dekh sakte hain.";
    } else if (/co-po|pso|outcomes|course\s*outcome/i.test(lowerQuery)) {
      botResponse = "Aap 'CO-PO & PSO Outcomes' card par click karke program framework aur course outcomes check kar sakte hain.";
    } else if (/notice|announcement|exam|mid\s*sem|midsem|submission|date|update|नोटिस|अनाउंसमेंट|एग्जाम|मिड\s*सेम/i.test(lowerQuery)) {
      botResponse = getNoticeFromDOM(lowerQuery) || noOfficialUpdateReply;
    } else if (/syllabus|scheme|download|curriculum|pdf|सिलेबस|स्कीम/i.test(lowerQuery)) {
      botResponse = "Aap 'Scheme & Syllabus' card par click karke apne branch/semester ka syllabus aur PDF files direct view/download kar sakte hain.";
    } else if (/placement|training|job|drive|interview|प्लेसमेंट|ट्रेनिंग/i.test(lowerQuery)) {
      botResponse = "Training & Placement hub par aapko upcoming drives, interview resources, aur placement updates ki jankari milti hai.";
    } else if (/semester|subject|course|3rd|5th|7th|सेमेस्टर|सब्जेक्ट/i.test(lowerQuery)) {
      botResponse = "Aap 'Semesters & Subjects' card open karke apne specific semester ke subjects aur course materials dekh sakte hain.";
    } else {
      botResponse = "Main JNCT AI-DS Assistant hoon. Aap portal ke Announcements, Syllabus, Timetable, Project Tracker, ya Placement ke baare mein puch sakte hain!";
    }
  } catch (error) {
    console.log("AI assistant request or notice lookup failed.", error);
    botResponse = noOfficialUpdateReply;
  } finally {
    document.getElementById(loadingId)?.remove();
    aiUserInput.disabled = false;
    aiSendButton.disabled = false;
  }
  const response = botResponse || noOfficialUpdateReply;
  appendAiMessage(response, "assistant");
  speakText(response);
  aiUserInput.focus();
}

function semesterNumber(value) {
  const normalized = String(value || "").toLowerCase().trim();
  const match = normalized.match(/\b(?:semester|sem)\s*(\d+)\b/)
    || normalized.match(/\b(\d+)(?:st|nd|rd|th)?\b/);
  return match?.[1] || "";
}

function normalizeSemesterName(value) {
  const name = String(value || "").trim().toLowerCase();
  const simpleSemester = name.match(/^(?:(?:semester|sem)\s*)?(\d+)(?:st|nd|rd|th)?(?:\s*(?:semester|sem))?$/);
  if (simpleSemester) return `semester${Number(simpleSemester[1])}`;
  return name.replace(/[^a-z0-9]+/g, "");
}

function sameSemester(left, right) {
  return normalizeSemesterName(left) === normalizeSemesterName(right);
}

function compareSemesters(left, right) {
  const leftNumber = Number(semesterNumber(left.semesterName));
  const rightNumber = Number(semesterNumber(right.semesterName));
  if (leftNumber && rightNumber && leftNumber !== rightNumber) return leftNumber - rightNumber;
  if (leftNumber && !rightNumber) return -1;
  if (rightNumber && !leftNumber) return 1;
  return left.semesterName.localeCompare(right.semesterName);
}

function semesterDocumentId(name) {
  return `semester-${normalizeSemesterName(name)}`;
}

function getSemesterRecord(semesterName) {
  const managedSemester = portalStructure.find((record) => sameSemester(record.semesterName, semesterName));
  if (managedSemester || portalStructure.length) return managedSemester || null;
  const defaultSemester = defaultSemesterNames.find((name) => sameSemester(name, semesterName));
  return defaultSemester
    ? { id: semesterDocumentId(defaultSemester), semesterName: defaultSemester, subjects: [] }
    : null;
}

function renderSemesterShortcuts() {
  if (!semesterPills || !semesterCount) return;
  semesterPills.replaceChildren();
  if (portalStructureError) {
    semesterCount.textContent = "Semesters unavailable";
    if (activeSemesterStat) activeSemesterStat.textContent = "—";
    return;
  }
  portalStructure.forEach((semester) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.semesterOpen = "";
    button.dataset.semesterName = semester.semesterName;
    button.textContent = semester.semesterName;
    const icon = document.createElement("i");
    icon.dataset.lucide = "arrow-up-right";
    button.append(icon);
    semesterPills.append(button);
  });
  semesterCount.textContent = `${portalStructure.length} ${portalStructure.length === 1 ? "semester" : "semesters"} available`;
  if (activeSemesterStat) activeSemesterStat.textContent = String(portalStructure.length);
  refreshIcons();
}

function getSemesterSubjects(semester) {
  const semesterRecord = getSemesterRecord(semester);
  if (!semesterRecord) return [];
  return semesterRecord.subjects.map((subjectName) => {
    const legacy = moduleRecords.subjects.find((record) =>
      sameSemester(record.semester, semesterRecord.semesterName)
      && String(record.subjectName || "").trim().toLowerCase() === subjectName.toLowerCase()
    );
    return {
      ...legacy,
      id: legacy?.id || `${semesterRecord.id}-${subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      semester: semesterRecord.semesterName,
      subjectName,
      facultyName: legacy?.facultyName || ""
    };
  });
}

function renderSemesterModal(semesterName) {
  const semesterRecord = getSemesterRecord(semesterName) || portalStructure[0] || null;
  activeSemester = semesterRecord?.semesterName || "";
  activeModalModule = "subjects";
  activeSubjectSelection = "";
  activeSubjectId = "";
  modalTitle.textContent = "Semesters & subjects";
  modalDescription.textContent = "Browse the live curriculum managed by department faculty.";
  setModalView("semester-modal");
  modalDone.hidden = true;
  const wrapper = document.createElement("div");
  wrapper.className = "space-y-5";
  const header = document.createElement("div");
  header.className = "flex flex-wrap items-center justify-between gap-3";
  const heading = document.createElement("h3");
  heading.className = "text-sm font-semibold text-slate-800";
  heading.textContent = activeSemester ? `${activeSemester} curriculum` : "Department curriculum";
  const tabs = document.createElement("div");
  tabs.className = "flex flex-wrap gap-2";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Choose semester");
  portalStructure.forEach((record) => {
    const tab = document.createElement("button");
    const selected = sameSemester(record.semesterName, activeSemester);
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(selected));
    tab.className = `rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${selected ? "border-indigo-600 bg-indigo-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"}`;
    tab.dataset.semesterTab = record.semesterName;
    tab.textContent = record.semesterName;
    tabs.append(tab);
  });
  header.append(heading, tabs);
  wrapper.append(header);

  const subjectGrid = document.createElement("div");
  subjectGrid.className = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3";
  if (portalStructureError) {
    const error = document.createElement("p");
    error.className = "rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:col-span-2 lg:col-span-3";
    error.textContent = portalStructureError;
    subjectGrid.append(error);
  } else if (!portalStructure.length) {
    const empty = document.createElement("p");
    empty.className = "rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 sm:col-span-2 lg:col-span-3";
    empty.textContent = "No semesters have been published yet. The department curriculum will appear here when faculty add it.";
    subjectGrid.append(empty);
  } else {
    const semesterSubjects = getSemesterSubjects(activeSemester);
    semesterSubjects.forEach((subject) => {
      const card = document.createElement("article");
      card.className = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md";
      const icon = document.createElement("span");
      icon.className = "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600";
      icon.dataset.lucide = "book-open";
      const name = document.createElement("h3");
      name.className = "text-sm font-semibold leading-5 text-slate-800";
      name.textContent = subject.subjectName;
      const faculty = document.createElement("p");
      faculty.className = "mt-1 text-xs text-slate-500";
      faculty.textContent = subject.facultyName ? `Faculty: ${subject.facultyName}` : "Department subject";
      const open = document.createElement("button");
      open.type = "button";
      open.className = "mt-4 inline-flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-50";
      open.dataset.subjectDashboard = "";
      open.dataset.subjectId = subject.id;
      open.dataset.subjectName = subject.subjectName;
      open.dataset.subjectSemester = activeSemester;
      open.innerHTML = '<span>Open subject dashboard</span><i data-lucide="arrow-up-right"></i>';
      card.append(icon, name, faculty, open);
      subjectGrid.append(card);
    });
    if (!semesterSubjects.length) {
      const empty = document.createElement("p");
      empty.className = "rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 sm:col-span-2 lg:col-span-3";
      empty.textContent = "No subjects have been added to this semester yet.";
      subjectGrid.append(empty);
    }
  }
  const note = document.createElement("p");
  note.className = "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600";
  note.textContent = "Semesters and subjects are managed by faculty and sync live from Firestore.";
  wrapper.append(subjectGrid, note);
  modalContent.replaceChildren(wrapper);
  refreshIcons();
}

function renderSubjectDashboard(semester, subjectName, subjectId = "") {
  activeModalModule = "subjects";
  activeSemester = String(semester);
  activeSubjectSelection = subjectName;
  activeSubjectId = subjectId;
  setModalView("semester-modal");
  modalDone.hidden = true;
  modalTitle.textContent = `${subjectName} · ${semester} dashboard`;
  modalDescription.textContent = "Subject mentor information and learning resources, synced live from the department.";
  const wrapper = document.createElement("div");
  wrapper.className = "space-y-4";
  const back = document.createElement("button");
  back.type = "button";
  back.className = "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700";
  back.dataset.backToSemesters = "";
  back.innerHTML = '<i data-lucide="arrow-left"></i><span>Back to subjects</span>';
  wrapper.append(back);
  if (subjectResourceError) {
    const error = document.createElement("p");
    error.className = "rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700";
    error.textContent = subjectResourceError;
    wrapper.append(error);
  }
  const dashboardLayout = document.createElement("div");
  dashboardLayout.className = "grid grid-cols-1 items-start gap-4 lg:grid-cols-[250px_minmax(0,1fr)]";
  const subjectRecord = moduleRecords.subjects.find((record) => record.id === subjectId)
    || moduleRecords.subjects.find((record) =>
      sameSemester(record.semester, semester)
      && String(record.subjectName || "").trim().toLowerCase() === subjectName.trim().toLowerCase()
    );
  const infoCard = document.createElement("aside");
  infoCard.className = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-2";
  const infoHeader = document.createElement("div");
  infoHeader.className = "mb-4 border-b border-slate-100 pb-3";
  const infoEyebrow = document.createElement("p");
  infoEyebrow.className = "text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600";
  infoEyebrow.textContent = "Subject faculty";
  const infoTitle = document.createElement("h3");
  infoTitle.className = "mt-1 text-base font-bold uppercase leading-6 text-slate-900";
  infoTitle.textContent = `${semester} Dashboard`.toUpperCase();
  infoHeader.append(infoEyebrow, infoTitle);

  const infoList = document.createElement("dl");
  infoList.className = "space-y-3";
  const addInfo = (label, value, href = "") => {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    term.className = "text-[10px] font-semibold uppercase tracking-wide text-slate-400";
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.className = "mt-1 break-words text-xs font-medium leading-5 text-slate-700";
    if (href && value) {
      const link = document.createElement("a");
      link.className = "text-indigo-700 hover:underline";
      link.href = href;
      link.textContent = value;
      detail.append(link);
    } else {
      detail.textContent = value || "Not provided";
    }
    item.append(term, detail);
    infoList.append(item);
  };
  const contactNumber = subjectRecord?.contactNumber || "";
  const facultyEmail = subjectRecord?.facultyEmail || "";
  addInfo("Mentor name", subjectRecord?.facultyName || "");
  addInfo("Contact number", contactNumber, contactNumber ? `tel:${contactNumber.replace(/[^\d+]/g, "")}` : "");
  addInfo("Email address", facultyEmail, facultyEmail ? `mailto:${facultyEmail}` : "");
  const generalInfo = document.createElement("div");
  generalInfo.className = "mt-4 rounded-lg bg-indigo-50/70 p-3";
  const generalLabel = document.createElement("p");
  generalLabel.className = "text-[10px] font-semibold uppercase tracking-wide text-indigo-600";
  generalLabel.textContent = "General information";
  const generalText = document.createElement("p");
  generalText.className = "mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-700";
  generalText.textContent = subjectRecord?.subjectDescription || "No subject information has been posted.";
  generalInfo.append(generalLabel, generalText);
  infoCard.append(infoHeader, infoList, generalInfo);

  const grid = document.createElement("div");
  grid.className = "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3";
  renderSubjectCategoryGrid(grid, semester, subjectName, subjectId);
  dashboardLayout.append(infoCard, grid);
  wrapper.append(dashboardLayout);
  modalContent.replaceChildren(wrapper);
  refreshIcons();
}

function renderSubjectCategoryGrid(container, semester, subjectName, subjectId = "", options = {}) {
  const { admin = false } = options;
  container.replaceChildren();
  const matchingResources = subjectResources.filter((record) =>
    sameSemester(record.semester, semester)
    && String(record.subjectName || "").trim().toLowerCase() === subjectName.trim().toLowerCase()
  );
  const subject = moduleRecords.subjects.find((record) => record.id === subjectId)
    || moduleRecords.subjects.find((record) =>
      sameSemester(record.semester, semester)
      && String(record.subjectName || "").trim().toLowerCase() === subjectName.trim().toLowerCase()
    );
  subjectResourceCategories.forEach(({ name: categoryName, icon }) => {
    const card = document.createElement("article");
    card.className = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md";
    const heading = document.createElement("div");
    heading.className = "mb-3 flex items-center gap-2.5";
    const categoryIcon = document.createElement("span");
    categoryIcon.className = "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600";
    categoryIcon.dataset.lucide = icon;
    const title = document.createElement("h3");
    title.className = "text-sm font-semibold text-slate-800";
    title.textContent = categoryName;
    heading.append(categoryIcon, title);
    card.append(heading);
    let items = matchingResources.filter((record) => {
      if (record.category === categoryName) return true;
      return categoryName === "Assignments" && /^Assignment [1-4]$/i.test(record.category);
    });
    const legacyField = categoryName === "Syllabus"
      ? { title: "Syllabus", url: subject?.syllabusUrl }
      : categoryName === "Subject Notes"
        ? { title: "Subject notes", url: subject?.notesUrl }
        : null;
    if (legacyField && safeAnnouncementLink(legacyField.url) && !items.length) {
      items = [{ ...legacyField, legacy: true }];
    }
    items.sort((left, right) => String(left.title || "").localeCompare(String(right.title || "")));
    if (admin) {
      const isEditingCategory = activeAdminCategoryEdit?.category === categoryName;
      if (isEditingCategory) {
        const existing = items.find((record) => record.id === activeAdminCategoryEdit.resourceId) || null;
        const form = document.createElement("form");
        form.className = "mt-2 space-y-2";
        form.dataset.subjectCategoryForm = "";
        form.dataset.subjectCategory = categoryName;
        const resourceId = document.createElement("input");
        resourceId.type = "hidden";
        resourceId.name = "resourceId";
        resourceId.value = existing?.id || "";
        const resourceTitle = document.createElement("input");
        resourceTitle.type = "text";
        resourceTitle.name = "title";
        resourceTitle.required = true;
        resourceTitle.maxLength = 100;
        resourceTitle.value = existing?.title || "";
        resourceTitle.placeholder = categoryName === "Syllabus"
          ? "Syllabus title"
          : categoryName === "Subject Notes"
            ? "e.g. Unit-1 · Introduction"
            : categoryName === "Assignments"
              ? "e.g. Assignment 1"
              : categoryName === "Lab Experiments"
                ? "e.g. Experiment 1 · Linear regression"
                : categoryName === "MST Old Papers"
                  ? "e.g. OLD MST-1"
                  : "Resource title";
        resourceTitle.className = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";
        const deadline = document.createElement("input");
        deadline.type = "date";
        deadline.name = "deadline";
        deadline.value = existing?.deadline || "";
        deadline.className = resourceTitle.className;
        deadline.hidden = categoryName !== "Assignments";
        deadline.setAttribute("aria-label", "Assignment deadline");
        const input = document.createElement("input");
        input.type = "url";
        input.name = "url";
        input.required = true;
        input.value = existing?.url || "";
        input.placeholder = "https://drive.google.com/...";
        input.autocomplete = "url";
        input.className = resourceTitle.className;
        const actions = document.createElement("div");
        actions.className = "flex gap-2";
        const save = document.createElement("button");
        save.type = "submit";
        save.className = "rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700";
        save.textContent = existing ? "Save changes" : "Add resource";
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50";
        cancel.dataset.adminCategoryCancel = "";
        cancel.textContent = "Cancel";
        actions.append(save, cancel);
        form.append(resourceId, resourceTitle);
        if (!deadline.hidden) form.append(deadline);
        form.append(input, actions);
        card.append(form);
      } else {
        const publishedItems = items.filter((record) => safeAnnouncementLink(record.url));
        if (publishedItems.length) {
          const list = document.createElement("div");
          list.className = "mb-3 space-y-2";
          publishedItems.forEach((resource) => {
            const row = document.createElement("div");
            row.className = "flex items-start justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2";
            const details = document.createElement("div");
            details.className = "min-w-0";
            const link = document.createElement("a");
            link.className = "block truncate text-xs font-semibold text-indigo-700 underline decoration-indigo-200 underline-offset-2";
            link.href = resource.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = resource.title || categoryName;
            details.append(link);
            if (resource.deadline) {
              const due = document.createElement("p");
              due.className = "mt-1 text-[11px] text-slate-500";
              due.textContent = `Deadline: ${formatAdminDate(resource.deadline)}`;
              details.append(due);
            }
            row.append(details);
            if (resource.id) {
              const actions = document.createElement("div");
              actions.className = "flex shrink-0 gap-1";
              const edit = document.createElement("button");
              edit.type = "button";
              edit.className = "admin-row-button";
              edit.dataset.adminCategoryEdit = categoryName;
              edit.dataset.resourceId = resource.id;
              edit.setAttribute("aria-label", `Edit ${resource.title || categoryName}`);
              edit.innerHTML = '<i data-lucide="pencil"></i>';
              const remove = document.createElement("button");
              remove.type = "button";
              remove.className = "admin-row-button admin-delete-button";
              remove.dataset.subjectResourceDelete = resource.id;
              remove.setAttribute("aria-label", `Delete ${resource.title || categoryName}`);
              remove.innerHTML = '<i data-lucide="trash-2"></i>';
              actions.append(edit, remove);
              row.append(actions);
            }
            list.append(row);
          });
          card.append(list);
        } else {
          const empty = document.createElement("p");
          empty.className = "mb-3 text-xs leading-5 text-slate-500";
          empty.textContent = "No resource published yet";
          card.append(empty);
        }
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "inline-flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-50";
        edit.dataset.adminCategoryEdit = categoryName;
        edit.dataset.resourceId = "";
        edit.innerHTML = `<span>${publishedItems.length ? "Add another resource" : "Add resource"}</span><i data-lucide="plus"></i>`;
        card.append(edit);
      }
    } else if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "text-xs leading-5 text-slate-500";
      empty.textContent = subjectResourceError ? "Resources could not be loaded." : "No resources published yet.";
      card.append(empty);
    } else {
      const links = document.createElement("div");
      links.className = "space-y-2";
      items.forEach((resource) => {
        const link = document.createElement("a");
        link.className = "flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-50";
        link.href = resource.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const resourceTitle = document.createElement("span");
        resourceTitle.textContent = resource.title || categoryName;
        const linkIcon = document.createElement("i");
        linkIcon.dataset.lucide = "external-link";
        const item = document.createElement("div");
        item.className = "rounded-lg border border-slate-100 px-3 py-2";
        link.append(resourceTitle, linkIcon);
        item.append(link);
        if (resource.deadline) {
          const due = document.createElement("p");
          due.className = "mt-1 text-[11px] text-slate-500";
          due.textContent = `Deadline: ${formatAdminDate(resource.deadline)}`;
          item.append(due);
        }
        links.append(item);
      });
      card.append(links);
    }
    container.append(card);
  });
  refreshIcons();
}

function renderModuleModal(moduleKey) {
  const definition = moduleDefinitions[moduleKey];
  if (!definition) return;
  activeModalModule = moduleKey;
  setModalView(moduleKey === "announcements" ? "announcement-modal" : "semester-modal");
  modalTitle.textContent = definition.label;
  modalDescription.textContent = "Faculty-published resources synced live from Firestore.";
  modalContent.replaceChildren();
  const records = moduleRecords[moduleKey] || [];
  if (moduleErrors[moduleKey]) {
    const error = document.createElement("p");
    error.className = "rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700";
    error.textContent = moduleErrors[moduleKey];
    modalContent.append(error);
    return;
  }
  if (!records.length) {
    const empty = document.createElement("p");
    empty.className = "rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500";
    empty.textContent = `No published ${definition.label.toLowerCase()} resources yet.`;
    modalContent.append(empty);
    return;
  }
  const list = document.createElement("div");
  list.className = "grid gap-3 sm:grid-cols-2";
  records.forEach((record) => {
    const card = document.createElement("article");
    card.className = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
    const heading = document.createElement("h3");
    heading.className = "text-sm font-semibold text-slate-800";
    heading.textContent = String(
      record.title
      || record.subjectName
      || record.projectType
      || record.batchSem
      || record.branchSem
      || record.platform
      || definition.label
    );
    card.append(heading);
    definition.fields.forEach((field) => {
      const value = record[field.name];
      if (!value) return;
      if (field.name === "title" && heading.textContent === String(value)) return;
      if (field.type === "url" && safeAnnouncementLink(value)) {
        const link = document.createElement("a");
        link.className = "mt-3 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-800";
        link.href = value;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `Open ${field.label}`;
        card.append(link);
      } else {
        const detail = document.createElement("p");
        detail.className = "mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600";
        detail.textContent = `${field.label}: ${value}`;
        card.append(detail);
      }
    });
    list.append(card);
  });
  modalContent.append(list);
}

function showModal(key) {
  if (key === "announcements") {
    lastFocusedElement = document.activeElement;
    renderAnnouncementList();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalClose.focus();
    return;
  }

  if (key === "login") {
    lastFocusedElement = document.activeElement;
    if (isAuthorizedFaculty()) {
      showDashboardView("admin", adminNavLink);
      return;
    }
    renderPortalLogin();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (!isAuthorizedFaculty()) modalContent.querySelector('input[name="email"]').focus();
    else modalClose.focus();
    return;
  }

  if (key === "semesters") {
    lastFocusedElement = document.activeElement;
    setModalView("semester-modal");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    renderSemesterModal(activeSemester || portalStructure[0]?.semesterName || "");
    modalClose.focus();
    return;
  }

  const moduleForModal = {
    schedule: "timetables",
    projects: "projects",
    syllabus: "syllabus",
    placement: "placement",
    outcomes: "outcomes",
    connect: "connect"
  }[key];
  if (moduleForModal) {
    lastFocusedElement = document.activeElement;
    renderModuleModal(moduleForModal);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalClose.focus();
    return;
  }

  const details = modalDetails[key] || {
    title: "Department resource",
    description: "This resource is part of the JNCT AI & Data Science department hub.",
    content: "Please check with your faculty coordinator for the latest information."
  };

  lastFocusedElement = document.activeElement;
  modalPanel.classList.remove("semester-modal", "project-modal", "announcement-modal", "portal-modal");
  modalContent.classList.remove("semester-content", "project-content", "announcement-content", "portal-content");
  modalDone.hidden = false;
  modalTitle.textContent = details.title;
  modalDescription.textContent = details.description;
  modalContent.innerHTML = details.content;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  refreshIcons();

  const focusTarget = modal.querySelector("input") || modalClose;
  focusTarget.focus();

  const loginForm = modalContent.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      modalDescription.textContent = "Sign-in is not available in this preview. Contact your department administrator for access.";
      loginForm.remove();
    });
  }
}

function closeModal() {
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

function filterCards() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
    const searchText = `${card.dataset.search || ""} ${card.textContent}`.toLocaleLowerCase();
    const queryMatches = !query || searchText.includes(query);
    const isVisible = categoryMatches && queryMatches;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

document.addEventListener("click", (event) => {
  const dashboardNavItem = event.target.closest(".nav-link[data-nav]");
  if (dashboardNavItem) {
    showDashboardView("overview", dashboardNavItem);
    return;
  }

  const sectionSwitch = event.target.closest("[data-section-switch]");
  if (sectionSwitch) {
    showDashboardView(sectionSwitch.dataset.sectionSwitch);
    return;
  }

  const adminTab = event.target.closest("[data-admin-tab]");
  if (adminTab) {
    renderAdminSection(adminTab.dataset.adminTab);
    return;
  }

  const moduleEdit = event.target.closest("[data-module-edit]");
  if (moduleEdit) {
    const key = moduleEdit.dataset.moduleEdit;
    const record = moduleRecords[key]?.find((item) => item.id === moduleEdit.dataset.recordId);
    if (record) editModuleRecord(key, record);
    return;
  }

  const moduleDelete = event.target.closest("[data-module-delete]");
  if (moduleDelete) {
    const key = moduleDelete.dataset.moduleDelete;
    const record = moduleRecords[key]?.find((item) => item.id === moduleDelete.dataset.recordId);
    if (!isAuthorizedFaculty()) return;
    if (!record || !window.confirm(`Delete this ${moduleDefinitions[key].label.toLowerCase()} record?`)) return;
    firestore.collection(moduleDefinitions[key].collection).doc(record.id).delete().catch((error) => {
      const status = document.querySelector(`[data-module-status="${key}"]`);
      setNoticeStatus(status, "error", firebaseErrorMessage(error, `delete ${moduleDefinitions[key].label.toLowerCase()}`));
      console.error(`Firestore ${key} delete failed.`, error);
    });
    return;
  }

  const structureSubjectDelete = event.target.closest("[data-structure-delete-subject]");
  if (structureSubjectDelete) {
    void deleteStructureSubject(structureSubjectDelete.dataset.structureDeleteSubject, structureSubjectDelete.dataset.subjectName);
    return;
  }

  const structureSubjectEdit = event.target.closest("[data-structure-edit-subject]");
  if (structureSubjectEdit) {
    editStructureSubject(structureSubjectEdit.dataset.structureEditSubject, structureSubjectEdit.dataset.subjectName);
    return;
  }

  if (event.target.closest("#subject-cancel-edit")) {
    const form = document.querySelector("#subject-create-form");
    resetStructureSubjectForm(form?.elements.semester.value || "");
    document.querySelector("#structure-admin-status").textContent = "";
    return;
  }

  const structureSemesterDelete = event.target.closest("[data-structure-delete-semester]");
  if (structureSemesterDelete) {
    void deleteStructureSemester(structureSemesterDelete.dataset.structureDeleteSemester);
    return;
  }

  const adminCategoryEdit = event.target.closest("[data-admin-category-edit]");
  if (adminCategoryEdit) {
    activeAdminCategoryEdit = {
      category: adminCategoryEdit.dataset.adminCategoryEdit,
      resourceId: adminCategoryEdit.dataset.resourceId || ""
    };
    renderSubjectResourceAdminGrid();
    document.querySelector(`#subject-resource-admin-grid [data-subject-category-form] input[name="title"]`)?.focus();
    return;
  }

  const subjectResourceDelete = event.target.closest("[data-subject-resource-delete]");
  if (subjectResourceDelete) {
    void deleteSubjectResource(subjectResourceDelete.dataset.subjectResourceDelete);
    return;
  }

  const cancelCategoryEdit = event.target.closest("[data-admin-category-cancel]");
  if (cancelCategoryEdit) {
    activeAdminCategoryEdit = null;
    renderSubjectResourceAdminGrid();
    return;
  }

  const moduleCancel = event.target.closest("[data-module-cancel]");
  if (moduleCancel) {
    const key = moduleCancel.dataset.moduleCancel;
    const form = document.querySelector(`[data-module-form="${key}"]`);
    form.reset();
    form.elements.id.value = "";
    document.querySelector(`[data-module-submit-label="${key}"]`).textContent = "Publish";
    moduleCancel.hidden = true;
    document.querySelector(`[data-module-status="${key}"]`).textContent = "";
    return;
  }

  const editAdminNotice = event.target.closest("[data-admin-edit]");
  if (editAdminNotice) {
    const notice = announcements.find((item) => item.id === editAdminNotice.dataset.adminEdit);
    if (!notice) return;
    adminNoticeForm.elements.id.value = notice.id;
    adminNoticeForm.elements.title.value = notice.title;
    adminNoticeForm.elements.category.value = notice.category;
    adminNoticeForm.elements.date.value = notice.date;
    adminNoticeForm.elements.body.value = notice.body;
    adminNoticeForm.elements.link.value = notice.link;
    document.querySelector("#admin-form-heading").textContent = "Edit department notice";
    document.querySelector("#admin-notice-submit").textContent = "Save changes";
    document.querySelector("#admin-cancel-edit").hidden = false;
    adminNoticeForm.scrollIntoView({ behavior: "smooth", block: "start" });
    adminNoticeForm.elements.title.focus();
    return;
  }

  const deleteAdminNotice = event.target.closest("[data-admin-delete]");
  if (deleteAdminNotice) {
    const notice = announcements.find((item) => item.id === deleteAdminNotice.dataset.adminDelete);
    if (!notice || !window.confirm(`Delete "${notice.title}"? This also removes it from the student dashboard.`)) return;
    if (adminNoticeForm.elements.id.value === notice.id) resetAdminNoticeForm();
    void deleteAnnouncement(notice);
    return;
  }

  const semesterTab = event.target.closest("[data-semester-tab]");
  if (semesterTab) {
    renderSemesterModal(semesterTab.dataset.semesterTab);
    return;
  }

  const semesterShortcut = event.target.closest("[data-semester-open]");
  if (semesterShortcut) {
    lastFocusedElement = document.activeElement;
    setModalView("semester-modal");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    renderSemesterModal(semesterShortcut.dataset.semesterName);
    modalClose.focus();
    return;
  }

  const subjectDashboard = event.target.closest("[data-subject-dashboard]");
  if (subjectDashboard) {
    renderSubjectDashboard(
      subjectDashboard.dataset.subjectSemester,
      subjectDashboard.dataset.subjectName,
      subjectDashboard.dataset.subjectId
    );
    return;
  }

  if (event.target.closest("[data-back-to-semesters]")) {
    renderSemesterModal(activeSemester);
    return;
  }

  const dashboardModuleCard = event.target.closest("[data-dashboard-module]");
  if (dashboardModuleCard && !event.target.closest("a, button")) {
    showModal(dashboardModuleCard.dataset.dashboardModule);
    return;
  }

  const trigger = event.target.closest("[data-open]");
  if (trigger) showModal(trigger.dataset.open);
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "semester-create-form") {
    event.preventDefault();
    void addSemester(event.target);
    return;
  }

  if (event.target.id === "subject-create-form") {
    event.preventDefault();
    void addStructureSubject(event.target);
    return;
  }

  if (event.target.getAttribute("id") === "admin-notice-form") {
    event.preventDefault();
    void publishAnnouncementForm(adminNoticeForm);
    return;
  }

  if (event.target.id === "portal-login-form") {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const button = form.querySelector('button[type="submit"]');
    void signInFaculty(
      String(data.get("email") || "").trim(),
      String(data.get("password") || ""),
      form.querySelector("#portal-error"),
      button
    );
    return;
  }

  const moduleForm = event.target.closest("[data-module-form]");
  if (moduleForm) {
    event.preventDefault();
    void saveModuleRecord(moduleForm.dataset.moduleForm, moduleForm);
    return;
  }

  if (event.target.id === "subject-resource-form") {
    event.preventDefault();
    return;
  }

  const categoryForm = event.target.closest("[data-subject-category-form]");
  if (categoryForm) {
    event.preventDefault();
    void saveSubjectCategory(categoryForm);
  }

});

document.addEventListener("change", (event) => {
  if (event.target.matches("#subject-create-form [name='semester']")) return;
  if (event.target.matches("#subject-resource-form [name='semester']")) {
    activeAdminCategoryEdit = null;
    refreshResourceSubjectSelect();
    renderSubjectResourceAdminGrid();
  } else if (event.target.matches("#subject-resource-form [name='subjectName']")) {
    activeAdminCategoryEdit = null;
    renderSubjectResourceAdminGrid();
  }
});

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter;
    filterTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    filterCards();
  });
});

searchInput.addEventListener("input", filterCards);
document.querySelector("#clear-search").addEventListener("click", () => {
  searchInput.value = "";
  activeFilter = "all";
  filterTabs.forEach((tab) => {
    const isActive = tab.dataset.filter === "all";
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  filterCards();
  searchInput.focus();
});

document.querySelector("#admin-sign-out").addEventListener("click", () => {
  if (!firebaseAuth) return;
  firebaseAuth.signOut().catch((error) => {
    const status = document.querySelector("#admin-auth-message");
    if (status) status.textContent = firebaseErrorMessage(error, "sign out");
    console.error("Firebase sign out failed.", error);
  });
});

document.querySelector("#admin-cancel-edit").addEventListener("click", () => {
  resetAdminNoticeForm();
  const message = document.querySelector("#admin-notice-message");
  message.className = "admin-message";
  message.textContent = "";
});

adminNoticeForm.elements.date.value = localInputDate();

modalClose.addEventListener("click", closeModal);
modalDone.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  if (event.key === "Escape" && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
    document.body.classList.remove("mobile-sidebar-open");
    mobileNavToggle.setAttribute("aria-expanded", "false");
    mobileNavToggle.setAttribute("aria-label", "Open navigation menu");
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

mobileNavToggle.addEventListener("click", () => {
  const isOpening = !sidebar.classList.contains("active");
  sidebar.classList.toggle("active", isOpening);
  document.body.classList.toggle("mobile-sidebar-open", isOpening);
  mobileNavToggle.setAttribute("aria-expanded", String(isOpening));
  mobileNavToggle.setAttribute("aria-label", isOpening ? "Close navigation menu" : "Open navigation menu");
});
sidebar.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("active");
    document.body.classList.remove("mobile-sidebar-open");
    mobileNavToggle.setAttribute("aria-expanded", "false");
    mobileNavToggle.setAttribute("aria-label", "Open navigation menu");
  });
});
document.addEventListener("pointerdown", (event) => {
  if (
    sidebar.classList.contains("active")
    && !sidebar.contains(event.target)
    && !mobileNavToggle.contains(event.target)
  ) {
    sidebar.classList.remove("active");
    document.body.classList.remove("mobile-sidebar-open");
    mobileNavToggle.setAttribute("aria-expanded", "false");
    mobileNavToggle.setAttribute("aria-label", "Open navigation menu");
  }
});

aiToggleButton.addEventListener("click", toggleAiChat);
aiChatWindow.querySelector(".ai-chat-close").addEventListener("click", toggleAiChat);
aiVoiceToggle.addEventListener("click", () => {
  aiVoiceEnabled = !aiVoiceEnabled;
  aiVoiceToggle.setAttribute("aria-pressed", String(aiVoiceEnabled));
  aiVoiceToggle.setAttribute("aria-label", aiVoiceEnabled ? "Mute assistant voice" : "Enable assistant voice");
  aiVoiceToggle.title = aiVoiceEnabled ? "Mute assistant voice" : "Enable assistant voice";
  aiVoiceToggle.innerHTML = `<i data-lucide="${aiVoiceEnabled ? "volume-2" : "volume-x"}"></i>`;
  refreshIcons();
  if (!aiVoiceEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
});
if (micButton && speechRecognition) {
  micButton.addEventListener("click", () => {
    if (isListening) {
      speechRecognition.stop();
      return;
    }

    try {
      speechRecognition.start();
      isListening = true;
      micButton.classList.add("listening");
    } catch (error) {
      isListening = false;
      micButton.classList.remove("listening");
      console.error("Could not start speech recognition.", error);
    }
  });
}
aiChatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendAiMessage();
});

refreshIcons();
renderAnnouncementDashboard();
document.querySelector("#footer-year").textContent = String(new Date().getFullYear());
startModuleListeners();
if (firebaseAuth) {
  firebaseAuth.onAuthStateChanged(handleAuthState, (error) => {
    const message = firebaseErrorMessage(error, "restore the faculty sign-in session");
    const status = document.querySelector("#admin-auth-message");
    if (status) status.textContent = message;
    console.error("Firebase Auth state listener failed.", error);
  });
}
