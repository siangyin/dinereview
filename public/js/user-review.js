"use strict";

// CONSTANTS & VARIABLES
const pageStatus = {
	action: "new",
};
const currentParams = new URLSearchParams(window.location.search);

for (const [key, value] of currentParams.entries()) {
	pageStatus[key] = value;
	if (key === "reviewId") {
		pageStatus.action = "view";
		getReview(pageStatus.reviewId);
	}
}

let formFields = [
	{ id: "title", hasChanged: false, required: true },
	{ id: "content", hasChanged: false, required: true },
	{ id: "rating", hasChanged: false, required: true },
	{ id: "photos1", hasChanged: false },
];

const photoList = {};
// const loadingImg =
// 	"https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif?20151024034921";

if (sessionStorage.getItem("review")) {
	Object.assign(pageStatus, JSON.parse(sessionStorage.review));
	document.getElementById("restaurantName").value =
		pageStatus.restaurantName ?? "";
}

// to add review : {action: "new",restaurantId: "1",restaurantName": "Cut by Wolfgang Puck"}
// to edit review : {action:'edit',reviewId:'1'}
// to view review : {action:'view',reviewId:'1'}

const currentUser = sessionStorage.getItem("user")
	? JSON.parse(sessionStorage.user)
	: null;
// example currentUser obj: { userId: 1, username: "Michael J Mark", email: "aletha_hauc4@gmail.com", role: "user" }
// example pageStatus obj: {action: "new",restaurantId: "1",restaurantName: "Cut by Wolfgang Puck"}

if (currentUser) {
	//
} else {
	const history = window.location.href;
	sessionStorage.setItem("history", history);
	window.location.assign("/login.html");
}

// DOM
const mainForm = document.getElementById("form");
const imgSliderList = document.querySelector(".uk-slideshow-items");
const submitBtn = document.getElementById("submitBtn");

// FUNCTIONS
function appendPhotosInput(db, readOnly) {
	const photosInputList = document.querySelectorAll(".photosInput");
	const divInput = document.createElement("div");
	const divImg = document.createElement("div");

	const index = photosInputList.length + 1;
	const id = `photos${photosInputList.length + 1}`;
	let value = db?.value ?? "";
	let photoId = db?.photoId ?? null;
	let src = db?.value ?? "images/no-photo.png";

	formFields.push({
		id: id,
		hasChanged: false,
	});

	divInput.innerHTML = `
<div class="uk-grid-row-collapse uk-grid-column-collapse uk-margin-small-bottom" uk-grid>
  <label class="uk-width-1-3@s uk-margin-auto-vertical uk-text-capitalize" 
  for="${id}">
  Photo ${index}</label>
  <div class="uk-width-2-3@s uk-inline">
    <input class="uk-input uk-padding-small photosInput" type="text" 
    placeholder="Please input image address url" ${
			readOnly && `readOnly="true"`
		}
    id="${id}" name="${id}" photoIdx="${index}" value="${value}" 
		${photoId && `photoId="${photoId}"`} />
    <a class="uk-form-icon uk-form-icon-flip addPhotoBtn" uk-icon="plus-circle" uk-tooltip="title: additional photo; pos: top-center" onclick="appendPhotosInput()"></a>
  </div>
</div>
  `;
	divImg.innerHTML = `	<li>
										<img src=${src} class="reviewPhoto" 
                    id="${id}-img" />
										<div class="uk-position-bottom-center uk-panel">
											<h1>${index}</h1>
										</div>
									</li>`;

	mainForm.append(...divInput.childNodes);
	imgSliderList.append(...divImg.childNodes);
}

function updateFormFields(propId, newval) {
	const hasChanged = [];
	const updated = [];
	const incompleteFields = [];
	for (let item of formFields) {
		if (item.id == propId) {
			item.newValue = newval;
			if (item.value && item.value == newval) {
				item.hasChanged = false;
			} else {
				item.hasChanged = true;
				!hasChanged.includes(item.id) && hasChanged.push(item.id);
			}
		}

		updated.push(item);
		const isIncomplete =
			item.required && !item.hasChanged && !incompleteFields.includes(propId);
		isIncomplete && incompleteFields.push(item.id);
	}

	let btnDisabled = Boolean(!incompleteFields.length);
	if (pageStatus.editable) {
		btnDisabled = Boolean(hasChanged.length);
	}
	console.log(btnDisabled);
	toggleSubmitBtn("submitBtn", btnDisabled);

	Object.assign(formFields, updated);
}

function showExistingReview(db) {
	document.getElementById("restaurantName").value = db.name;
	pageStatus.restaurantId = db.restaurantId;

	let tempArr = ["title", "content", "rating"];
	formFields.forEach((item) => {
		if (db[item.id] && tempArr.includes(item.id)) {
			item.value = db[item.id];
			const currInput = document.getElementById(item.id);
			currInput.value = db[item.id];
			if (!pageStatus.editable) {
				currInput.readOnly = true;
			}
		}

		return item;
	});

	const photos1 = formFields.findIndex((item) => item.id === "photos1");
	if (db.photos.length > 0) {
		// update first photo img src and input value
		formFields[photos1].value = db.photos[0].photoUrl;
		formFields[photos1].photoId = db.photos[0].photoId;

		const photos1Input = document.getElementById("photos1");
		photos1Input.value = db.photos[0].photoUrl;
		photos1Input.setAttribute("photoId", db.photos[0].photoId);
		if (!pageStatus.editable) {
			photos1Input.readOnly = true;
		}
		// update photo slider
		const imgId = `photos1-img`;
		const updateImg = document.getElementById(imgId);
		updateImg.src = db.photos[0].photoUrl;

		for (const i in db.photos) {
			if (i != 0) {
				const tmp = {
					id: `photos${i + 1}`,
					value: db.photos[i].photoUrl,
					photoId: db.photos[i].photoId,
				};
				let readOnly = !pageStatus?.editable;
				appendPhotosInput(tmp, readOnly);
			}
		}
	}

	if (!pageStatus.editable) {
		submitBtn.style.visibility = "hidden";
	} else {
		submitBtn.style.visibility = "visible";
	}
}

console.log(pageStatus);
async function saveReview(payload, action) {
	const method = action == "edit" ? "PATCH" : "POST";
	const msg = {
		new: "Review added successfuly",
		edit: "Review updated successfuly",
	};
	let reviewId = pageStatus.reviewId ?? undefined;
	let beUrl = `${BE_URL}/api/v1/review`;
	sessionStorage.removeItem("review");
	try {
		fetch(beUrl, {
			method: method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify(payload),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "OK") {
					reviewId = res.reviewId;
					UIkit.modal.alert(msg[action]).then(function () {
						window.location.assign(
							`/user-review.html?reviewId=${reviewId}&action=view`
						);
					});
				} else {
					UIkit.notification({
						message: `<span uk-icon='icon: check'></span>${
							res.msg.message ?? res.msg
						}`,
						status: "danger",
						pos: "bottom-right",
						timeout: 2000,
					});
				}
			});
	} catch (error) {}
}

async function getReview(reviewId) {
	let beUrl = `${BE_URL}/api/v1/review?reviewId=${reviewId}`;
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
					pageStatus.data = res.data[0];
					pageStatus.editable =
						res.data[0].userId == currentUser.userId ||
						currentUser.role == "admin"
							? true
							: false;
					showExistingReview(res.data[0]);
				} else {
					UIkit.notification({
						message: `<span uk-icon='icon: check'></span>${
							res.msg.message ?? res.msg
						}`,
						status: "danger",
						pos: "bottom-right",
						timeout: 2000,
					});
				}
			});
	} catch (error) {}
}

// EVENT LISTENER
mainForm.addEventListener("change", (e) => {
	const id = e.target.id;
	const value = e.target.value;

	console.log(e.target);
	if (e.target.classList.contains("photosInput")) {
		// update photo slider
		const imgId = `${id}-img`;
		const updateImg = document.getElementById(imgId);
		updateImg.src = value;
	}

	updateFormFields(id, value);
});

submitBtn.addEventListener("click", () => {
	const action = pageStatus.reviewId ? "edit" : "new";
	const reviewObj = {
		restaurantId: pageStatus.restaurantId,
		userId: currentUser.userId,
		reviewId: pageStatus.reviewId ?? undefined,
	};

	// get title content and rating value
	let tempArr = ["title", "content", "rating"];
	formFields.forEach((item) => {
		if (
			(item.hasChanged || pageStatus.editable) &&
			tempArr.includes(item.id) &&
			(item.newValue ?? item.value)
		) {
			reviewObj[item.id] = item.newValue ?? item.value;
		}
	});

	tempArr = [];
	const photosInputList = document.querySelectorAll(".photosInput");
	photosInputList.length > 0 &&
		photosInputList.forEach((item) => {
			let tempPhoto = {};

			if (Boolean(item.value)) {
				tempPhoto.photoUrl = item.value.trim();
				item.hasAttribute("photoid") &&
					Object.assign(tempPhoto, {
						photoId: item.getAttribute("photoid"),
					});

				tempArr.push(tempPhoto);
			}
		});

	const payload = {
		...reviewObj,
		photos: tempArr,
	};

	saveReview(payload, action);
});
