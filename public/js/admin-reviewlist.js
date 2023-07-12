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
const nodata = document.getElementById("nodata");
const tableBody = document.getElementById("table-body");

// FUNCTIONS
async function deleteReview(id) {
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
		() => deleteReview(id),
		() => {}
	);
}

function appendData(db) {
	const dd = new Date(db.createdOn).toDateString().split(" ");
	const dateDisplay = `${dd[2]}-${dd[1]}-${dd[3]}`;

	const mainTr = document.createElement("tr");
	let td;

	td = document.createElement("td");
	td.innerHTML = `${db.name}`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.innerHTML = `${db.title}`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.classList.add("uk-table-expand");
	td.innerHTML = `<div class="uk-inline">
	<span class="uk-text-middle">${db.rating}</span>
	${getStarRating(+db.rating)}
	</div>`;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.classList.add("uk-table-expand");
	td.innerHTML = db.username;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.classList.add("uk-table-expand");
	td.innerHTML = dateDisplay;
	mainTr.appendChild(td);

	td = document.createElement("td");
	td.classList.add("uk-text-nowrap");
	td.innerHTML = `<div class="uk-inline">
 <a href="/user-review.html?reviewId=${db.reviewId}&action=view" class="uk-margin-small-right" uk-icon="eye"></a>
 <a onclick="handleDelete(${db.reviewId})" class="uk-margin-small-right" uk-icon="trash"></a>
 </div>`;

	mainTr.appendChild(td);
	tableBody.appendChild(mainTr);
}

function loadData(list) {
	list.map((item) => appendData(item));
}

async function fetchData() {
	const beUrl = `${BE_URL}/api/v1/review`;
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
