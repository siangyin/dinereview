"use strict";

// CONSTANTS & VARIABLES
const currentUser = sessionStorage.getItem("user")
	? JSON.parse(sessionStorage.user)
	: null;

if (currentUser) {
	getFavList(currentUser.userId);
} else {
	const history = window.location.href;
	sessionStorage.setItem("history", history);
	window.location.assign("/login.html");
}

// DOM
const noreview = document.getElementById("noreview");
const tableBody = document.getElementById("table-body");

// FUNCTIONS
async function deleteFav(id) {
	const beUrl = `${BE_URL}/api/v1/restaurant/fav?userId=${currentUser.userId}&restaurantId=${id}`;
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

function handleUnsave(id) {
	UIkit.modal.confirm("Confirm to remove restaurant from favourite?").then(
		() => deleteFav(id),
		() => {}
	);
}

function appendData(db) {
	const dd = new Date(db.addedOn).toDateString().split(" ");
	const dateDisplay = `${dd[2]}-${dd[1]}-${dd[3]}`;

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
	td.innerHTML = `<div class="uk-inline">
        <span class="uk-text-middle">${db.avgRating ?? 0}</span>
					${getStarRating(+db.avgRating)}
      </div>`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.classList.add("uk-table-expand");
	td.innerHTML = dateDisplay;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.innerHTML = `<div class="uk-inline">
  <a href="/restaurant.html?restaurantId=${db.restaurantId}" class="uk-margin-small-right" uk-icon="eye"></a>
  <a onclick="handleUnsave(${db.restaurantId})" class="uk-margin-small-right" uk-icon="trash"></a>
      </div>`;
	mainTr.appendChild(td);

	tableBody.appendChild(mainTr);
}

function loadData(list) {
	list.map((item) => appendData(item));
}

async function getFavList(userId) {
	const beUrl = `${BE_URL}/api/v1/restaurant/fav?userId=${userId}`;
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
