"use strict";

// CONSTANTS & VARIABLES
const currentUser = localStorage.getItem("user")
	? JSON.parse(localStorage.user)
	: null;

const pageStatus = {};

const currentParams = new URLSearchParams(window.location.search);
// eg: restaurantId=1

// DOM
const saveBtnTxt = document.getElementById("saveBtnTxt");
const saveBtn = document.getElementById("saveBtn");
const reviewBtn = document.getElementById("reviewBtn");

for (const [key, value] of currentParams.entries()) {
	pageStatus[key] = value;
	if (key === "restaurantId") {
		getRestaurant(value);
	}
}

if (currentUser) {
	checkFavStatus(currentUser.userId, pageStatus.restaurantId);
	getUserReview(currentUser.userId, pageStatus.restaurantId);
}

// FUNCTIONS
function toggleSave(saved) {
	if (saved) {
		saveBtnTxt.innerHTML = " Saved";
		saveBtnTxt.setAttribute("value", "saved");
	} else {
		saveBtnTxt.removeAttribute("value");
		saveBtnTxt.innerHTML = " Save";
	}
}

async function getRestaurant(id) {
	const loadingSpinner = document.getElementById("loadingSpinner");
	const restaurantContent = document.getElementById("restaurantContent");
	let beUrl = `${BE_URL}/api/v1/restaurant/${id}`;
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
					loadRestaurantDetail(res.data);
					pageStatus.data = res.data;
					checkScreenHeight();
				} else {
					window.location.assign("/notfound.html");
				}
			});
	} catch (error) {
		console.error(error);
	}
	loadingSpinner.classList.add("displayNone");
	restaurantContent.classList.remove("displayNone");
}

async function checkFavStatus(userId, restaurantId) {
	let beUrl = `${BE_URL}/api/v1/restaurant/fav?userId=${userId}&restaurantId=${restaurantId}`;
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
					pageStatus.isSaved = res.isSaved;
					toggleSave(res.isSaved);
				}
			});
	} catch (error) {}
}

async function saveFav(userId, restaurantId) {
	let beUrl = `${BE_URL}/api/v1/restaurant/fav`;
	const payload = { userId: userId, restaurantId: restaurantId };
	try {
		fetch(beUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "OK") {
					toggleSave(true);
					UIkit.notification({
						message: `<span>${svgIcon.circleChecked}</span> Favourite restaurant saved…`,
						status: "success",
						pos: "bottom-right",
						timeout: 2000,
					});
				} else {
					UIkit.notification({
						message: `<span>${svgIcon.triangleExclamation}</span> Request failed…`,
						status: "danger",
						pos: "bottom-right",
						timeout: 2000,
					});
				}
			});
	} catch (error) {}
}

async function removeFav(userId, restaurantId) {
	let beUrl = `${BE_URL}/api/v1/restaurant/fav?userId=${userId}&restaurantId=${restaurantId}`;
	const saveBtnTxt = document.getElementById("saveBtnTxt");
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
					toggleSave(false);
					UIkit.notification({
						message: `<span>${svgIcon.circleChecked}</span> Restaurant removed from favourite…`,
						status: "success",
						pos: "bottom-right",
						timeout: 200000,
					});
				} else {
					UIkit.notification({
						message: `<span>${svgIcon.triangleExclamation}</span> Request failed…`,
						status: "danger",
						pos: "bottom-right",
						timeout: 2000,
					});
				}
			});
	} catch (error) {}
}

async function getUserReview(userId, restaurantId) {
	let beUrl = `${BE_URL}/api/v1/review?userId=${userId}&restaurantId=${restaurantId}`;
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
					pageStatus.isReviewed = Boolean(res.data);
				}
			});
	} catch (error) {}
}

function appendTopHeader(avgRating, totalReviews) {
	const topHeader = document.getElementById("subheader-top");
	const newDiv = document.createElement("div");
	let temp = `<span class="uk-text-middle uk-text-emphasis uk-text-lead" >${
		avgRating ?? 0
	}</span>
		<span class="uk-text-lead">${getStarRating(avgRating ?? 0)}</span>
		<span class="uk-divider-vertical uk-margin-small-left"></span>
		<span class="uk-margin-small-left uk-text-middle uk-text-emphasis uk-text-lead" >${totalReviews}${
		totalReviews > 1 ? " Reviews" : " Review"
	}</span>`;

	newDiv.innerHTML = temp;
	topHeader.append(...newDiv.childNodes);
}

function appendRestaurantInfo(db) {
	const restaurantInfo = document.getElementById("restaurant-info");
	const newDiv = document.createElement("div");
	let temp = ``;
	const info = [
		{
			name: "address",
		},
		{
			name: "area",
		},
		{
			name: "website",
		},
		{
			name: "contact",
		},
		{
			label: "Opening Hours",
			name: "openHrs",
		},
		{
			label: "Establishment Type",
			name: "type",
		},
		{
			name: "cuisine",
		},
	];

	const addArr = [];
	if (db.add1 || db.add2 || db.add3) {
		db.add1 && addArr.push(db.add1);
		db.add2 && addArr.push(db.add2);
		db.add3 && addArr.push(db.add3);
	}
	info[0].value = addArr.toString().replaceAll(",", ", ");

	for (const item of info) {
		// if has key info detail
		if (db[item.name]) {
			item.value = db[item.name];
		}
	}

	for (const item of info) {
		// if has value
		if (item.value) {
			temp += `<div class="uk-width-1-3">
			<strong>${item.label ?? capitalised(item.name)}</strong></div>
			<div class="uk-width-2-3">
			<div>${
				item.name === "website"
					? `<a class="uk-text-muted" href="${item.value}" target="_blank"><span uk-icon="icon: link"></span> website</a>`
					: item.value
			}</div>
			</div>`;
		}
	}

	newDiv.innerHTML = temp;
	restaurantInfo.append(...newDiv.childNodes);
}

function appendRestaurantDesc(info) {
	const restaurantDesc = document.getElementById("restaurant-description");

	if (Boolean(info)) {
		restaurantDesc.classList.add("uk-child-width-expand@s");
		restaurantDesc.classList.add("uk-margin-small-top");
		const newDiv = document.createElement("div");
		const temp = `<dl>
	<dt>Description</dt>
	<dd>${info}</dd>
	</dl>`;
		newDiv.innerHTML = temp;
		restaurantDesc.append(...newDiv.childNodes);
	} else {
		restaurantDesc.classList.add("uk-margin-remove-vertical");
	}
}

function appendReviews(arr) {
	const container = document.getElementById("users-review-list");
	const newDiv = document.createElement("div");
	const divider = `<hr class="uk-width-3-3 uk-margin-small uk-margin-medium-left" />`;
	let content = "";

	if (Boolean(arr.length)) {
		arr.forEach((item, i) => {
			let photoList = "";
			let photoElement;
			if (Boolean(item.photos)) {
				// loop thru each photo item
				item.photos.forEach((ph) => {
					photoList += `<li>
									<img
									class="user-review-photo"
										src="${ph.photoUrl}"
										photoId="${ph.photoId}"
										alt="review-photo"
									/>
								</li>`;
				});
				// add photos list
				photoElement = `<div class="uk-position-relative uk-visible-toggle uk-light uk-margin-small"
				tabindex="-1" uk-slider >
				<ul class="uk-slider-items uk-grid-small">${photoList}</ul>
				<a class="uk-position-center-left uk-position-small uk-hidden-hover"
				href="#" uk-slidenav-previous uk-slider-item="previous" ></a>
				<a class="uk-position-center-right uk-position-small uk-hidden-hover"
				href="#" uk-slidenav-next uk-slider-item="next" ></a>
			</div>`;
			}

			const dd = new Date(item.createdOn).toDateString().split(" ");
			let dateDisplay = `${dd[2]}-${dd[1]}-${dd[3]}`;

			const col1 = `
		<div class="uk-width-1-3@s uk-margin-small-top">
			<div class="uk-child-width-expand" uk-grid>
				<div class="uk-width-auto@m">
					<img class="uk-comment-avatar uk-border-circle"
						src="${item.profilePhoto}" width="80" height="80" alt="profile-photo" />
				</div>
				<div class="uk-width-expand uk-margin-small">
					<div class="uk-margin-remove">${item.username}</div>
					<div class="uk-comment-meta uk-subnav uk-subnav-divider uk-margin-remove-top" >
						<span>${dateDisplay}</span>
					</div>
				</div>
			</div>
		</div>`;

			const col2 = `
			<div class="uk-width-2-3@s uk-margin-small">
				<div class="uk-inline">
					<span class="uk-text-middle uk-text-emphasis">${item.rating}</span>
					${getStarRating(+item.rating)}
					<span class="uk-divider-vertical uk-margin-small-left"></span>
					<strong class="uk-margin-small-left uk-text-middle">${item.title ?? ""}</strong>
				</div>
				<div class="uk-comment-body">
					<p>${item.content}</p>
				</div>
				${photoElement !== "" && photoElement}
		</div>`;
			//if has next review add divider
			if (arr[i + 1]) {
				content += col1 + col2 + divider;
			} else {
				content += col1 + col2;
			}
		});

		newDiv.innerHTML = content;
		container.append(...newDiv.childNodes);
	}
}

function appendPhotos(db) {
	const allImg = db;
	const mainPic = document.getElementById("main-restaurant-photos-img");
	const modal = document.getElementById("photos-modal-body");
	document.getElementById(
		"viewAllPhotosTxt"
	).innerHTML = `	View all(${allImg.length})`;

	const newDiv = document.createElement("div");
	let content = "";

	if (Boolean(allImg.length)) {
		allImg.forEach((i) => {
			if (i.defaultPhoto) {
				mainPic.src = i.photoUrl;
				mainPic.setAttribute("photoId", i.photoId);
			}

			content += `<div><img
							class="modal-restaurant-photos-img uk-flex uk-flex-center uk-flex-middle "
							src=${i.photoUrl}
							photoId=${i.photoId}
							alt="main-restaurant-photo"
						/></div>`;
		});
	}
	newDiv.innerHTML = content;
	modal.append(...newDiv.childNodes);
}

function loadRestaurantDetail(db) {
	document.title = `${db.restaurant.name}`;
	document.getElementById("pageTitle").innerHTML = `${db.restaurant.name}`;

	appendTopHeader(db.avgRating, db.totalReviews);
	// combine type and cuisine
	document.getElementById("tags").innerHTML = `${
		db.restaurant.type + ", " + db.restaurant.cuisine
	}`;

	// update restaurant info
	appendRestaurantInfo(db.restaurant);
	appendRestaurantDesc(db.restaurant.description);
	document.getElementById(
		"subheader-bottom"
	).innerHTML = `Reviews (${db.reviews.length})`;
	appendReviews(db.reviews);

	// append photos
	appendPhotos(db.photos);
}

// EVENT LISTENERS
saveBtn.addEventListener("mouseover", () => {
	const oriStatus = saveBtnTxt.getAttribute("value");
	// If has attribute value, mean the user has saved this restaurant
	// on hover change inner text to unsave
	if (oriStatus) {
		saveBtnTxt.innerHTML = " UNSAVE";
	}
});

saveBtn.addEventListener("mouseleave", () => {
	const oriStatus = saveBtnTxt.getAttribute("value");
	// If has attribute value, mean the user has saved this restaurant
	// when mouse leave return the text to origin state as saved
	if (oriStatus) {
		saveBtnTxt.innerHTML = " SAVED";
	}
});

saveBtn.addEventListener("click", () => {
	if (currentUser && currentUser.userId) {
		// If has attribute value, mean the user has saved this restaurant
		const oriStatus = saveBtnTxt.getAttribute("value");
		if (oriStatus) {
			// handle unsave
			removeFav(currentUser.userId, pageStatus.restaurantId);
		} else {
			// handle save
			saveFav(currentUser.userId, pageStatus.restaurantId);
		}
	} else {
		const history = window.location.href;
		localStorage.setItem("history", history);
		window.location.assign("/login.html");
	}
});

reviewBtn.addEventListener("click", () => {
	const review = {
		// save basic detail for adding review in session
		action: "new",
		restaurantId: pageStatus.restaurantId,
		restaurantName: pageStatus.data.restaurant.name ?? undefined,
	};
	localStorage.setItem("review", JSON.stringify(review));
	if (localStorage.getItem("user")) {
		window.location.assign("/user-review.html");
	} else {
		const history = `/user-review.html`;
		localStorage.setItem("history", history);
		window.location.assign("/login.html");
	}
});
