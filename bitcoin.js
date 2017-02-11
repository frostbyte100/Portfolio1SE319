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
  //Gets Lasts Block's NUmber
  $.getJSON("http://btc.blockr.io/api/v1/block/raw/last", function(data){
    lastBlockNum = data["data"]["height"];
  });
  $.getJSON("http://btc.blockr.io/api/v1/exchangerate/current", function( data ) {
    exchangeRate = data["data"][0]["rates"]["BTC"];
  });
}

function getNFirstBlocks(n){
  var i=0;
  for(i=0;i<n;i++){
    getABlock(i);
  }
}

function getNLastBlocks(n){
  var i=0;
  for(i=lastBlockNum;i>lastBlockNum-n;i--){
    getABlock(i);
  }
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
        if(Blocks[0].date < Blocks[blocks.length - 1]){
            x.push(Blocks[0]);
            x.push(Blocks[Blocks.length - 1]);
        }
        else{
            x.push(Blocks[Blocks.length - 1]);
            x.push(Blocks[0]);
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
