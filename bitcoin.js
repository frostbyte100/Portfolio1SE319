  'use strict';

var transactions = new Array();
var exchangeRate;
var lastBlockNum;

window.onload = new function(){
  //Gets Lasts Block's NUmber
  $.getJSON("http://btc.blockr.io/api/v1/block/raw/last", function(data){
    lastBlockNum = data["data"]["height"];
    console.log(lastBlockNum);
  });
  $.getJSON("http://btc.blockr.io/api/v1/exchangerate/current", function( data ) {
    exchangeRate = data["data"][0]["rates"]["BTC"];
  });
}


function getTx(txString){

  $.getJSON("http://btc.blockr.io/api/v1/tx/info/"+txString, function(data){

  });
}
