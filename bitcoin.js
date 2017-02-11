  'use strict';

var transactions = new Array();
var exchangeRate;
var lastBlockNum;

function Block(blockNum, numTx, date) {
    this.id = blockNum;
    this.case = numTx;
    this.date = date;
}

var Blocks = new Array();

window.onload = new function(){
    $.ajax({
        url: 'http://btc.blockr.io/api/v1/block/raw/last',
        type: "GET",
        dataType: "json",
        success: function (data) {
            lastBlockNum = data["data"]["height"];
        },
        error: function(data){
            console.log(data);
        }
    });
    $.ajax({
        url: 'http://btc.blockr.io/api/v1/exchangerate/current',
        type: "GET",
        dataType: "json",
        success: function (data) {

            lastBlockNum = data["data"]["height"];
        },
        error: function(data){
            console.log(data);
        }
    });

}

function getNFirstBlocks(){
  var i=0;
  for(i=1;i<=document.getElementById("numBlocks").value;i++){
    getABlock(i);
  }
}

function getNLastBlocks(n){
  var i=0;
  for(i=lastBlockNum;i>lastBlockNum-n;i--){
    getABlock(i);

  }

}

function getABlock(n){
  $.getJSON("http://btc.blockr.io/api/v1/block/raw/"+n, function(data){
    var b = new Block(n, data["data"]["tx"].length, new Date( parseInt(data["data"]["time"])*1000 ));
    Blocks.push(b);
  });
}

function getBlockDomain(){
    var x = new Array();
    if(Blocks.length!=0 || Blocks.length != 1) {
        if(Blocks[0].date < Blocks[Blocks.length-1].date){
            x.push(Blocks[0].date);
            x.push(Blocks[Blocks.length-1].date);
        }
        else{
            x.push(Blocks[0].date);
            x.push(Blocks[Blocks.length-1].date);
        }

        x[0].setDate(x[0].getDate() - 1);
        x[1].setDate(x[1].getDate() + 1);

        console.log(x);

        return x;
    }

}

function createHistogram(){
    console.log(Blocks);

    var parseDate = d3.timeParse("%m/%d/%Y %H:%M:%S %p"),
      formatCount = d3.format(",.0f");

    var margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
        console.log(getBlockDomain());
    var x = d3.scaleTime()
        .domain(getBlockDomain())
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var histogram = d3.histogram()
        .value(function(d) { return d.date; })
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

    console.log(Blocks);
    var bins = histogram(Blocks);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);
        var bar = svg.selectAll(".bar")
            .data(bins)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

       bar.append("rect")
            .attr("x", 1)
            .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
            .attr("height", function(d) { return height - y(d.length); });

       bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", function(d) { return (x(d.x1) - x(d.x0)) / 2; })
            .attr("text-anchor", "middle")
            .text(function(d) { return formatCount(d.length); });

}
