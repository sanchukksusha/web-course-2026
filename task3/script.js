const tasks = [];
let nextId = 1;
let currentFilter = "all";

const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const counts = document.querySelector("#counts");
const emptyMessage = document.querySelector("#empty-message");
const filterButtons = document.querySelectorAll(".filter-button");

function render() {
  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  taskList.replaceChildren();

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;
    item.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Выполнено: ${task.text}`);

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const id = document.createElement("span");
    id.className = "task-id";
    id.textContent = task.id;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Удалить";
    deleteButton.setAttribute("aria-label", `Удалить: ${task.text}`);

    item.append(checkbox, id, text, deleteButton);
    taskList.append(item);
  });

  const completedCount = tasks.filter((task) => task.completed).length;

  counts.textContent =
    `Осталось: ${tasks.length - completedCount}, Выполнено: ${completedCount}`;

  emptyMessage.textContent = tasks.length === 0
    ? "Пока нет задач. Добавьте первую!"
    : "По этому фильтру задач нет.";

  emptyMessage.hidden = visibleTasks.length > 0;
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === currentFilter;

    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({
    id: nextId++,
    text,
    completed: false
  });

  input.value = "";
  input.focus();

  render();
});

taskList.addEventListener("change", (event) => {
  if (!event.target.matches(".task-check")) return;

  const id = Number(event.target.closest(".task-item").dataset.id);
  const task = tasks.find((item) => item.id === id);

  if (!task) return;

  task.completed = event.target.checked;
  render();
});

taskList.addEventListener("click", (event) => {
  if (!event.target.matches(".delete-button")) return;

  const id = Number(event.target.closest(".task-item").dataset.id);
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) return;

  tasks.splice(index, 1);
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (currentFilter === button.dataset.filter) return;

    currentFilter = button.dataset.filter;

    updateFilterButtons();
    render();
  });
});

updateFilterButtons();
render();
