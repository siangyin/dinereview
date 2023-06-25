"use strict";

// CONSTANTS & VARIABLES
const pageStatus = {
	loading: false,
};

let currentParams = new URLSearchParams(window.location.search);
// eg: restaurantId=1

for (const [key, value] of currentParams.entries()) {
	pageStatus[key] = value;
	if (key === "restaurantId") {
		getRestaurant(value);
	}
}

// FUNCTIONS
function photoOnClick(e) {
	console.log(e);
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
					document.title = `${res.data.restaurant.name}`;
					document.getElementById(
						"pageTitle"
					).innerHTML = `${res.data.restaurant.name}`;
				}
			});
	} catch (error) {
		console.error(error);
	}
}
