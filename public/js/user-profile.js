"use strict";

// VARIABLES
const currentUser = localStorage.getItem("user")
	? JSON.parse(localStorage.user)
	: null;

const pageStatus = {};
const currentParams = new URLSearchParams(window.location.search);
const beUrl = `${BE_URL}/api/v1/user`;
const noPhotoUrl =
	"https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

let userDetails = [
	{ id: "username", hasChanged: false },
	{ id: "email", hasChanged: false },
	{ id: "password", hasChanged: false },
	{ id: "profilePhoto", hasChanged: false },
];

// if is not loggedin, direct to login page
if (
	localStorage.getItem("user") == null ||
	localStorage.getItem("user") == undefined
) {
	const history = window.location.href;
	localStorage.setItem("history", history);
	window.location.assign("/login.html");
}

// get userId if exist eg: '/user-profile.html?userId=5'
for (const [key, value] of currentParams.entries()) {
	pageStatus[key] = value;
}

// show search userId for admin else default current user
// (Object.keys(pageStatus).length)
if (currentUser.role === "admin" && pageStatus.userId) {
	getUserProfile(pageStatus.userId);
} else {
	getUserProfile(currentUser.userId);
}

// DOM
const userProfileForm = document.getElementById("user-profile-form");
const inputs = document.querySelectorAll("input");
const submitBtn = document.getElementById("submitBtn");
const profilePhotoImg = document.getElementById("profilePhotoImg");
const roleInput = document.getElementById("role");

// FUNCTIONS

async function getUserProfile(id) {
	let beUrl = `${BE_URL}/api/v1/user/${id}`;
	try {
		fetch(beUrl, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "OK") {
					loadUserProfile(res.data);
					Object.assign(currentUser, res.data);
				} else {
					window.location.assign("/nodata.html");
				}
			});
	} catch (error) {
		console.error(error);
	}
}

async function updateUserProfile(id, payload) {
	try {
		fetch(beUrl + "/" + id, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify(payload),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status !== "OK") {
					UIkit.notification({
						message: `<span uk-icon='icon: check'></span>${
							res.msg.message ?? res.msg
						}`,
						status: "danger",
						pos: "bottom-right",
						timeout: 2000,
					});
				} else {
					UIkit.notification({
						message: "<span uk-icon='icon: check'></span>User profile updated",
						status: "success",
						pos: "bottom-right",
						timeout: 2000,
					});
					getUserProfile(id);
				}
			});
	} catch (error) {}
}

function loadUserProfile(db) {
	// reset userDetail value and hasChanges state and reset btn default state disabled on
	userDetails = [
		{ id: "username", hasChanged: false },
		{ id: "email", hasChanged: false },
		{ id: "password", hasChanged: false },
		{ id: "profilePhoto", hasChanged: false },
	];
	submitBtn.disabled = true;

	if (currentUser.role === "admin") {
		userDetails.push({ id: "role", hasChanged: false });
		const hiddenRow = document.getElementById("hiddenRow");
		hiddenRow.classList.remove("displayNone");
	}

	// set readOnly if current search action is view else default will be editable
	// eg '/user-profile.html?action=view&userId=5'
	const isDisabled = pageStatus.action === "view";

	// loop thru res.data to update dom and set origin value in form fields
	for (const obj of userDetails) {
		obj.value = db[obj.id];
		const inputEl = document.getElementById([obj.id]);
		inputEl.value = db[obj.id];
		inputEl.disabled = isDisabled;
	}

	profilePhotoImg.src = db.profilePhoto ?? noPhotoUrl;
	isDisabled && submitBtn.classList.add("displayNone");
}

// handle origin and new values update to hasChanged status
const formFieldUpdated = (inputId, newValue) => {
	const i = userDetails.findIndex((field) => field.id == inputId);
	const currVal = userDetails[i].value;
	userDetails[i].newValue = currVal === newValue ? undefined : newValue;
	userDetails[i].hasChanged = currVal === newValue ? false : true;

	if (inputId == "profilePhoto") {
		profilePhotoImg.src = newValue ?? currVal ?? noPhotoUrl;
	}
};

// EVENT LISTENER

// handle submit button
submitBtn.addEventListener("click", () => {
	const updatingUserId = pageStatus.userId ?? currentUser.userId;
	const payload = {};
	userDetails.forEach((i) => {
		if (i.hasChanged) {
			payload[i.id] = i.newValue;
		}
	});
	updateUserProfile(updatingUserId, payload);
});

// handle origin and new values update to hasChanged status
inputs.forEach((input) => {
	input.addEventListener("change", (e) => {
		const newValue = e.target.value;
		const inputId = e.target.id;
		formFieldUpdated(inputId, newValue);
	});
});

roleInput.addEventListener("change", (e) => {
	const newValue = e.target.value;
	const inputId = e.target.id;
	formFieldUpdated(inputId, newValue);
});
// handle disabled submit button based on value changes
userProfileForm.addEventListener("change", () => {
	const fieldsChanges = userDetails.map((i) => i.hasChanged ?? false);
	if (fieldsChanges.includes(true)) {
		submitBtn.disabled = false;
		submitBtn.classList.remove("uk-button-default");
		submitBtn.classList.add("uk-button-danger");
	} else {
		submitBtn.disabled = true;
		submitBtn.classList.remove("uk-button-danger");
		submitBtn.classList.add("uk-button-default");
	}
});
