"use strict";

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
const nodata = document.getElementById("nodata");
const tableBody = document.getElementById("table-body");

// FUNCTIONS
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
						nodata.innerHTML = "No data";
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
