"use strict";

// CONSTANTS & VARIABLES
const currentUser = sessionStorage.getItem("user")
	? JSON.parse(sessionStorage.user)
	: null;

if (currentUser) {
	currentUser.role === "admin"
		? fetchData()
		: window.location.assign("/notfound.html");
} else {
	const history = window.location.href;
	sessionStorage.setItem("history", history);
	window.location.assign("/login.html");
}

// DOM
const noreview = document.getElementById("noreview");
const tableBody = document.getElementById("table-body");

// FUNCTIONS
async function deleteUser(id) {
	const beUrl = `${BE_URL}/api/v1/review/${id}`;
	try {
		fetch(beUrl, {
			method: "DELETE",
			headers: {
				Accept: "application/json",
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "OK") {
					UIkit.notification({
						message: `<span uk-icon='icon: check'></span>${res.msg}`,
						status: "success",
						pos: "bottom-right",
						timeout: 2000,
					});
					setTimeout(() => location.reload(), 2000);
				} else {
					UIkit.notification({
						message: `<span>${svgIcon.triangleExclamation}</span> Request failed…`,
						status: "danger",
						pos: "bottom-right",
						timeout: 2000,
					});
				}
			});
	} catch (error) {
		console.error(error);
	}
}

function handleDelete(id) {
	UIkit.modal.confirm("Confirm to delete review?").then(
		() => deleteUser(id),
		() => {}
	);
}

function appendData(db) {
	const dd = new Date(db.createdOn).toDateString().split(" ");
	const dateDisplay = `${dd[2]}-${dd[1]}-${dd[3]}`;

	const mainTr = document.createElement("tr");
	let td;

	td = document.createElement("td");
	td.innerHTML = `${db.username}`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.innerHTML = `${db.email}`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.classList.add("uk-table-expand");
	td.innerHTML = `${db.role}`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.classList.add("uk-table-expand");
	td.innerHTML = dateDisplay;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.innerHTML = `<div class="uk-inline">
  <a href="/user-profile.html?action=view&userId=${db.userId}" class="uk-margin-small-right" uk-icon="eye"></a>
    <a href="/user-profile.html?action=edit&userId=${db.userId}" class="uk-margin-small-right" uk-icon="pencil"></a>
      </div>`;
	mainTr.appendChild(td);

	tableBody.appendChild(mainTr);
}

function loadData(list) {
	list.map((item) => appendData(item));
}

async function fetchData() {
	const beUrl = `${BE_URL}/api/v1/user`;
	try {
		fetch(beUrl, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "OK") {
					if (res.data && res.data.length > 0) {
						loadData(res.data);
					} else {
						noreview.innerHTML = "No data";
					}
				} else {
					UIkit.notification({
						message: `<span>${svgIcon.triangleExclamation}</span> Request failed…`,
						status: "danger",
						pos: "bottom-right",
						timeout: 2000,
					});
				}
			});
	} catch (error) {
		console.error(error);
	}
}
