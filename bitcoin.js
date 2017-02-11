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
           // alert(data["message"]);
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
//            alert(data["message"]);
        }
    });

}

function getNFirstBlocks(n){
  var i=0;
  for(i=1;i<=n;i++){
    getABlock(i);
  }makeTempCSV();
}

function getNLastBlocks(n){
  var i=0;
  for(i=lastBlockNum;i>lastBlockNum-n;i--){
    getABlock(i);
  }makeTempCSV();
 // console.log(Blocks);

}


function getABlock(n){
  $.getJSON("http://btc.blockr.io/api/v1/block/raw/"+n, function(data){
    //lastBlockNum = data["data"]["height"];


    var b = new Block(n, data["data"]["tx"].length, new Date( parseInt(data["data"]["time"])*1000 ));
    Blocks.push(b);
  });


}

function getBlockDomain(){
    var x = new Array();
    if(Blocks.length!=0 || Blocks.length != 1) {
        if(Blocks[0].date < Blocks[Blocks.length - 1]){
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
    var str = "id,case,date\n";
    for(var x=0;x<Blocks.length;x++){
        str += Blocks[x].id + ","+Blocks[x].case+","+Blocks[x].date+"\n";
    }
    console.log(str);

}
