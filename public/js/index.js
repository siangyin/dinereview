"use strict";

// CONSTANTS & VARIABLES
let pageStatus = {
	list: [],
	count: 0,
};

// DOM
const listContainer = document.getElementById("listContainer");
const loadingSpinner = document.getElementById("loadingSpinner");

async function getAllRestaurants() {
	// set loading spinner
	loadingSpinner.classList.remove("displayNone");
	// remove any existing alert
	alertMsg.removeAttribute("class");
	removeAllChildsElement(alertMsg);

	const url = `${BE_URL}/api/v1/restaurant`;
	const failMsg = `<span><span uk-icon="warning"></span><span class="uk-text-middle"> Something went wrong, failed to load data</span></span>`;
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
					loadingSpinner.classList.add("displayNone");
					pageStatus = {
						list: res.data,
						count: res.count,
					};

					Boolean(res.count) && loadCardList(res.data);
				} else {
					addAlertMsg(alertMsg, failMsg);
					loadingSpinner.classList.add("displayNone");
				}
			});
	} catch (error) {
		addAlertMsg(alertMsg, failMsg, "danger");
		loadingSpinner.classList.add("displayNone");
	}
}

getAllRestaurants();

function viewRestaurantPage(id) {
	window.location.assign("restaurant.html?restaurantId=" + id);
}

function createCardItem(item) {
	const newDiv = document.createElement("div");
	const restTags = item.type
		.concat(item.cuisine)
		.toString()
		.replaceAll(",", ", ");

	const reviewContent = item.totalReviews
		? `<span class="uk-text-middle uk-text-bold">${item.avgRating ?? 0}</span>
          ${getStarRating(item.avgRating)}
					<span class="uk-text-meta uk-text-middle uk-margin-small-left ">${
						item.totalReviews
					} ${item.totalReviews > 1 ? "reviews" : "review"}</span>`
		: `<span class="uk-text-meta uk-text-middle ">No Review & Rating</span>`;
	const content = `
	<div class="restaurantCard uk-box-shadow-hover-small uk-padding-small" id=${item.restaurantId}>
		<div class="uk-card uk-card-muted" onclick="viewRestaurantPage(${item.restaurantId})">
			<div class="uk-card-media-top" >
				<img class="restaurantImg uk-position-top-center uk-position-relative  uk-background-cover"
					src=${item.photos}
					alt=${item.name}
				/>
			</div>
			<div id="cardInfo" class="uk-margin-small uk-card uk-card-body uk-padding-remove">
				<strong class="uk-text-danger uk-margin-small">${item.name}</strong>
				<div>
					${reviewContent}
					<div class="uk-text-meta">${restTags}</div>
				</div>
			</div>
		</div>
	</div>
	`;

	newDiv.innerHTML = content;
	listContainer.append(...newDiv.childNodes);
}

function loadCardList(list) {
	list.map((item) => createCardItem(item));
}
