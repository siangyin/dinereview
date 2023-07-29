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

	const beUrl = `${BE_URL}/api/v1/restaurant`;
	const failMsg = `<span><span uk-icon="warning"></span><span class="uk-text-middle"> Something went wrong, failed to load data</span></span>`;
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
					loadingSpinner.classList.add("displayNone");
					pageStatus = {
						list: res.data,
						count: res.count,
					};

					Boolean(res.count) && loadCardList(res.data);
					checkScreenHeight();
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
	<div class="restaurantCard uk-box-shadow-hover-small uk-padding-small" id=${
		item.restaurantId
	} name="${item.name}" review="${item.totalReviews ?? 0}" rating="${
		item.avgRating ?? 0
	}" >
		<div class="uk-card uk-card-muted" onclick="viewRestaurantPage(${
			item.restaurantId
		})">
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

function getFilterList(list) {
	let areasList = [...new Set(list.map((item) => item.area))].sort();

	areasList = areasList.sort().map((item) => {
		const idArr = [];
		list.forEach((i) => {
			if (i.area.includes(item) && !idArr.includes(i)) {
				idArr.push(i.restaurantId);
			}
		});

		return {
			label: item,
			value: item.toLowerCase().replaceAll(" ", ""),
			list: idArr,
		};
	});

	let typesList = [];
	list.forEach(
		(item) =>
			item.type &&
			item.type.forEach((ty) => !typesList.includes(ty) && typesList.push(ty))
	);

	typesList = typesList.sort().map((item) => {
		const idArr = [];
		list.forEach((i) => {
			if (i.type.includes(item) && !idArr.includes(i)) {
				idArr.push(i.restaurantId);
			}
		});

		return {
			label: item,
			value: item.toLowerCase().replaceAll(" ", ""),
			list: idArr,
		};
	});

	let cuisinesList = [];
	list.forEach(
		(item) =>
			item.cuisine &&
			item.cuisine.forEach(
				(c) => !cuisinesList.includes(c) && cuisinesList.push(c)
			)
	);

	cuisinesList = cuisinesList.sort().map((item) => {
		const idArr = [];
		list.forEach((i) => {
			if (i.cuisine.includes(item) && !idArr.includes(i)) {
				idArr.push(i.restaurantId);
			}
		});

		return {
			label: item,
			value: item.toLowerCase().replaceAll(" ", ""),
			list: idArr,
		};
	});

	function getRatingList(val) {
		return list
			.map((item) => {
				if (item.avgRating >= val && item.avgRating < val + 1) {
					return item.restaurantId;
				}
			})
			.filter((item) => item);
	}

	const ratingsList = [
		{ label: "5 stars", value: 5, list: getRatingList(5) },
		{ label: "4 stars & above", value: 4, list: getRatingList(4) },
		{ label: "3 stars & above", value: 3, list: getRatingList(3) },
		{
			label: "2 stars & above",
			value: 2,
			list: getRatingList(2),
		},
		{
			label: "1 star & above",
			value: 1,
			list: getRatingList(1),
		},
		{
			label: "No rating",
			value: 0,
			list: getRatingList(0),
		},
	];

	return {
		areas: areasList,
		types: typesList,
		cuisines: cuisinesList,
		ratings: ratingsList,
	};
}

function appendFiltersSideColumn(list) {
	const filters = getFilterList(list);
	pageStatus["filters"] = filters;

	const headers = {
		areas: "Location",
		types: "Establishment Type",
		cuisines: "Cuisines",
		ratings: "Ratings",
	};

	const sidecol = document.getElementById("sidecol");

	for (let filterKey in filters) {
		const newList = document.createElement("li");

		const title = document.createElement("span");
		title.innerHTML = headers[filterKey];
		title.classList.add("uk-margin-small-bottom");
		newList.appendChild(title);

		const sublist = document.createElement("ul");
		sublist.classList.add("uk-list");
		sublist.classList.add("uk-margin-small-top");
		//sublist.setAttribute("id", `${filterKey}-checkbox`);
		filters[filterKey].map((obj) => {
			const newItem = document.createElement("li");
			newItem.classList.add("uk-margin-remove");

			const newInput = document.createElement("input");
			newInput.classList.add("uk-checkbox");
			newInput.classList.add(`${filterKey}-checkbox`);
			obj.list.length > 0 && newInput.setAttribute("list", obj.list);
			newInput.type = "checkbox";
			newInput.name = filterKey;
			newInput.value = obj.value;

			const newLabel = document.createElement("label");
			newLabel.htmlFor = obj.value;
			newLabel.innerHTML = ` ${obj.label} <span class="uk-text-meta">(${obj.list.length})</span>`;

			newItem.appendChild(newInput);
			newItem.appendChild(newLabel);

			sublist.appendChild(newItem);
		});

		newList.appendChild(sublist);
		sidecol.appendChild(newList);
	}
}

function loadCardList(list) {
	const resultNo = document.getElementById("resultNo");
	resultNo.innerHTML = `Results: ${list.length}`;

	appendFiltersSideColumn(list);
	list.map((item) => item.status == "active" && createCardItem(item));

	// console.log();
}

function sortCard(option) {
	const parentDom = document.querySelector("#listContainer");
	[...parentDom.children]
		.sort((a, b) => {
			switch (option) {
				case "name-az":
					return a.getAttribute("name") > b.getAttribute("name") ? 1 : -1;
				case "name-za":
					return a.getAttribute("name") < b.getAttribute("name") ? 1 : -1;
				case "mostReviewed":
					return +a.getAttribute("review") < +b.getAttribute("review") ? 1 : -1;
				case "highRating":
					return +a.getAttribute("rating") < +b.getAttribute("rating") ? 1 : -1;
			}
			return a.getAttribute("name") > b.getAttribute("name") ? 1 : -1;
		})
		.forEach((node) => parentDom.appendChild(node));
}

const formFields = document.querySelector("form");

function getFilteredIds() {
	const allInputs = document.querySelectorAll(".uk-checkbox");
	let strIds = "";
	allInputs.forEach((item) => {
		if (item.checked && item.hasAttribute("list")) {
			const ids = item.getAttribute("list");
			strIds += `, ${ids}`;
		}
	});
	const arrIds = strIds
		.split(",")
		.map((item) => {
			if (item) {
				return +item.trim();
			}
		})
		.filter((i) => i);
	const idslist = [...new Set(arrIds)];

	const restCard = document.querySelectorAll(".restaurantCard");
	const resultNo = document.getElementById("resultNo");
	resultNo.innerHTML = `Results: ${
		idslist.length > 0 ? idslist.length : restCard.length
	}`;
	restCard.forEach((item) => {
		console.log(idslist.length == 0, idslist.includes(+item.id));
		if (idslist.length == 0 || idslist.includes(+item.id)) {
			item.classList.contains("displayNone") &&
				item.classList.remove("displayNone");
		} else {
			item.classList.add("displayNone");
		}
	});
}

formFields.addEventListener("change", (e) => {
	if (e.target.type === "checkbox") {
		getFilteredIds();
	}
});
