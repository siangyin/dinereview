"use strict";

window.addEventListener("DOMContentLoaded", () => {
	// for (const item of allFields) {
	// 	item.name === "photos" ? appendPhotosInput() : appendFormItem(item);
	// }
});

// CONSTANTS & VARIABLES
const pageStatus = {
	loading: false,
	action: "new",
};
// {loading: false, action: 'new', id: '1'}

let currentParams = new URLSearchParams(window.location.search);
// eg: action=new&id=1

for (const [key, value] of currentParams.entries()) {
	pageStatus[key] = value;
}

const allFields = [
	{
		label: "Restaurant Name",
		name: "name",
		input: "input",
		type: "text",
		placeholder: "Restaurant Name",
		required: true,
	},
	{
		name: "description",
		input: "textarea",
		type: "text",
		required: false,
	},
	{
		name: "website",
		input: "input",
		type: "text",
		required: false,
	},
	{
		name: "contact",
		input: "input",
		type: "text",
		required: false,
	},
	{
		name: "add1",
		input: "input",
		type: "text",
		label: "Address",
		placeholder: "Address",
		required: true,
	},
	{
		name: "add2",
		input: "input",
		type: "text",
		label: "Address 2",
		placeholder: "Address 2",
		required: false,
	},
	{
		name: "add3",
		input: "input",
		type: "text",
		label: "Address 3",
		placeholder: "Address 3",
		required: false,
	},
	{
		name: "city",
		input: "input",
		type: "text",
		required: false,
	},
	{
		name: "country",
		input: "input",
		type: "text",
		required: false,
	},
	{
		name: "postalCode",
		label: "Postal Code",
		input: "input",
		type: "number",
		placeholder: "Postal Code",
		required: false,
	},
	{
		name: "area",
		input: "input",
		type: "text",
		required: false,
	},
	{
		name: "type",
		input: "input",
		type: "text",
		placeholder: "Establishment types, each value to divide with comma ','",
		required: true,
	},
	{
		name: "cuisine",
		input: "input",
		type: "text",
		placeholder: "Cuisines type, each value to divide with comma ','",
		required: true,
	},
	{
		name: "openHrs",
		label: "Opening Hours",
		input: "input",
		type: "text",
		placeholder: "Eg: Daily 09:00 AM - 10:00 PM; PH 10:00 AM - 11:00 PM",
		required: true,
	},
	{
		name: "primaryPhoto",
		label: "Primary photo",
		input: "input",
		type: "text",
		placeholder: "Please input image address url",
		required: false,
	},
	{
		name: "photos",
		input: "input",
		type: "text",
		placeholder: "Please input image address url",
		required: false,
	},
];

if (pageStatus.action == "edit" && pageStatus.id) {
	getRestaurant(pageStatus.id);
}
// DOM
const restaurantForm = document.getElementById("restaurantForm");
const submitBtn = document.getElementById("submitBtn");
const alertMsg = document.getElementById("alertMsg");
const inputList = document.querySelectorAll("input");

// FUNCTIONS
function appendPhotosInput() {
	const photosInputList = document.querySelectorAll(".photosInput");
	const tmp = document.createElement("div");
	let newFormItem = `
    <label 
    class="uk-width-1-4 uk-margin-auto-vertical"
    for="photos${photosInputList.length + 1}">Additional Photos</label>
    <div class="uk-width-3-4 uk-inline uk-padding-remove">
    
    <input class="uk-input uk-padding-small photosInput" type="text"
    id="photos${photosInputList.length + 1}" 
    name="photos${photosInputList.length + 1}"
    placeholder="Please input image address url"/>

    <a class="uk-form-icon uk-form-icon-flip addPhotoBtn" onclick="appendPhotosInput()" uk-icon="plus-circle" uk-tooltip="title: additional photo; pos: top-center"></a>
    </div>
  `;
	tmp.innerHTML = newFormItem;
	restaurantForm.append(...tmp.childNodes);
}

function updateExistingPhotosInput(photos) {
	const main = photos.filter((item) => item.defaultPhoto);
	console.log(main);
	if (Boolean(main.length)) {
		const primaryPhoto = document.getElementById("primaryPhoto");
		main[0].photoUrl && primaryPhoto.setAttribute("value", main[0].photoUrl);
		main[0].photoId && primaryPhoto.setAttribute("photoId", main[0].photoId);
	}

	const photos1 = document.getElementById("photos1");
	const photosArr = photos.filter(
		(item) => !item.defaultPhoto && !item.reviewId
	);
	console.log(photosArr);
	if (Boolean(photosArr.length)) {
		photosArr.length > 0 &&
			photosArr.forEach((item, i) => {
				if (i === 0) {
					photos1.setAttribute("value", item.photoUrl);
					photos1.setAttribute("photoId", item.photoId);
				} else {
					// append the rest of the photos
					const tmp = document.createElement("div");
					let newFormItem = `
    <label 
    class="uk-width-1-4 uk-margin-auto-vertical"
    for="${item.photoId}">Additional Photos</label>
    <div class="uk-width-3-4 uk-inline uk-padding-remove">
    
    <input class="uk-input uk-padding-small photosInput" type="text"
    id="${item.photoId}" 
    name="${item.photoId}"
    photoId="${item.photoId}"
    value="${item.photoUrl}"/>

    <a class="uk-form-icon uk-form-icon-flip addPhotoBtn" onclick="appendPhotosInput()" uk-icon="plus-circle" uk-tooltip="title: additional photo; pos: top-center"></a>
    </div>
  `;
					tmp.innerHTML = newFormItem;
					restaurantForm.append(...tmp.childNodes);
				}
			});
	}
}

function updateExistingFormValue(data) {
	for (const item of allFields) {
		if (item.name !== "photos" && item.name !== "primaryPhoto") {
			document.getElementById(`${item.name}`).value =
				data.restaurant[item.name];
		}
	}
}

function removeAllInput() {
	restaurantForm.reset();
	inputList.forEach((item) => {
		item.value = "";
	});
}
async function getRestaurant(id) {
	pageStatus.loading = true;
	let url = `${BE_URL}/api/v1/restaurant/${id}`;
	try {
		fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "OK") {
					Object.assign(pageStatus, {
						loading: false,
						data: res.data,
					});
					updateExistingFormValue(res.data);
					document.getElementById(
						"pageTitle"
					).innerHTML = `Edit Restaurant: ${res.data.restaurant.name}`;
					Boolean(res.data.photos.length) &&
						updateExistingPhotosInput(res.data.photos);
				}
			});
	} catch (error) {
		console.log(error);
	}
}

async function postRestaurant(payload) {
	let url = `${BE_URL}/api/v1/restaurant`;
	let method = "POST";
	if (pageStatus.action === "edit" && pageStatus.id) {
		method = "PATCH";
		url += `/${pageStatus.id}`;
	}
	try {
		fetch(url, {
			method: method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify(payload),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status !== "OK") {
					addAlertMsg(alertMsg, res.msg.message ?? res.msg);
				} else {
					removeAllChildsElement(alertMsg);
					addAlertMsg(alertMsg, res.msg, "success");
					removeAllInput();
					// window.location.assign("/index.html");
				}
			});
	} catch (error) {
		console.log(error);
	}
}

// EVENT LISTENER

submitBtn.addEventListener("click", (e) => {
	const photosInputList = document.querySelectorAll(".photosInput");
	// check values
	let missingField = [];
	const formValues = {};
	for (const item of allFields) {
		if (item.name !== "photos" && item.name !== "primaryPhoto") {
			const itemVal = document.getElementById(`${item.name}`).value;
			if (itemVal) {
				formValues[item.name] = itemVal.trim();
			} else {
				item.required &&
					missingField.push(item.label ?? capitalised(item.name));
			}
		}
	}

	const primaryPhoto = document.getElementById("primaryPhoto");
	const photosArr = [];
	let tempPhoto = {};
	if (primaryPhoto.value) {
		tempPhoto = { photoUrl: primaryPhoto.value.trim(), defaultPhoto: true };
		primaryPhoto.hasAttribute("photoid") &&
			Object.assign(tempPhoto, {
				photoId: primaryPhoto.getAttribute("photoid"),
			});

		photosArr.push(tempPhoto);
	}

	photosInputList.length > 0 &&
		photosInputList.forEach((item) => {
			console.log(item);
			tempPhoto = {};
			if (item.value) {
				tempPhoto = { photoUrl: item.value.trim() };
				item.hasAttribute("photoid") &&
					Object.assign(tempPhoto, {
						photoId: item.getAttribute("photoid"),
					});

				photosArr.push(tempPhoto);
			}
		});
	console.log(photosArr);
	if (missingField.length == 0) {
		const payload = {
			restaurant: { ...formValues },
			photos: photosArr,
		};
		postRestaurant(payload);
	} else {
		const msg =
			`Please enter missing ${
				missingField.length > 1 ? "fields:" : "field:"
			} ` + missingField.toString().replaceAll(",", ", ");
		addAlertMsg(alertMsg, msg);
	}
});
