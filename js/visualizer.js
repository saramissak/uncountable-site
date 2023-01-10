const minText = "Min";
const maxText = "Max";
const inputText = "inputs";
const outputText = "outputs";

// Note this is not the most efficient way to do this but was having troubles 
// with "Access-Control-Allow-Headers:" and this way allows me to not have to 
// copy and paste the nav bar into several HTML files. Issue is that this is 
// less efficient
function loadNav() {
    var nav = document.createElement('nav');
    var navContent = document.createElement('div');
    navContent.className = 'nav-wrapper teal lighten-2';
    navContent.id = 'nav-bar';

    var logo = document.createElement('a');
    logo.href = 'index.html';
    logo.className = 'brand-logo';
    logo.textContent = 'Visualizer';

    var ul = document.createElement('ul');
    ul.id = 'nav-mobile';
    ul.className = 'right hide-on-med-and-down';

    var rawData = document.createElement('li');
    var rawDataLink = document.createElement('a');
    rawDataLink.href = 'see-raw-data.html';
    rawDataLink.textContent = 'Raw Data';
    rawData.appendChild(rawDataLink);

    var analyzeData = document.createElement('li');
    var analyzeDataLink = document.createElement('a');
    analyzeDataLink.href = 'analyze-data.html';
    analyzeDataLink.textContent = 'Analyze Data';
    analyzeData.appendChild(analyzeDataLink);

    nav.appendChild(navContent);
    navContent.appendChild(logo);
    navContent.appendChild(ul);
    ul.appendChild(rawData);
    ul.appendChild(analyzeData);

    document.getElementById('nav-placeholder').appendChild(nav);
}

function loadData(info) {
    var elem = document.querySelector('.collapsible.expandable');
    elem.textContent = "";
    for (const key in info) {
        var liItem = addRawDataItem(key, info);
        elem.appendChild(liItem);
    }

    var elem = document.querySelector('.collapsible.expandable');
    var instance = M.Collapsible.init(elem, {
        accordion: false
    });
}

function addRawDataItem(key, info) {
    var title = createTitle(key);
    var liItem = createRawDataLiLine(title, key, info);
    return liItem;
}

function parseData(key) {
    let year = key.slice(0, 4);
    let month = key.slice(4, 6);
    let day = key.slice(6, 8);
    return month + '/' + day + '/' + year;
}

function parseName(key) {
    return key.slice(9);
}

function createTitle(key) {
    var date = parseData(key);
    var name = parseName(key);
    return '[' + date + '] ' + name;
}

function createRawDataLiLine(title, key, info) {
    var item = document.createElement('li');
    item.id = 'raw-data-line-' + key;

    var titleDiv = document.createElement('div');
    titleDiv.textContent = title;
    titleDiv.className = 'collapsible-header';

    var contentDiv = document.createElement('div');
    contentDiv.className = 'collapsible-body';

    var row = document.createElement('div');
    row.className = 'row';

    var inputs = document.createElement('div');
    inputs.className = 'col s6';
    inputs.innerHTML = jsonToText(info[key][inputText], 'Inputs');

    var outputs = document.createElement('div');
    outputs.className = 'col s6';
    outputs.innerHTML = jsonToText(info[key][outputText], 'Outputs');

    row.appendChild(inputs);
    row.appendChild(outputs);
    contentDiv.appendChild(row);
    item.appendChild(titleDiv);
    item.appendChild(contentDiv);
    return item;
}

function jsonToText(inputs, title) {
    var text = ["<b>" + title + "</b>"];
    for (const key in inputs) {
        text.push(key + ": " + inputs[key]);
    }
    return text.join('<br>');
}

function getMinMaxInputs(val) {
    var min = parseFloat(document.getElementById(val + '-' + minText).value);
    var max = parseFloat(document.getElementById(val + '-' + maxText).value);
    return [min, max];
}

function filterRawData() {
    var toShow = [];
    var minMaxVals = new Map();
    var checkboxes = document.getElementsByName('filter');
    for (var i = 1, n = checkboxes.length; i < n; i++) {
        var val = checkboxes[i].value;
        if (checkboxes[i].checked && val != 'select-all') {
            toShow.push(val);
            minMaxVals[checkboxes[i].value] = getMinMaxInputs(val);
        }
    }
    checkboxes[0].checked = toShow.length == (checkboxes.length - 1);

    var removedUncheckedRows = removeUncheckedRows(data, toShow);
    var filteredData = removeRawDataRows(removedUncheckedRows, toShow, minMaxVals);

    loadData(filteredData);
}

function removeUncheckedRows(data, toShow) {
    var copy = JSON.parse(JSON.stringify(data));

    for (key in copy) {
        for (input in copy[key][inputText]) {
            if (!toShow.includes(input)) {
                delete copy[key][inputText][input];
            }
        }

        for (input in copy[key][outputText]) {
            if (!toShow.includes(input)) {
                delete copy[key][outputText][input];
            }
        }
    }
    return copy;
}

function removeRawDataRows(removedUncheckedRows, toShow, minMaxVals) {
    var filteredData = {};
    for (row in data) {
        var includeData = true;
        for (i in toShow) {
            var key = toShow[i];
            var type = getType(key);

            val = parseFloat(removedUncheckedRows[row][type][key]);
            if (val < minMaxVals[key][0] || minMaxVals[key][1] < val) {
                includeData = false;
                break;
            }
        }
        if (includeData) {
            filteredData[row] = removedUncheckedRows[row];
        }
    };
    return filteredData;
}

function toggle(source) {
    checkboxes = document.getElementsByName('filter');
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        checkboxes[i].checked = source.checked;
    }
}

function loadFilters() {
    var filterItemInputs = document.getElementById('filter-items-inputs');
    var filterItemOutputs = document.getElementById('filter-items-outputs');

    var firstKey = Object.keys(data)[0];
    var firstElement = data[firstKey];
    var inputs = Object.keys(firstElement[inputText]);
    var outputs = Object.keys(firstElement[outputText]);

    const minMaxValues = findMinMaxValues();

    for (i in inputs) {
        var input = inputs[i];
        var minMax = minMaxValues.get(input);
        var min = minMax[0];
        var max = minMax[1];
        createFilterItem(input, min, max, filterItemInputs);
    }

    for (i in outputs) {
        var input = outputs[i];
        var minMax = minMaxValues.get(input);
        var min = minMax[0];
        var max = minMax[1];
        createFilterItem(input, min, max, filterItemOutputs);
    }

    $(document).ready(function() {
        $('.sidenav').sidenav();
    });
}

function createFilterItem(input, min, max, div) {
    var liItem = createLi();
    var rowDiv = createRow();
    var checkBox = createCheckBox(input);
    var createMin = createRange(input, min, max, minText, min);
    var createMax = createRange(input, min, max, maxText, max);

    liItem.appendChild(rowDiv);
    rowDiv.appendChild(checkBox);
    rowDiv.appendChild(createMin);
    rowDiv.appendChild(createMax);
    div.append(liItem);
}

function createRange(input, min, max, text, val) {
    var div = document.createElement('div');
    div.className = 'input-field inline col s3';

    var inputElement = document.createElement('input');
    inputElement.type = 'number';
    inputElement.value = val;
    inputElement.min = min;
    inputElement.max = max;
    inputElement.step = 0.1;
    inputElement.id = input + '-' + text;
    inputElement.onchange = filterRawData

    var name = document.createElement('span');
    name.textContent = text;
    name.className = 'helper-text';

    div.appendChild(inputElement);
    div.appendChild(name);
    return div;
}

function createLi() {
    return document.createElement('li');
}

function createRow() {
    var div = document.createElement('div');
    div.classList.add('row');
    return div;
}

function createCheckBox(input) {
    var label = document.createElement('label');
    var div = document.createElement('div');
    div.className = 'input-field inline col s6';

    var inputElement = document.createElement('input');
    inputElement.type = 'checkbox';
    inputElement.name = 'filter';
    inputElement.className = 'filled-in';
    inputElement.checked = true;
    inputElement.value = input;
    inputElement.onclick = filterRawData;

    var name = document.createElement('span');
    name.textContent = input;

    label.appendChild(inputElement);
    label.appendChild(name);
    div.appendChild(label);

    return div;
}

function findMinMaxValues() {
    const minMaxValues = new Map();
    for (key in data) {
        for (param in data[key][inputText]) {
            setMinMax(minMaxValues, key, param, inputText);
        }
        for (param in data[key][outputText]) {
            setMinMax(minMaxValues, key, param, outputText);
        }
    }
    return minMaxValues;
}

function setMinMax(map, key, param, type) {
    var min = data[key][type][param];
    var max = data[key][type][param];
    var value = [min, max];
    if (map.has(param)) {
        value = map.get(param);
        value[0] = Math.min(min, value[0]);
        value[1] = Math.max(max, value[1]);
    }
    map.set(param, value);
}