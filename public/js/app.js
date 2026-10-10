const userForm = document.getElementById("userForm");
const userList = document.getElementById("userList");
const messageRegion = document.getElementById("msg");
const userCount = document.getElementById("userCount");
const saveButton = document.getElementById("saveButton");
const refreshButton = document.getElementById("refreshButton");
let messageTimeout;

function showMessage(text, type = "success") {
	window.clearTimeout(messageTimeout);
	messageRegion.replaceChildren();

	const alert = document.createElement("div");
	alert.className = `alert alert-${type}`;
	alert.setAttribute("role", type === "danger" ? "alert" : "status");
	alert.textContent = text;
	messageRegion.append(alert);

	messageTimeout = window.setTimeout(() => messageRegion.replaceChildren(), 3500);
}

async function requestJson(url, options) {
	const response = await fetch(url, options);
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || "The request could not be completed.");
	}

	return data;
}

function renderEmptyState(text) {
	const emptyState = document.createElement("p");
	emptyState.className = "list-state";
	emptyState.textContent = text;
	userList.replaceChildren(emptyState);
}

function createUserRow(user) {
	const row = document.createElement("article");
	row.className = "user-row";

	const details = document.createElement("div");
	details.className = "user-details";

	const name = document.createElement("div");
	name.className = "user-name";
	name.textContent = user.name;

	const meta = document.createElement("div");
	meta.className = "user-meta";
	meta.append(document.createTextNode(user.email));

	if (user.age !== null && user.age !== undefined) {
		const age = document.createElement("span");
		age.className = "user-age";
		age.textContent = `Age ${user.age}`;
		meta.append(age);
	}

	details.append(name, meta);

	const deleteButton = document.createElement("button");
	deleteButton.className = "btn btn-delete";
	deleteButton.type = "button";
	deleteButton.textContent = "Delete";
	deleteButton.setAttribute("aria-label", `Delete ${user.name}`);
	deleteButton.addEventListener("click", () => deleteUser(user._id));

	row.append(details, deleteButton);
	return row;
}

async function loadUsers() {
	userList.setAttribute("aria-busy", "true");

	try {
		const users = await requestJson("/api/users");
		userCount.textContent = `${users.length} ${users.length === 1 ? "user" : "users"}`;

		if (users.length === 0) {
			renderEmptyState("No users yet. Add a record to get started.");
			return;
		}

		userList.replaceChildren(...users.map(createUserRow));
	} catch (error) {
		userCount.textContent = "Unavailable";
		renderEmptyState(error.message || "Unable to load users.");
	} finally {
		userList.removeAttribute("aria-busy");
	}
}

async function deleteUser(id) {
	try {
		const result = await requestJson(`/api/users/${encodeURIComponent(id)}`, {
			method: "DELETE",
		});
		showMessage(result.message, "warning");
		await loadUsers();
	} catch (error) {
		showMessage(error.message, "danger");
	}
}

userForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	saveButton.disabled = true;

	const payload = Object.fromEntries(new FormData(userForm).entries());
	if (payload.age === "") {
		delete payload.age;
	} else if (payload.age !== undefined) {
		payload.age = Number(payload.age);
	}

	try {
		await requestJson("/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		userForm.reset();
		showMessage("User saved.");
		await loadUsers();
	} catch (error) {
		showMessage(error.message || "Failed to save user.", "danger");
	} finally {
		saveButton.disabled = false;
	}
});

refreshButton.addEventListener("click", loadUsers);
loadUsers();
