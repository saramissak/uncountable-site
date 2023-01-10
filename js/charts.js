function drawChart() {
    errorMessage("");
    var chartType = $('#chart_type').val();
    switch (chartType) {
        case null:
            errorMessage("Please select a chart type");
            break;
        case "Histogram":
            drawHistogram();
            break;
        case "Scatter plot":
            drawScatterPlot();
            break;
        case "Bar chart":
            drawBarChart();
            break;
        case "Column chart":
            drawColumnChart();
            break;
        default:
            errorMessage("Not a supported chart type");
            break;
    }
}

function listSelectionOptions() {
    var inputOptionsDiv = document.getElementsByClassName('input-options');
    var outputOptionsDiv = document.getElementsByClassName('output-options');

    inputOptionsDiv.innerHTML = '';
    outputOptionsDiv.innerHTML = '';
    var inputs = inputsNames()
    var outputs = outputsNames()
    for (i in inputs) {
        inputOptionsDiv[0].appendChild(makeOption(inputs[i]));
    }

    for (i in inputOptionsDiv) {
        inputOptionsDiv[i].innerHTML = inputOptionsDiv[0].innerHTML;
    }

    for (i in outputs) {
        outputOptionsDiv[0].appendChild(makeOption(outputs[i]));
    }

    for (i in outputOptionsDiv) {
        outputOptionsDiv[i].innerHTML = outputOptionsDiv[0].innerHTML;
    }

    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, {});
}

function makeOption(value) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    return option;
}

function getData(dataName, removeZeros) {
    var dataType = getType(dataName);
    var filtered = filterData(removeZeros, dataType, dataName);
    return filtered;
}

function getType(key) {
    var dataType = inputText;
    if (outputsNames().includes(key)) {
        dataType = outputText;
    }
    return dataType;
}

function filterData(removeZeros, dataType, dataName) {
    var filtered = [];
    for (key in data) {
        if (removeZeros == false) {
            filtered.push([key, data[key][dataType][dataName]]);
        } else if (data[key][dataType][dataName] != 0.0) {
            filtered.push([key, data[key][dataType][dataName]]);
        }
    }
    return filtered;
}

function getDataPair(xAxisName, yAxisName) {
    var xData = getData(xAxisName, false);
    var yData = getData(yAxisName, false);

    var dataPair = xData.map((k, i) => [k[1], yData[i][1]]);
    var removeZeros = $("input[name='0.0']:checked").val() == "yes";

    if (removeZeros) {
        dataPair = dataPair.filter(x => x[1] != 0.0 && x[0] != 0.0);
    }
    return dataPair;
}

function outputsNames() {
    var firstKey = Object.keys(data)[0];
    var outputs = Object.keys(data[firstKey][outputText]);
    return outputs;
}

function inputsNames() {
    var firstKey = Object.keys(data)[0];
    var inputs = Object.keys(data[firstKey][inputText]);
    return inputs;
}

function drawHistogram() {
    var dataName = $('#all-data-val').val();
    if (dataName == null) {
        errorMessage("Please specify which data use");
        return;
    }

    var removeZeros = $("input[name='0.0']:checked").val() == "yes";

    var array = [
        [dataName, "value"]
    ];
    array = array.concat(getData(dataName, removeZeros));

    var options = {
        title: dataName,
        legend: { position: 'none' },
        hAxis: {
            title: "Value"
        },
        vAxis: { title: "Count" },
    };
    var histogramData = google.visualization.arrayToDataTable(array);
    var chart = new google.visualization.Histogram(document.getElementById('chart_div'));
    chart.draw(histogramData, options);
}

function drawScatterPlot() {
    var xAxis = $('#x-axis-val').val();
    var yAxis = $('#y-axis-val').val();

    if (xAxis == null || yAxis == null) {
        errorMessage("Please specify which data to use on BOTH the x axis and y axis");
        return;
    }
    var scatterData = [
        [xAxis, yAxis],
    ];

    var dataPair = getDataPair(xAxis, yAxis);

    scatterData = scatterData.concat(dataPair);
    scatterData = google.visualization.arrayToDataTable(scatterData);

    var options = {
        title: xAxis + ' vs. ' + yAxis,
        hAxis: { title: xAxis },
        vAxis: { title: yAxis },
        legend: 'none'
    };

    var chart = new google.visualization.ScatterChart(document.getElementById('chart_div'));

    chart.draw(scatterData, options);
}

function drawBarChart() {
    var xAxis = $('#x-axis-val').val();
    var yAxis = $('#y-axis-val').val();

    if (xAxis == null || yAxis == null) {
        errorMessage("Please specify which data to use on BOTH the x axis and y axis");
        return;
    }
    var scatterData = [
        [xAxis, yAxis],
    ];

    var dataPair = getDataPair(xAxis, yAxis);

    scatterData = scatterData.concat(dataPair);
    scatterData = google.visualization.arrayToDataTable(scatterData);

    var options = {
        title: xAxis + ' vs. ' + yAxis,
        hAxis: { title: xAxis },
        vAxis: { title: yAxis },
        legend: 'none',
        // option for buttong boarder around the boxes 
    };

    var chart = new google.visualization.BarChart(document.getElementById('chart_div'));

    chart.draw(scatterData, options);
}

function drawColumnChart() {
    var xAxis = $('#x-axis-val').val();
    var yAxis = $('#y-axis-val').val();

    if (xAxis == null || yAxis == null) {
        errorMessage("Please specify which data to use on BOTH the x axis and y axis");
        return;
    }
    var scatterData = [
        [xAxis, yAxis],
    ];

    var dataPair = getDataPair(xAxis, yAxis);

    scatterData = scatterData.concat(dataPair);
    scatterData = google.visualization.arrayToDataTable(scatterData);

    var options = {
        title: xAxis + ' vs. ' + yAxis,
        hAxis: { title: xAxis },
        vAxis: { title: yAxis },
        legend: 'none',
        // option for buttong boarder around the boxes 
    };


    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));

    chart.draw(scatterData, options);
}

function errorMessage(message) {
    var error = document.getElementById("error");
    error.innerHTML = "<b class='red-text'>" + message + "</b>";
}


function displayChartOptions() {
    $(document).on('change', '#chart_type', function() {
        var selection = $(this).val();;
        $("#x-axis").hide();
        $("#y-axis").hide();
        $("#all-data").hide();
        errorMessage("")
        switch (selection) {
            case "Histogram":
                $("#all-data").show();
                break;
            case "Scatter plot":
                $("#x-axis").show();
                $("#y-axis").show();
                break;
            case "Bar chart":
                $("#x-axis").show();
                $("#y-axis").show();
                break;
            case "Column chart":
                $("#x-axis").show();
                $("#y-axis").show();
                break;
            default:
                break;
        }
    });
}