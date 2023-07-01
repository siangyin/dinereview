"use strict";

let userAction;
const userAccessBtn = document.getElementById("userAccessBtn");
const alertMsg = document.getElementById("alertMsg");
const emailInput = document.getElementById("email");
const form = document.querySelector("form");
const formInput = document.querySelectorAll(".uk-input");

let formFields = [];

// set variable based on current path eg login or register
switch (currentPath) {
	case "/register.html":
		userAction = "register";
		formFields = [
			{
				name: "username",
				input: "input",
				type: "text",
				required: true,
			},
			{
				name: "email",
				input: "input",
				type: "email",
				required: true,
			},
			{
				name: "password",
				input: "input",
				type: "password",
				required: true,
			},
		];
		break;
	case "/login.html":
		userAction = "login";
		formFields = [
			{
				name: "email",
				input: "input",
				type: "email",
				required: true,
			},
			{
				name: "password",
				input: "input",
				type: "password",
				required: true,
			},
		];
		break;
}

async function submitUserAccess(action, reqBody) {
	let beUrl = `${BE_URL}/api/v1/auth/${action.toLowerCase()}`;
	try {
		fetch(beUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify(reqBody),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "OK") {
					sessionStorage.removeItem("token");
					sessionStorage.removeItem("user");
					removeAllChildsElement(alertMsg);
					// store user data in sessionStorage
					sessionStorage.setItem(
						"user",
						JSON.stringify(
							new User(
								res.data.userId,
								res.data.username,
								res.data.email,
								res.data.role
							)
						)
					);
					sessionStorage.setItem("token", res.token);
					// if have history back to last visited url or go home
					if (sessionStorage.getItem("history")) {
						const backToLastUrl = sessionStorage.getItem("history");
						sessionStorage.removeItem("history");
						window.location.assign(backToLastUrl);
					} else {
						window.location.assign("/index.html");
					}
				} else {
					addAlertMsg(alertMsg, res.msg);
				}
			});
	} catch (error) {
		console.error(error);
		sessionStorage.removeItem("token");
		sessionStorage.removeItem("user");
	}
}

// EVENT LISTENER
// based on input onblur
formInput.forEach((item) => {
	item.addEventListener("focus", () => {
		item.className = "uk-input uk-margin-small-bottom";
	});

	item.addEventListener("blur", (e) => {
		const userInput = e.target.value;
		if (isEmptyStr(userInput)) {
			item.className = "uk-input uk-form-danger uk-margin-small-bottom";
		} else {
			item.className = "uk-input uk-margin-small-bottom";
		}
	});
});

// based on button onclick
userAccessBtn.addEventListener("click", () => {
	const checkForm = validateForm(formFields);
	// if no missing field submit form request
	if (checkForm.missingField.length == 0) {
		formInput.forEach(
			(item) => (item.className = "uk-input uk-margin-small-bottom")
		);
		if (validateEmail(checkForm.reqBody.email)) {
			submitUserAccess(userAction, checkForm.reqBody);
		} else {
			addAlertMsg(alertMsg, "Please enter valid email address");
			emailInput.className = "uk-input uk-form-danger uk-margin-small-bottom";
		}
	} else {
		const msg =
			`Please enter missing ${
				checkForm.missingField.length > 1 ? "fields:" : "field:"
			} ` + checkForm.missingField.toString().replaceAll(",", ", ");
		addAlertMsg(alertMsg, msg);
	}
});
