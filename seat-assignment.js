//$(document).ready(docReady);
PREFIX_MALE = " 남";
PREFIX_FEMALE = " 여";
TIMER = 1000;

window.document.ready = docReady;

function docReady() {
	console.log("document ready.");
	
	appendUtils();
	initGlobalVariable();
	initEvtHandler();
	drawTableLayout();
}

function initGlobalVariable() {
	if (!window.AppData) {
		AppData = {};
		AppData.list = {
			male: [],
			female: []
		};
	}
	
	var speed = document.querySelector("#showSpeed").value;
	
	if (!isNaN(speed)) {
		TIMER = parseInt(speed);
	}
}

function initEvtHandler() {
	document.getElementById("btnLoadList").addEventListener("change", listLoadHandler, false);
	document.getElementById("drawTableLayout").addEventListener("click", drawTableLayout, false);
	document.getElementById("matchingPartner").addEventListener("click", match, false);
}

function listLoadHandler(evt) {
	console.log("list loaded!");
	var files = evt.target.files;

	if (files) {
		for (var i = 0, f; f = files[i]; i++) {
			var r = new FileReader();
			r.onload = (function(f) {
				return function(e) {
					var contents = e.target.result;
					var list = contents.split("\n");
					
					for(var jdx = 0; jdx < list.length; jdx++ ) {

						if(list[jdx].trim().endsWith(PREFIX_MALE)) {
							AppData.list.male.push(list[jdx].trim().replace(PREFIX_MALE, ""));
						} else {
							AppData.list.female.push(list[jdx].trim().replace(PREFIX_FEMALE, ""));
						}
					}
					
					console.log(AppData.list);
					drawRawListData(AppData.list);
				};
			})(f);

			r.readAsText(f, "UTF-8");
		}
	}
}

function appendUtils() {
	if (typeof String.prototype.endsWith !== 'function') {
	    String.prototype.endsWith = function(suffix) {
	        return this.indexOf(suffix, this.length - suffix.length) !== -1;
	    };
	}
}

function drawRawListData(list) {
	var container = document.getElementById("rawListContainer");
	var femaleContainer = container.querySelector(".female");
	var maleContainer = container.querySelector(".male");

	console.log(femaleContainer);
	console.log(maleContainer);

	var femaleList = AppData.list.female;
	var maleList = AppData.list.male;
	
	document.getElementById("femaleSize").innerHTML = "여자 " + femaleList.length + "명";
	document.getElementById("maleSize").innerHTML = "남자 " + maleList.length + "명";
	
	for (var f=0; f < femaleList.length; f++) {
		var fItem = document.createElement("span");
		fItem.innerHTML = femaleList[f];
		fItem.setAttribute("gender", "female");
		fItem.setAttribute("name", femaleList[f]);
		femaleContainer.appendChild(fItem);
	}

	for (var m=0; m < maleList.length; m++) {
		var mItem = document.createElement("span");
		mItem.innerHTML = maleList[m];
		mItem.setAttribute("gender", "male");
		mItem.setAttribute("name", maleList[m]);
		maleContainer.appendChild(mItem);
	}

}

function drawTableLayout() {
	var rowSize = document.getElementById("tableRow").value;
	var colSize = document.getElementById("tableCol").value;
	AppData.tableMax = rowSize * colSize;
	var table = document.querySelector("#layout");
	table.innerHTML = "";
	

	// add row
	var matchedIndex = 1;
	for (var rowIndex = 0; rowIndex < rowSize; rowIndex++) {
		var row = document.createElement("tr");
		row.setAttribute("index", rowIndex);
		table.appendChild(row);
		
		// add column
		for (var colIndex = 0; colIndex < colSize; colIndex++) {
			var col = document.createElement("td");
			col.setAttribute("index", matchedIndex++);
			row.appendChild(col);
		}
	}
}

function match() {
	var femaleList = AppData.list.female;
	var maleList = AppData.list.male;
	var sizeFlag, fstLoopIdx;
	AppData.matchedList = [];
	
	if (femaleList.length > maleList.length) {
		sizeFlag = -1;
		fstLoopIdx = maleList.length;
	} else if (femaleList.length === maleList.length){
		sizeFlag = 0;
		fstLoopIdx = maleList.length
	} else {
		sizeFlag = 1;
		fstLoopIdx = femaleList.length;
	}

	for (var i=0; i<fstLoopIdx; i++) {
		var selectedFemale = selectRandomItem(femaleList);
		var selectedMale = selectRandomItem(maleList);
		var matched = selectedFemale + " " + selectedMale;
		AppData.matchedList.push(matched);
	}
	
	if (sizeFlag > 0) {
		for (var f=0; f<=maleList.length; f++) {
			var selectedMale1 = selectRandomItem(maleList);
			var selectedMale2 = selectRandomItem(maleList);
			
			AppData.matchedList.push(selectedMale1 + " " + (selectedMale2 ? selectedMale2 : ""));
		}
	} else if (sizeFlag < 0) {
		for (var m=0; m<=femaleList.length; m++) {
			var selectedFemale1 = selectRandomItem(femaleList);
			var selectedFemale2 = selectRandomItem(femaleList);
			
			AppData.matchedList.push(selectedFemale1 + " " + (selectedFemale2 ? selectedFemale2 : ""));
		}
	}
	
	console.log(AppData.matchedList);
	
	drawMatchedLayout();
//	document.querySelector("span[name=" + selectedFemale + "]").className += " selected";
}

function drawMatchedLayout() {
	var speed = document.querySelector("#showSpeed").value;
	
	if (!isNaN(speed)) {
		TIMER = parseInt(speed);
	}
	
	var list = AppData.matchedList;
	var origListLength = list.length;
	var sequence = 1;

	if (AppData.tableMax < list.length) {
		alert("Layout이 부족합니다.");
		return;
	}
	
	var repeater = setInterval(_draw, TIMER);

	function _draw() {
		if (list.length <= 0) {
			clearTimeout(repeater);
			return;
		}
		
		var randIdx = selecteRandomIndex(list);
		var selectedItem = list.splice(randIdx, 1);
		var matchString = selectedItem[0];
		var splitStrArr = matchString.split(" ");
		
		var rawContainer = document.querySelector("#rawListContainer");
		var first = rawContainer.querySelector("span[name='" + splitStrArr[0] + "']");
		var second = rawContainer.querySelector("span[name='" + splitStrArr[1] + "']");
		if (first) first.className += " selected";
		if (second) second.className += " selected";
		
		setTimeout(function() {
			document.querySelector("td[index='" + sequence++ + "']").innerHTML = matchString;
		}, TIMER);
		
	}
}

function selecteRandomIndex(list) {
	if (!list || list.length == 0) {
		console.log("Not allowed empty list");
		return;
	}
	
	var index;

	for(;;) {
		index = Math.floor( Math.random(list.length) * list.length );
		if (list[index]) {
			break;
		}
	}
	
	return index;
}

function selectRandomItem(list){
	var index = selecteRandomIndex(list);
	var selectedItem = list.splice(index, 1);
	return selectedItem;
}
