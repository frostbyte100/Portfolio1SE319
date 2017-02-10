  'use strict';

  var transactions = new Array();

var exchangeRate;
function showData(){

  $.getJSON("http://btc.blockr.io/api/v1/exchangerate/current", function( data ) {
    //console.log(data);
//    console.log(data["data"][0]["rates"]["BTC"]);
    exchangeRate = data["data"][0]["rates"]["BTC"];
});

}
