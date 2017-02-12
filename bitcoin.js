  'use strict';

var transactions = [];
var exchangeRate;
var lastBlockNum;

function Block(blockNum, numTx, date) {
    this.id = blockNum;
    this.numTx = numTx;
    this.date = date;
}

var Blocks = [];

window.onload = new function(){
    $.ajax({
        url: 'http://btc.blockr.io/api/v1/block/raw/last',
        type: "GET",
        dataType: "json",
        success: function (data) {
            lastBlockNum = data["data"]["height"];
            console.log(lastBlockNum);
            $.ajax({
                url: 'http://btc.blockr.io/api/v1/exchangerate/current',
                type: "GET",
                dataType: "json",
                success: function (data) {

                    exchangeRate = data["data"][0]["rates"]["BTC"];
                    console.log(exchangeRate);
                },
                error: function(data){
                    console.log(data);
                    alert("We have made too many requests to the API. Wait a while before making another call.");
                }
            });
        },
        error: function(data){
            console.log(data);
           alert("We have made too many requests to the API. Wait a while before making another call.");
        }
    });


};

function clearSVG(){

    $( "body" ).find( "svg").remove();
}


function getLastNBlocksRecursive(n){

    $("#loading").show();
    $.ajax({
        url: "http://btc.blockr.io/api/v1/block/raw/"+ (lastBlockNum-n),
        type: "GET",
        dataType: "json",
        success: function (data) {
            Blocks.push( new Block(n, data["data"]["tx"].length, new Date( parseInt(data["data"]["time"])*1000 )));

            if(n!=1){
                getLastNBlocksRecursive(n-1);
            }
            if(n==1){

                $("#loading").hide();
                makeTempCSV();
                changeTXNumGraph();
            }
        },
        error: function(data){
            console.log(data);alert("We have made too many requests to the API. Wait a while before making another call.");
        }
    });

}

function getNFirstBlocks(){
  var i=0;
  for(i=1;i<=document.getElementById("numBlocks").value;i++){
    getABlock(i);
  }
}
  function getNFirstBlocksRecursive(n,start){
    $("#loading").show();
      $.ajax({
          url: "http://btc.blockr.io/api/v1/block/raw/"+start,
          type: "GET",
          dataType: "json",
          success: function (data) {
              Blocks.push( new Block(n, data["data"]["tx"].length, new Date( parseInt(data["data"]["time"])*1000 )));

              if(start!=n){
                  getNFirstBlocksRecursive(n,start+1);
              }
              if(start==n){
                  makeTempCSV();
                  changeTXNumGraph();
                  $("#loading").hide();
              }
          },
          error: function(data){
              console.log(data);
              alert("We have made too many requests to the API. Wait a while before making another call.");
          }
      });
  }


function getABlock(n){
  $.getJSON("http://btc.blockr.io/api/v1/block/raw/"+n, function(data){
    var b = new Block(n, data["data"]["tx"].length, new Date( parseInt(data["data"]["time"])*1000 ));
    Blocks.push(b);

  });

}

function getBlockDomain(){
    var x = [];
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



function changeTXNumGraph(){
    var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = Blocks;
    x.domain(data.map(function (d) {
        d.id;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.numTx;
    })]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(100, ""))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Frequency");


    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.id);
        })
        .attr("y", function (d) {
            return y(d.numTx);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.numTx);
        })
}

function createBarGraph() {

    getLastNBlocksRecursive(10);

}

function makeTempCSV(){
    var str = "id,numTx,date\n";
    for(var x=0;x<Blocks.length;x++){
        str += Blocks[x].id + ","+Blocks[x].numTx+","+Blocks[x].date+"\n";
    }
    console.log(str);
}
