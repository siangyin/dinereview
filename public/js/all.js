"use strict";

// CONSTANTS & VARIABLES
const BE_URL = "http://localhost:3000";
let currentPath = window.location.pathname;

const allPaths = {
	register: { path: "/register.html" },
	login: { path: "/login.html" },
};

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
										currentPath === allPaths.register.path
											? '<li class="uk-active">'
											: "<li>"
									}<a href=${allPaths.register.path}>Register</a></li>
									${
										currentPath === allPaths.login.path
											? '<li class="uk-active">'
											: "<li>"
									}<a href=${allPaths.login.path}>Login</a></li>
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
