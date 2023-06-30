"use strict";

// CONSTANTS & VARIABLES
const pageStatus = {};

let currentParams = new URLSearchParams(window.location.search);
// eg: restaurantId=1

for (const [key, value] of currentParams.entries()) {
	pageStatus[key] = value;
	if (key === "restaurantId") {
		getRestaurant(value);
	}
}
// DOM

// FUNCTIONS
function photoOnClick(e) {
	console.log(e);
}

async function getRestaurant(id) {
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
					Object.assign(pageStatus, {
						data: res.data,
					});
				} else {
					window.location.assign("/notfound.html");
				}
			});
	} catch (error) {
		console.error(error);
	}
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
	let col1 = "";
	let col2 = "";
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
				<ul class="uk-slider-items">${photoList}</ul>
				<a class="uk-position-center-left uk-position-small uk-hidden-hover"
				href="#" uk-slidenav-previous uk-slider-item="previous" ></a>
				<a class="uk-position-center-right uk-position-small uk-hidden-hover"
				href="#" uk-slidenav-next uk-slider-item="next" ></a>
			</div>`;
			}

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
						<span>${item.createdOn}</span>
					</div>
				</div>
			</div>
		</div>`;

			const col2 = `
			<div class="uk-width-2-3@s uk-margin-small">
				<div class="uk-inline">
					<span class="uk-text-middle uk-text-emphasis">4.5</span>
					${getStarRating(item.rating)}
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
}
