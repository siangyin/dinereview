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
async function deleteRestaurant(id) {
	const beUrl = `${BE_URL}/api/v1/restaurant/${id}`;
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
	UIkit.modal.confirm("Confirm to delete restaurant?").then(
		() => deleteRestaurant(id),
		() => {}
	);
}

function appendData(db) {
	const mainTr = document.createElement("tr");
	let td;

	td = document.createElement("td");
	td.innerHTML = `${db.name}`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.innerHTML = `${db.type}, ${db.cuisine}`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.classList.add("uk-table-expand");
	td.innerHTML = db.area;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.classList.add("uk-table-expand");
	td.innerHTML = `<div class="uk-inline">
  <span class="uk-text-middle">${db.avgRating ?? 0}</span>
  ${getStarRating(+db.avgRating)}
  </div>`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.innerHTML = `<div class="uk-inline">
    <a href="/admin-restaurant.html?action=edit&restaurantId=${db.restaurantId}" class="uk-margin-small-right" uk-icon="pencil"></a>
    <a onclick="handleDelete(${db.restaurantId})" class="uk-margin-small-right" uk-icon="trash"></a>
      </div>`;

	mainTr.appendChild(td);
	tableBody.appendChild(mainTr);
}

function loadData(list) {
	list.map((item) => appendData(item));
}

async function fetchData() {
	const beUrl = `${BE_URL}/api/v1/restaurant`;
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
