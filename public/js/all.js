"use strict";

// CLASS

class User {
	constructor(userId, username, email, role, pic) {
		this.userId = userId;
		this.username = username;
		this.email = email;
		this.role = role;
		this.pic = pic ?? undefined;
	}
}

// CONSTANTS & VARIABLES

const BE_URL = window.location.origin; //"http://localhost:3000";
let currentPath = window.location.pathname;

const allPaths = [
	{ title: "About", name: "about", path: "/about.html", role: "all" },
	{ title: "Contact", name: "contact", path: "/contact.html", role: "all" },
	{ title: "Register", name: "register", path: "/register.html", role: "all" },
	{ title: "Login", name: "login", path: "/login.html", role: "all" },
	{
		title: "Restaurant Detail", // view restaurant detail
		name: "restaurant detail",
		path: "/restaurant.html",
		role: "all",
	},
	{
		title: "Profile",
		name: "profile",
		path: "/user-profile.html",
		role: "user",
	},
	{
		title: "Favourite",
		name: "favourite",
		path: "/user-favourite.html",
		role: "user",
	},
	{
		title: "Reviews",
		name: "reviews",
		path: "/user-reviews.html",
		role: "user",
	},
	{
		title: "Review", // New, View/Edit user's review
		name: "review",
		path: "/user-review.html",
		role: "user",
	},
	{
		title: "Restaurant", // New, View/Edit restaurant
		name: "restaurant",
		path: "/admin-restaurant.html",
		role: "admin",
	},
	{
		title: "User List",
		name: "userlist",
		path: "/admin-userlist.html",
		role: "admin",
	},
	{
		title: "Review List",
		name: "reviewlist",
		path: "/admin-reviewlist.html",
		role: "admin",
	},
	{
		title: "Restaurant List",
		name: "restaurantlist",
		path: "/admin-restaurantlist.html",
		role: "admin",
	},
];

const svgStarIcon = {
	full: `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
						<path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>`,
	half: `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512">
	<path d="M320 376.4l.1-.1 26.4 14.1 85.2 45.5-16.5-97.6-4.8-28.7 20.7-20.5 70.1-69.3-96.1-14.2-29.3-4.3-12.9-26.6L320.1 86.9l-.1 .3V376.4zm175.1 98.3c2 12-3 24.2-12.9 31.3s-23 8-33.8 2.3L320.1 439.8 191.8 508.3C181 514 167.9 513.1 158 506s-14.9-19.3-12.9-31.3L169.8 329 65.6 225.9c-8.6-8.5-11.7-21.2-7.9-32.7s13.7-19.9 25.7-21.7L227 150.3 291.4 18c5.4-11 16.5-18 28.8-18s23.4 7 28.8 18l64.3 132.3 143.6 21.2c12 1.8 22 10.2 25.7 21.7s.7 24.2-7.9 32.7L470.5 329l24.6 145.7z"/></svg>`,
	empty: `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
						<path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.6 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"/></svg>`,
};

const faviconUrl = `https://cdn-icons-png.flaticon.com/512/4060/4060708.png`;

// COMMON DOM ELEMENTS

const mainHeader = document.getElementById("mainHeader");
const mainFooter = document.getElementById("mainFooter");
const mainContent = document.getElementById("mainContent");

window.addEventListener("DOMContentLoaded", () => {
	appendDomItem(mainHeader, navbar);
	appendDomItem(mainHeader, breadCrumb);
	appendDomItem(mainFooter, footer);
});

const navbar = `
    <nav class="uk-navbar-container">
		<div class="uk-container">
			<div uk-navbar>
				<div class="uk-navbar-left">
					<ul class="uk-navbar-nav">
						<li class="uk-active"><a href="/">DININGADVISOR</a></li>
						<li>
							<a href="/">Admin Dashboard<span uk-navbar-parent-icon></span></a>
							<div class="uk-navbar-dropdown">
                                <ul class="uk-nav uk-navbar-dropdown-nav">
                                    <li class="uk-active"><a href="/admin-restaurant.html?action=new">New Restaurant</a></li>
                                    <li><a href="/">Popular Restaurants</a></li>
                                    <li class="uk-nav-header">Cuisine</li>
                                    <li><a href="/">Asian</a></li>
                                    <li><a href="/">Chinese</a></li>
                                    <li><a href="/">Cafe</a></li>
                                    <li class="uk-nav-divider"></li>
                                    <li><a href="/">Special Offers</a></li>
                                </ul>
							</div>
						</li>
					</ul>
				</div>
				<div class="uk-navbar-right">
					<ul class="uk-navbar-nav">
						<li>
							<a href="/"><span uk-icon="user"></span><span uk-navbar-parent-icon></span></a>
							<div class="uk-navbar-dropdown">
								<ul class="uk-nav uk-navbar-dropdown-nav">
									${
										currentPath === retrievePath("name", "register", "path")
											? '<li class="uk-active">'
											: "<li>"
									}<a href=${retrievePath(
	"name",
	"register",
	"path"
)}>Register</a></li>
									${
										currentPath === retrievePath("name", "login", "path")
											? '<li class="uk-active">'
											: "<li>"
									}<a href=${retrievePath(
	"name",
	"login",
	"path"
)}>Login</a></li>
									<li class="uk-nav-header">Account</li>
									<li><a href="/user-profile.html">Profile</a></li>
									<li><a href="/user-reviews.html">Reviews</a></li>
									<li><a href="/user-favourite.html">Favourite</a></li>
									<li class="uk-nav-divider"></li>
									<li><a href="/">Log out</a></li>
								</ul>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</nav>
`;

const breadCrumb = `
    <nav class="uk-container uk-margin" aria-label="Breadcrumb">
		<ul class="uk-breadcrumb">
			<li><a href="/">Home</a></li>
			<li><a href="#">Restaurants</a></li>
		</ul>
	</nav>
        `;

const footer = `
    <div class="uk-position-bottom-center uk-position-relative uk-margin uk-text-center">
        <ul class="uk-subnav uk-margin-remove-bottom">
            <li class="uk-text-bold"><a href="#">DININGADVISOR</a></li>
            <li><a href="/about.html">About us</a></li>
            <li><a href="/contact.html">Contact us</a></li>
        </ul>
        <span class="uk-text-meta">© 2023 DiningAdvisor. All rights reserved.</span>
    </div>
`;

// APPEND FAVICON
// <link rel="icon" href="images/icon01.png" />
let newHeadLink = document.createElement("link");
newHeadLink.setAttribute("rel", "icon");
newHeadLink.setAttribute("href", faviconUrl);
document.head.appendChild(newHeadLink);

// COMMON FUNCTIONS

function appendDomItem(parentDom, htmlchild) {
	const div = document.createElement("div");
	div.innerHTML = htmlchild;
	parentDom.append(...div.childNodes);
}

function removeAllChildsElement(parentDom) {
	parentDom.hasChildNodes() && parentDom.replaceChildren();
}

function addAlertMsg(parentDom, msg, status = "warning") {
	// status: success || warning || danger
	removeAllChildsElement(parentDom);
	const tmp = document.createElement("div");
	tmp.innerHTML = `
          <div class="uk-alert-${status}" uk-alert>
            <a class="uk-alert-close" uk-close></a>
            <p>${msg}</p>
          </div>
          `;
	parentDom.append(...tmp.childNodes);
}

function retrievePath(comparekey, compareval, returnval) {
	return allPaths.find((item) => item[comparekey] == compareval)[returnval];
}

function validateForm(formFields) {
	const reqBody = {};
	const missingField = [];

	// loop thru required field using id to find input value
	for (const field of formFields) {
		const fieldVal = document.getElementById(`${field.name}`).value;
		if (Boolean(fieldVal)) {
			reqBody[field.name] = fieldVal.trim();
		} else {
			reqBody[field.name] = undefined;
			field.required && missingField.push(field.name);
		}
	}

	return { reqBody, missingField };
}

function validateEmail(email) {
	const validRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return validRegex.test(email);
}

function isEmptyStr(str) {
	return !str || str.length === 0;
}

function capitalised(word) {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

function getStarRating(avgRate) {
	const temp = `<span class="starIcons">
						${
							avgRate > 1
								? svgStarIcon.full
								: avgRate >= 0.5
								? svgStarIcon.half
								: svgStarIcon.empty
						}
						${
							avgRate > 2
								? svgStarIcon.full
								: avgRate >= 1.5
								? svgStarIcon.half
								: svgStarIcon.empty
						}
						${
							avgRate > 3
								? svgStarIcon.full
								: avgRate >= 2.5
								? svgStarIcon.half
								: svgStarIcon.empty
						}
						${
							avgRate > 4
								? svgStarIcon.full
								: avgRate >= 3.5
								? svgStarIcon.half
								: svgStarIcon.empty
						}
						${
							avgRate == 5
								? svgStarIcon.full
								: avgRate >= 4.5
								? svgStarIcon.half
								: svgStarIcon.empty
						}
					</span>`;
	return temp;
}
