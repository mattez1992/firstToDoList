const todoList = document.querySelector("#todo-list");
// const form = document.querySelector('#add-todo-form');
const form = document.querySelector("#add-todo-form");
const updateBtn = document.getElementById("update-btn");
const logoutItems = document.querySelectorAll(".logged-out");
const loginItems = document.querySelectorAll(".logged-in");
let currentUser = null;
let updateId = null;
let newTitle = "";

const createUI = (user) => {
  if (user) {
    loginItems.forEach((item) => (item.style.display = "block"));
    logoutItems.forEach((item) => (item.style.display = "none"));
  } else {
    loginItems.forEach((item) => (item.style.display = "none"));
    logoutItems.forEach((item) => (item.style.display = "block"));
  }
};

function renderList(doc) {
  let li = document.createElement("li");
  li.className = "collection-item";
  li.setAttribute("data-id", doc.id);
  let div = document.createElement("div");
  let title = document.createElement("span");
  title.textContent = doc.data().title;
  let anchor = document.createElement("a");
  anchor.href = "#modal-edit";
  anchor.className = "modal-trigger secondary-content";
  let editBtn = document.createElement("i");
  editBtn.className = "material-icons";
  editBtn.innerText = "edit";
  let deleteBtn = document.createElement("i");
  deleteBtn.className = "material-icons secondary-content";
  deleteBtn.innerText = "delete";
  anchor.appendChild(editBtn);
  div.appendChild(title);
  div.appendChild(deleteBtn);
  div.appendChild(anchor);
  li.appendChild(div);
  deleteBtn.addEventListener("click", (e) => {
    console.log(e.target.parentElement.parentElement);
    let id = e.target.parentElement.parentElement.getAttribute("data-id");
    console.log(id);
    db.collection("alltodos")
      .doc(currentUser.uid)
      .collection("todos")
      .doc(id)
      .delete();
  });
  editBtn.addEventListener("click", (e) => {
    updateId =
      e.target.parentElement.parentElement.parentElement.getAttribute(
        "data-id"
      );
  });

  todoList.append(li);
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log(form.title.value);
  db.collection("alltodos").doc(currentUser.uid).collection("todos").add({
    title: form.title.value,
  });
  form.title.value = "";
});
updateBtn.addEventListener("click", (e) => {
  newTitle = document.getElementsByName("newtitle")[0].value;
  if (newTitle.length > 0) {
    db.collection("alltodos")
      .doc(currentUser.uid)
      .collection("todos")
      .doc(updateId)
      .update({
        title: newTitle,
      });
  }
  document.getElementsByName("newtitle")[0].value = "";
});

const getTodos = () => {
  todoList.innerHTML = "";
  currentUser = auth.currentUser;
  console.log("app.js", currentUser);
  document.querySelector("#user-email").innerHTML =
    currentUser != null ? currentUser.email : "";
  if (currentUser === null) {
    todoList.innerHTML = `<h3 class="center-align">Please login to get todos</h3>`;
  } else {
    db.collection("alltodos")
      .doc(currentUser.uid)
      .collection("todos")
      .orderBy("title")
      .onSnapshot((snapshot) => {
        let changes = snapshot.docChanges();
        changes.forEach((change) => {
          if (change.type == "added") {
            renderList(change.doc);
          } else if (change.type == "removed") {
            let li = todoList.querySelector(`[data-id=${change.doc.id}]`);
            todoList.removeChild(li);
          } else if (change.type == "modified") {
            let li = todoList.querySelector(`[data-id=${change.doc.id}]`);
            li.getElementsByTagName("span")[0].textContent = newTitle;
            newTitle = "";
          }
        });
      });
  }
};
