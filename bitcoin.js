'use strict';

var lastBlockNum;

var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

function Block(numTx, date) {
    this.numTx = numTx;
    this.date = date;
}

var Blocks = [];

window.onload = new function() {
    $.ajax({
        url: 'http://btc.blockr.io/api/v1/block/raw/last',
        type: "GET",
        dataType: "json",
        success: function(data) {
            lastBlockNum = data["data"]["height"];
        },
        error: function(data) {
            console.log(data);
            alert("We have made too many requests to the API. Wait a while before making another call.");
        }
    });


};

function clearSVG() {

    $("body").find("svg").remove();
    Blocks = [];
}


function getLastNBlocksRecursive(n) {
    $("#loading").show();
    $.ajax({
        url: "http://btc.blockr.io/api/v1/block/raw/" + (lastBlockNum - n),
        type: "GET",
        dataType: "json",
        success: function(data) {
            Blocks.push(new Block(data["data"]["tx"].length, new Date(parseInt(data["data"]["time"]) * 1000)));

            if (n != 1) {
                getLastNBlocksRecursive(n - 1);
            }
            if (n == 1) {

                $("#loading").css("display", "none");

                //createHistogram();
                changeTXNumGraph();


            }
        },
        error: function(data) {
            console.log(data);
            alert("We have made too many requests to the API. Wait a while before making another call.");
        }
    });

}

function getFirstBlocks() {
    if (document.getElementById("numBlocks").value === "") {
        alert("Please enter number of blocks to be analyzed");
        return;
    }
    clearSVG();
    $("#loading").css("display", "in-line");
    getNFirstBlocksRecursive(document.getElementById("numBlocks").value, 1);
}

function getLastBlocks() {
    if (document.getElementById("numBlocks").value === "") {
        alert("Please enter number of blocks to be analyzed");
        return;
    }
    clearSVG();
    $("#loading").css("display", "in-line");
    getLastNBlocksRecursive(document.getElementById("numBlocks").value);
}

function getNFirstBlocksRecursive(n, start) {
    $("#loading").show();
    $.ajax({
        url: "http://btc.blockr.io/api/v1/block/raw/" + start,
        type: "GET",
        dataType: "json",
        success: function(data) {
            Blocks.push(new Block(data["data"]["tx"].length, new Date(parseInt(data["data"]["time"]) * 1000)));

            if (start != n) {
                getNFirstBlocksRecursive(n, start + 1);
            }
            if (start == n) {
                $("#loading").css("display", "none");

                //createHistogram();
                changeTXNumGraph();
            }
        },
        error: function(data) {
            console.log(data);
            alert("We have made too many requests to the API. Wait a while before making another call.");
        }
    });
}

function getTxRange() {
    var lowest = Number.MAX_SAFE_INTEGER;
    var highest = Number.MIN_VALUE;
    for (var x = 0; x < Blocks.length; x++) {
        if (Blocks[x].numTx > highest) {
            highest = Blocks[x];
        }
        if (Blocks[x].numTx < lowest) {
            lowest = Blocks[x];
        }
    }
    var x = [];
    x.push(Math.max(0, lowest - 100), highest + 100);
    return x;
}

function getBlockDomain() {
    var x = [];

    if (Blocks.length != 0 || Blocks.length != 1) {
        var d1 = new Date(Blocks[0].date);
        var d2 = new Date(Blocks[Blocks.length - 1].date);

        if (d1 < d2) {
            x.push(d1);
            x.push(d2);
        } else {
            x.push(d2);
            x.push(d1);
        }

        x[0].setHours(x[0].getHours() - 1);
        x[1].setHours(x[1].getHours() + 1);

        return x;
    }

}

function createHistogram() {

    var parseDate = d3.timeParse("%m/%d/%Y %H:%M:%S %p"),
        formatCount = d3.format(",.0f");

    var margin = {
            top: 30,
            right: 30,
            bottom: 40,
            left: 30
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var domain = getBlockDomain()
    var xAxisLabel = month[domain[0].getMonth()] + " " + domain[0].getDate() +
        ", " + domain[0].getFullYear() + " - " +
        month[domain[1].getMonth()] + " " + domain[1].getDate() +
        ", " + domain[1].getFullYear();

    var x = d3.scaleTime()
        .domain(domain)
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var histogram = d3.histogram()
        .value(function(d) {
            return d.date;
        })
        .domain(x.domain())
        .thresholds(x.ticks(d3.timeHour));

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 35)
        .style("font-size", "14px")
        .text(xAxisLabel);

    var bins = histogram(Blocks);
    y.domain([0, d3.max(bins, function(d) {
        return d.length;
    })]);
    var bar = svg.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) {
            return "translate(" + x(d.x0) +
                "," + y(d.length) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", function(d) {
            return x(d.x1) - x(d.x0) - 1;
        })
        .attr("height", function(d) {
            return height - y(d.length);
        });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", function(d) {
            return (x(d.x1) - x(d.x0)) / 2;
        })
        .attr("text-anchor", "middle")
        .text(function(d) {
            if (d.length != 0) {
                return formatCount(d.length);
            } else {
                return ""
            }
        });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Number of Blocks per Hour");
}

function changeTXNumGraph() {

    var data = d3.nest()
        .key(function(d) {
            return formatDate(d.date) + " " + formatAMPM(d.date);
        })
        .rollup(function(v) {
            return d3.sum(v, function(d) {
                return d.numTx;
            });
        })
        .entries(Blocks);
    console.log(data);



    // set the dimensions and margins of the graph
    var margin = {
            top: 40,
            right: 30,
            bottom: 60,
            left: 60
        },
        width = 960 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);



    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");




    // Scale the range of the data in the domains
    x.domain(data.map(function(d) {
        return d.key;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.value;
    })]);

    // append the rectangles for the bar chart
    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
            return x(d.key);
        })
        .attr("width", x.bandwidth())
        .attr("y", function(d) {
            return y(d.value);
        })
        .attr("height", function(d) {
            return height - y(d.value);
        });



    var range = getBlockDomain();

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", -10)
        .style("font-size","16px")
        .text("Number of Transactions over Time");
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height+70)
        .style("font-size","14px")
        .text(month[range[0].getMonth()] + " " + range[0].getDate() + ", " + range[0].getFullYear() + " - " + month[range[1].getMonth()] + " " + range[0].getDate() + ", " + range[1].getFullYear());

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.selectAll(".bar-label")
        .data(data)
        .enter().append("text")
        .text(function(d) {
            return d.value;
        })
        .attr("class", "bar-label")
        .attr("text-anchor", "middle")
        .attr("x", (function(d) {
            return x(d.key) + x.bandwidth() / 2;
        }))
        .attr("y", function(d) {
            return y(d.value) + 15;
        });
}

function formatDate(date) {
    var day = date.getDate();
    var year = date.getFullYear();
    return (date.getMonth() + 1) + '/' + day + '/' + year;
}



function formatAMPM(date) {
    var hours = date.getHours();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var strTime = hours + ampm;
    return strTime;
}