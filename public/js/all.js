"use strict";

// CONSTANTS & VARIABLES
const BE_URL = "http://localhost:3000";
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
							<a href="/">Restaurants<span uk-navbar-parent-icon></span></a>
							<div class="uk-navbar-dropdown">
                                <ul class="uk-nav uk-navbar-dropdown-nav">
                                    <li class="uk-active"><a href="/">All Restaurants</a></li>
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
									<li><a href="/user-profile">Profile</a></li>
									<li><a href="/user-reviews">Reviews</a></li>
									<li><a href="/user-favourite">Favourite</a></li>
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
			<li><a href="#">Home</a></li>
			<li><a href="#">Restaurants</a></li>
		</ul>
	</nav>
        `;

const footer = `
    <div class="uk-position-bottom-center uk-position-relative uk-margin uk-text-center">
        <ul class="uk-subnav uk-margin-remove-bottom">
            <li class="uk-text-bold"><a href="#">DINEADVISOR</a></li>
            <li><a href="/about.html">About us</a></li>
            <li><a href="/contact.html">Contact us</a></li>
        </ul>
        <span class="uk-text-meta">© 2023 DineAdvisor. All rights reserved.</span>
    </div>
`;

// COMMON FUNCTIONS

function appendDomItem(parentDom, htmlchild) {
	const div = document.createElement("div");
	div.innerHTML = htmlchild;
	parentDom.append(...div.childNodes);
}

function retrievePath(comparekey, compareval, returnval) {
	return allPaths.find((item) => item[comparekey] == compareval)[returnval];
}
