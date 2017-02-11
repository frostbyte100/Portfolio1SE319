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

function getLastNBlocksRecursive(n){
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
                makeTempCSV();
            }
        },
        error: function(data){
            console.log(data);
            alert("We have made too many requests to the API. Wait a while before making another call.");
        }
    });
}
  function getNFirstBlocksRecursive(n,start){
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
    //lastBlockNum = data["data"]["height"];


    var b = new Block(n, data["data"]["tx"].length, new Date( parseInt(data["data"]["time"])*1000 ));
    Blocks.push(b);

  });




}

function getBlockDomain(){
    var x = [];
    if(Blocks.length!=0 || Blocks.length != 1) {
        if(Blocks[0].date < Blocks[Blocks.length - 1].date){
            x.push(Blocks[0].date);
            x.push(Blocks[Blocks.length - 1].date);
        }
        else{
            x.push(Blocks[Blocks.length - 1].date);
            x.push(Blocks[0].date);
        }
        return x;
    }



}

function getTx(txString){

  $.getJSON("http://btc.blockr.io/api/v1/tx/info/"+txString, function(data){

  });
}


function makeTempCSV(){
    var str = "id,numTx,date\n";
    for(var x=0;x<Blocks.length;x++){
        str += Blocks[x].id + ","+Blocks[x].numTx+","+Blocks[x].date+"\n";
    }
    console.log(str);
}
