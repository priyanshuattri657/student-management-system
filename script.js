const STORAGE_KEY = "student-management-records";

const sampleStudents = [
  {
    id: "student-1",
    name: "Aarav Mehta",
    rollNumber: "CS-2024-001",
    email: "aarav.mehta@college.edu",
    course: "Computer Science",
    semester: "Semester 4"
  },
  {
    id: "student-2",
    name: "Ishita Rao",
    rollNumber: "DS-2024-014",
    email: "ishita.rao@college.edu",
    course: "Data Science",
    semester: "Semester 3"
  },
  {
    id: "student-3",
    name: "Kabir Nair",
    rollNumber: "IT-2024-022",
    email: "kabir.nair@college.edu",
    course: "Information Technology",
    semester: "Semester 5"
  },
  {
    id: "student-4",
    name: "Meera Kapoor",
    rollNumber: "BA-2024-031",
    email: "meera.kapoor@college.edu",
    course: "Business Administration",
    semester: "Semester 2"
  }
];

let students = loadStudents();
let searchTerm = "";
let selectedCourse = "";
let selectedSemester = "";
const $ = (selector) => document.querySelector(selector);

function loadStudents() {
  const savedStudents = localStorage.getItem(STORAGE_KEY);

  if (savedStudents) {
    return JSON.parse(savedStudents);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleStudents));
  return [...sampleStudents];
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => {
    const characters = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;"
    };

    return characters[character];
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getVisibleStudents() {
  const query = searchTerm.toLowerCase().trim();

  return students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(query) ||
      student.rollNumber.toLowerCase().includes(query);

    const matchesCourse =
      !selectedCourse || student.course === selectedCourse;

    const matchesSemester =
      !selectedSemester || student.semester === selectedSemester;

    return matchesSearch && matchesCourse && matchesSemester;
  });
}

function renderStudents() {
  const tableBody = $("#student-table-body");
  const emptyState = $("#empty-state");
  const visibleStudents = getVisibleStudents();

  tableBody.innerHTML = visibleStudents
    .map(
      (student) => `
        <tr>
          <td>
            <div class="student-cell">
              <span class="student-avatar">${getInitials(student.name)}</span>
              <span>${escapeHtml(student.name)}</span>
            </div>
          </td>
          <td>${escapeHtml(student.rollNumber)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${escapeHtml(student.course)}</td>
          <td>${escapeHtml(student.semester)}</td>
          <td>
            <div class="action-group">
              <button
                class="icon-btn"
                type="button"
                title="Edit student"
                data-action="edit"
                data-id="${student.id}"
                data-testid="edit-student-${student.id}"
              >
                ✎
              </button>

              <button
                class="icon-btn delete"
                type="button"
                title="Delete student"
                data-action="delete"
                data-id="${student.id}"
                data-testid="delete-student-${student.id}"
              >
                ⌫
              </button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  emptyState.hidden = visibleStudents.length > 0;

  if (searchTerm && visibleStudents.length === 0) {
    $("#empty-message").textContent =
      "Try searching with another name or roll number.";
  } else {
    $("#empty-message").textContent =
      "Add your first student to start building the directory.";
  }

  $("#record-count").textContent = searchTerm
    ? `Showing ${visibleStudents.length} of ${students.length} records`
    : `Showing ${students.length} record${students.length === 1 ? "" : "s"}`;

  updateStatistics();
}

function updateStatistics() {
  $("#total-students").textContent = students.length;

  $("#total-courses").textContent = new Set(
    students.map((student) => student.course)
  ).size;

  $("#total-semesters").textContent = new Set(
    students.map((student) => student.semester)
  ).size;

  const latestStudent = students[students.length - 1];

  $("#latest-student").textContent = latestStudent
    ? latestStudent.name
    : "—";

  $("#latest-course").textContent = latestStudent
    ? latestStudent.course
    : "No records yet";
}

function openModal(student = null) {
  $("#student-form").reset();
  clearErrors();

  $("#student-id").value = student ? student.id : "";

  if (student) {
    $("#modal-title").textContent = "Edit student";
    $("#modal-description").textContent =
      "Update the details below and save your changes.";

    $("#student-name").value = student.name;
    $("#roll-number").value = student.rollNumber;
    $("#student-email").value = student.email;
    $("#student-course").value = student.course;
    $("#student-semester").value = student.semester;
  } else {
    $("#modal-title").textContent = "Add a student";
    $("#modal-description").textContent =
      "Enter the details below to create a new student record.";
  }

  $("#modal-backdrop").hidden = false;
  document.body.style.overflow = "hidden";
  $("#student-name").focus();
}

function closeModal() {
  $("#modal-backdrop").hidden = true;
  document.body.style.overflow = "";
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((error) => {
    error.textContent = "";
  });
}

function showError(id, message) {
  $(`#${id}-error`).textContent = message;
}

function validateForm(data) {
  clearErrors();

  let valid = true;

  if (data.name.length < 2) {
    showError("name", "Enter the student name.");
    valid = false;
  }

  if (!/^[a-z0-9-]+$/i.test(data.rollNumber)) {
    showError("roll", "Use letters, numbers, or hyphens.");
    valid = false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    showError("email", "Enter a valid email address.");
    valid = false;
  }

  if (!data.course) {
    showError("course", "Select a course.");
    valid = false;
  }

  if (!data.semester) {
    showError("semester", "Select a semester.");
    valid = false;
  }

  const duplicateRollNumber = students.some(
    (student) =>
      student.rollNumber.toLowerCase() === data.rollNumber.toLowerCase() &&
      student.id !== data.id
  );

  if (duplicateRollNumber) {
    showError("roll", "This roll number already exists.");
    valid = false;
  }

  return valid;
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute("data-testid", `${type}-notification`);

  $("#toast-container").appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}
const filterButton = document.querySelector(".filter-btn");

filterButton.addEventListener("click", () => {
  let existingPanel = document.querySelector(".filter-panel");

  if (existingPanel) {
    existingPanel.remove();
    return;
  }

  const courses = [...new Set(students.map((student) => student.course))];
  const semesters = [...new Set(students.map((student) => student.semester))];

  const panel = document.createElement("div");
  panel.className = "filter-panel";

  panel.innerHTML = `
    <div class="filter-group">
      <label for="course-filter">Course</label>
      <select id="course-filter">
        <option value="">All Courses</option>
        ${courses
          .map(
            (course) =>
              `<option value="${escapeHtml(course)}" ${
                selectedCourse === course ? "selected" : ""
              }>${escapeHtml(course)}</option>`
          )
          .join("")}
      </select>
    </div>

    <div class="filter-group">
      <label for="semester-filter">Semester</label>
      <select id="semester-filter">
        <option value="">All Semesters</option>
        ${semesters
          .map(
            (semester) =>
              `<option value="${escapeHtml(semester)}" ${
                selectedSemester === semester ? "selected" : ""
              }>${escapeHtml(semester)}</option>`
          )
          .join("")}
      </select>
    </div>

    <button type="button" class="clear-filter-btn">
      Clear Filters
    </button>
  `;

  document.querySelector(".tools").appendChild(panel);

  $("#course-filter").addEventListener("change", (event) => {
    selectedCourse = event.target.value;
    renderStudents();
  });

  $("#semester-filter").addEventListener("change", (event) => {
    selectedSemester = event.target.value;
    renderStudents();
  });

  panel.querySelector(".clear-filter-btn").addEventListener("click", () => {
    selectedCourse = "";
    selectedSemester = "";
    renderStudents();
    panel.remove();
  });
});
$("#open-add-btn").addEventListener("click", () => {
  openModal();
});

$("#empty-add-btn").addEventListener("click", () => {
  openModal();
});

$("#close-modal-btn").addEventListener("click", closeModal);
$("#cancel-btn").addEventListener("click", closeModal);

$("#modal-backdrop").addEventListener("click", (event) => {
  if (event.target === $("#modal-backdrop")) {
    closeModal();
  }
});

$("#search-input").addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderStudents();
});

$("#student-table-body").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const student = students.find(
    (item) => item.id === button.dataset.id
  );

  if (button.dataset.action === "edit") {
    openModal(student);
  }

  if (button.dataset.action === "delete") {
    const confirmed = confirm(`Delete ${student.name}'s record?`);

    if (confirmed) {
      students = students.filter((item) => item.id !== student.id);
      saveStudents();
      renderStudents();
      showToast("Student record deleted.");
    }
  }
});

$("#student-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const data = {
    id: $("#student-id").value,
    name: $("#student-name").value.trim(),
    rollNumber: $("#roll-number").value.trim().toUpperCase(),
    email: $("#student-email").value.trim(),
    course: $("#student-course").value,
    semester: $("#student-semester").value
  };

  if (!validateForm(data)) {
    showToast("Please check the highlighted fields.", "error");
    return;
  }

  const existingIndex = students.findIndex(
    (student) => student.id === data.id
  );

  if (existingIndex >= 0) {
    students[existingIndex] = data;
    showToast("Student record updated.");
  } else {
    data.id = `student-${Date.now()}`;
    students.push(data);
    showToast("Student added successfully.");
  }

  saveStudents();
  renderStudents();
  closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("#modal-backdrop").hidden) {
    closeModal();
  }
});

$("#current-date").textContent = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric"
}).format(new Date());

renderStudents();
