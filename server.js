const path = require("path");
const fs = require("fs");
// const express = require("express");
// const app = express();
const app = require("express")();
const port = 3000;

//See index.html to confirm page checking interval
const NAVIGATION_CHECK_INTERVAL_MILISECONDS = 500;

let internalState = {
	clickCount: 0,
	verticalSelector: 0,
	listContent: ["First", "Second", "Third", "Fourth", "Fifth"],
	currentPage: "pageB.html",
	changedPageTime: new Date()
};



app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/current-page", (req, res) => {
	res.sendFile(path.join(__dirname, internalState.currentPage));
});

app.get("/page-changed", (req, res) => {
	const milisecondsSinceLastChange = (new Date() - internalState.changedPageTime);
	if (milisecondsSinceLastChange <= NAVIGATION_CHECK_INTERVAL_MILISECONDS) {
		return res.sendFile(path.join(__dirname, internalState.currentPage));
	}
	res.status(422).send("Not yet");
});

//============================================================

app.get("/navigate/:destination", (req, res) => {
	const pageName = `${req.params.destination}.html`;
	const desiredPagePath = path.join(__dirname, pageName);
	if (!fs.existsSync(desiredPagePath)) {
		console.log(`${desiredPagePath} doesn't exist`);
		return res.sendStatus(404);
	}

	internalState.currentPage = pageName;
	internalState.changedPageTime = new Date();
	console.log(`Navigation to ${pageName}`);
	res.sendFile(desiredPagePath);
});

//============================================================

app.get("/buttonclick", (req, res) => {
	internalState.clickCount += 1;
	res.send("Swapped inner html!");
});

app.get("/clickcount", (req, res) => {
	//Can conditionally stop HTMX polling by sending status code 286, see https://htmx.org/docs/#polling
	if (internalState.clickCount > 25) {
		return res.status(286).send("Times clicked: 25+");
	}
	res.send(`Times clicked: ${internalState.clickCount}`);
});

//============================================================

/**
 * Produces a string of HTML list items where the selected index has the 'list-selected' CSS class
 * @param {number} selectedIndex If selectedIndex is negative, the produced list items will be indexed in reverse. Eg: -1 = last element
 * @param {string[]} listContent 
 * @returns 
 */
const listBuilder = (selectedIndex, listContent) => {
	let clampedIndex = (selectedIndex % listContent.length);
	if (clampedIndex < 0) {clampedIndex += listContent.length;}

	const htmlList = listContent.map((val, index) => {
		return `<li ${index === clampedIndex ? 'class="list-selected"':""}>${val}</li>`
	}).join("");
	return htmlList;
}

app.get("/list-content", (req, res) => {
	res.send(
		listBuilder(internalState.verticalSelector, internalState.listContent)
	);
});

app.put("/move-selector/:direction", (req, res) => {
	const direction = req.params.direction;
	if (direction === "up")   {internalState.verticalSelector -= 1;}
	if (direction === "down") {internalState.verticalSelector += 1;}

	res.status(200).send(
		listBuilder(internalState.verticalSelector, internalState.listContent)
	);
});

//============================================================

app.listen(port, () => {
	console.log(`HTMX Demo listening, open http://localhost:${port} in browser`);
});
