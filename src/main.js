import { marked } from 'marked';
import truncate from "truncate-html";

const today = function() {
	const date = new Date();

	const year = String(date.getFullYear());
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return year + "-" + month + "-" + day;
}

const formatDate = function(date) {
	return date.split("-").map(Number).reverse().join(".");
}

const loadDiary = function() {
	const jsonText = localStorage.getItem("diary");
	if (jsonText === null) {
		return {}
	}
	return JSON.parse(jsonText);
}

const storeDiary = function(diary) {
	localStorage.setItem("diary", JSON.stringify(diary));
}

const loadToday = function() {
	const todaytext = loadDiary()[today()] ?? "";
	document.getElementById("todaytext").value = todaytext;
}

let dialogOpenedBy;

const loadAllEntries = function() {
	const entrylist = document.getElementById("entrylist");
	entrylist.replaceChildren();

	Object.entries(loadDiary()).sort( (a, b) => a[0] < b[0] ? 1 : -1
	).forEach(([key, value]) => {
		const date = formatDate(key);

		const html = marked.parse(value);
		const truncatedHTML = truncate(html, 128);
		const outputHTML = "<p><strong>" + date + "</strong></p>" + truncatedHTML;

		const li = document.createElement("li");
		const button = document.createElement("button");
		button.innerHTML = outputHTML;
		button.addEventListener("click", () => {
			dialogOpenedBy = button;
			viewEntry(key);
		});
		li.appendChild(button);
		entrylist.appendChild(li);
	});
}

const viewEntry = function (date) {
	document.getElementById("viewertitle").textContent = formatDate(date);
	const html = marked.parse(loadDiary()[date]);
	document.getElementById("viewercontent").innerHTML = html;
	document.querySelector("#viewer").style.display = 'flex';
	document.getElementById("viewerclose").focus();
}

const closeViewer = function() {
	document.querySelector("#viewer").style.display = 'none';
	dialogOpenedBy.focus();
}

const saveEntry = function() {
	const diary = loadDiary();
	diary[today()] = document.getElementById("todaytext").value;
	storeDiary(diary);

	loadAllEntries();
}

document.getElementById("save").addEventListener("click", saveEntry);
document.getElementById("viewerclose").addEventListener("click", closeViewer);

loadToday();
loadAllEntries();
