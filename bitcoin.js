'use strict';

var transactions = [];
var exchangeRate;
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

window.onload = new function(){
    $.ajax({
        url: 'http://btc.blockr.io/api/v1/block/raw/last',
        type: "GET",
        dataType: "json",
        success: function (data) {
            lastBlockNum = data["data"]["height"];
            $.ajax({
                url: 'http://btc.blockr.io/api/v1/exchangerate/current',
                type: "GET",
                dataType: "json",
                success: function (data) {

                    exchangeRate = data["data"][0]["rates"]["BTC"];
                    console.log(lastBlockNum);
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
    Blocks = [];
}


function getLastNBlocksRecursive(n){

    $.ajax({
        url: "http://btc.blockr.io/api/v1/block/raw/"+ (lastBlockNum-n),
        type: "GET",
        dataType: "json",
        success: function (data) {
            Blocks.push( new Block( data["data"]["tx"].length, new Date( parseInt(data["data"]["time"])*1000 )));

            if(n!=1){
                getLastNBlocksRecursive(n-1);
            }
            if(n==1){

                $("#loading").css("visibility","hidden");
                makeTempCSV();
                //makeHistogram();
                changeTXNumGraph();

            }
        },
        error: function(data){
            console.log(data);
            alert("We have made too many requests to the API. Wait a while before making another call.");
        }
    });

}

function getFirstBlocks(){
    clearSVG();
    $("#loading").css("visibility","visible");
    getNFirstBlocksRecursive(document.getElementById("numBlocks").value, 1);
}

function getLastBlocks(){
    clearSVG();
    $("#loading").css("visibility","visible");
    getLastNBlocksRecursive(document.getElementById("numBlocks").value);
}

  function getNFirstBlocksRecursive(n,start){
    $("#loading").show();
      $.ajax({
          url: "http://btc.blockr.io/api/v1/block/raw/"+start,
          type: "GET",
          dataType: "json",
          success: function (data) {
              Blocks.push( new Block(data["data"]["tx"].length, new Date( parseInt(data["data"]["time"])*1000 )));

              if(start!=n){
                  getNFirstBlocksRecursive(n,start+1);
              }
              if(start==n){
                  $("#loading").css("visibility","hidden");
                  makeTempCSV();
                  //createHistogram();
                  changeTXNumGraph();
              }
          },
          error: function(data){
              console.log(data);
              alert("We have made too many requests to the API. Wait a while before making another call.");
          }
      });
}

function getTxRange(){
      var lowest = Number.MAX_SAFE_INTEGER;
      var highest = Number.MIN_VALUE;
      for(var x=0;x<Blocks.length;x++){
          if(Blocks[x].numTx > highest){
              highest = Blocks[x];
          }
          if(Blocks[x].numTx < lowest){
              lowest = Blocks[x];
          }
      }
      var x = [];
      x.push(Math.max(0,lowest-100),highest+100);
      return x;
}

function getBlockDomain(){
    var x = [];

    if(Blocks.length!=0 || Blocks.length != 1) {
        var d1 = new Date(Blocks[0].date);
        var d2 = new Date(Blocks[Blocks.length-1].date);

        if(d1 < d2){
            x.push(d1);
            x.push(d2);
        }
        else{
            x.push(d2);
            x.push(d1);
        }

        x[0].setHours(x[0].getHours() - 1);
        x[1].setHours(x[1].getHours() + 1);

        return x;
    }

}

function createHistogram(){

    var parseDate = d3.timeParse("%m/%d/%Y %H:%M:%S %p"),
      formatCount = d3.format(",.0f");

    var margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

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

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", 10)
        .text(month[Blocks[0].date.getMonth()] + " " + Blocks[0].date.getFullYear());

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

    var margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        padding = 100;

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)



    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleOrdinal();

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = Blocks;
    x.domain(getBlockDomain());

    y.domain(getTxRange());

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(Blocks.length));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(20))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Number of Transactions");



    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.date.toISOString().slice(0, 10));
        })
        .attr("y", function (d) {
            return y(d.numTx);
        })
        //.attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.length);
        })
}

function makeTempCSV(){
    var str = "id,numTx,date\n";
    for(var x=0;x<Blocks.length;x++){
        str += x + ","+Blocks[x].numTx+","+Blocks[x].date+"\n";
    }
    console.log(str);
}
