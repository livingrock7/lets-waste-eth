import logo from './logo.svg';
import {makeStyles} from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import {Box} from "@material-ui/core";
import Web3 from "web3";
import { Web3Provider } from 'web3-react';
import Button from "@material-ui/core/Button";
import React, { useState, useEffect } from "react";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import './App.css';

let web3,provider;

const useStyles = makeStyles((theme) => ({
  root: {
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
  link: {
    marginLeft: "5px"
  }
}));

function multiply(x, y) {
  var prod = [];
  var i;
  for (i=0; i < x.length; i++) {
    prod[i] = x[i] * y[i];
  }
  return prod;
}

function comma(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function App() {

  const classes = useStyles();
  const preventDefault = (event) => event.preventDefault();
  const [selectedAddress, setSelectedAddress] = useState("");
  /**
   * total gas used : gasUsed from every outgoing transactions 
   * total gas fees
   * total gas price
   */

  useEffect(() => {
    async function init() {
      if (
        typeof window.ethereum !== "undefined" &&
        window.ethereum.isMetaMask
      ) {
        // Ethereum user detected. You can now use the provider.
          provider = window["ethereum"];
          await provider.enable();
          web3 = new Web3(provider);
          console.log(web3);
          setSelectedAddress(provider.selectedAddress);

          provider.on("accountsChanged", function(accounts) {
            setSelectedAddress(accounts[0]);
          });
        
        // web3 initializations
      } else {
        showErrorMessage("Metamask not installed");
      }
    }
    init();
  }, []);


  const getEthPrice = (eth) => {
    fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log('ETHUSD: ' + data.USD);
      // display eth price in UI : $ + comma((data.USD*eth/1e18).toFixed(2))
      return data.USD;
    })
    .catch(err => {
      console.log('could not fetch data', err);
    })
  }
  
  const ethusd = () => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log('ETHUSD: ' + data.ethereum.usd);
      return data.ethereum.usd;
    })
    .catch(err => {
      console.log('could not fetch data', err);
    })
  }


  const getTxs = async (address) => {
    var ethusd = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
    .then(response => {return response.json()})
    .catch(err => {
      console.log('not found', err);
    })
    if (ethusd.hasOwnProperty('Response')) {
      ethusd = null;
      console.log('Could not get ETH/USD price.')
      console.log(ethusd.Message);
    } else {
      ethusd = ethusd.USD;
      console.log('ETHUSD: $' + ethusd);
    }
    
    let key = "3FGUI5KS2E7W7CKP3MMRQJWX8DZD4E44GT";
    var url = `https://kovan.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${key}`;
    var response = await fetch(url);
    if (response.ok) { // if HTTP-status is 200-299
      // get the response body (the method explained below)
      var json = await response.json();
    } else {
      console.error("HTTP-Error: " + response.status);
    }
    var txs = json['result'];
    var n = txs.length;
    var from, txs2;
    while (n===10000) {
      from = txs[txs.length - 1].blockNumber
      url = `https://kovan.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${from}&endblock=99999999&sort=asc&apikey=${key}`
      response = await fetch(url)
      if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        json = await response.json();
      } else {
        console.log('¯\_(ツ)_/¯ : ' + response.status);
        break
      }
      txs2 = json['result'];
      n = txs2.length
      txs.push.apply(txs, txs2)
    }

    var txsOut;
    //Filter outgoing transactions here
    //txsOut = txs.map function(tx) {
    // return tx.from === address.toLowerCase();
    //});
    
    /*txsOut = txsOut.filter((v,i,a)=>a.findIndex(t=>(t.nonce === v.nonce))===i)
    // ^ https://stackoverflow.com/a/56757215/489704 @chickens
    //   To remove duplicates
    //localStorage.setItem('txsOut', JSON.stringify(txsOut));*/
    console.log('All outgoing txs:', txsOut)
    
    var nOut = txsOut.length;
    /*$('#nOut').text(nOut);*/

    // Find out failed transactions
   
    var txsOutFail;
    /*txsOutFail = $.grep(txsOut, function(v) {
      return v.isError === '1';
    });*/
    var nOutFail = txsOutFail.length;
    
    /*$('#nOutFail').text(nOutFail);
    console.log('Failed outgoing txs:', txsOutFail);*/
    
    // calcs
    // TBD
    if (nOut > 0) {
      var gasUsed = txsOut.map(value => parseInt(value.gasUsed));
      var gasUsedTotal = gasUsed.reduce((partial_sum, a) => partial_sum + a,0); 
      var gasPrice = txsOut.map(value => parseInt(value.gasPrice));
      var gasPriceMin = Math.min(...gasPrice);
      var gasPriceMax = Math.max(...gasPrice);
      var gasFee = multiply(gasPrice, gasUsed)
      var gasFeeTotal = gasFee.reduce((partial_sum, a) => partial_sum + a,0); 
      var gasPriceTotal = gasPrice.reduce((partial_sum, a) => partial_sum + a,0);
      var gasUsedFail = txsOutFail.map(value => parseInt(value.gasUsed));
      var gasPriceFail = txsOutFail.map(value => parseInt(value.gasPrice));
      var gasFeeFail = multiply(gasPriceFail, gasUsedFail)
      var gasFeeTotalFail = gasFeeFail.reduce((partial_sum, a) => partial_sum + a,0); 
      /*$('#gasUsedTotal').text(comma(formatter(gasUsedTotal)));
      $('#gasPricePerTx').text(comma((gasPriceTotal/nOut/1e9).toFixed(1)));
      $('#gasPricePerTx').hover(function() {
        $(this).css('cursor', 'help').attr('title', 'Min: ' + (gasPriceMin/1e9).toFixed(3) + '; Max: ' + (gasPriceMax/1e9).toFixed(3));
        Tipped.create('#gasPricePerTx', 'Min: ' + (gasPriceMin/1e9).toFixed(1) + '; Max: ' + (gasPriceMax/1e9).toFixed(1), { offset: { y: 20 } });
      }, function() {
        $(this).css('cursor', 'auto');
      });*/

     // $('#gasFeeTotal').text('Ξ' + comma((gasFeeTotal/1e18).toFixed(3)));
      
      if (nOutFail > 0) {
        //$('#gasFeeTotalFail').html('Ξ' + (gasFeeTotalFail/1e18).toFixed(3));
        var oof = Math.max(...gasFeeFail)/1e18;
        if (oof > 0.1) {
          var i = gasFeeFail.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
          var tx = txsOutFail[i];
         /* $('p').last().append(' <a id="oof" href="https://etherscan.io/tx/' + 
          tx.hash + '">This one</a> cost <span id="oofCost">Ξ' + 
          (gasFeeFail[i]/1e18).toFixed(3) + '</span>.')*/
        }
      }  else {
       // $('#gasFeeTotalFail').html('nothing');
      }
      if (ethusd !== null) {
        //$('#ethusd').text('$' + comma(formatter((ethusd*gasFeeTotal/1e18).toFixed(2))));
        //$('#oofCost').append(' ($' + comma(formatter((ethusd*gasFeeFail[i]/1e18).toFixed(2))) + ')');
      }
      
    } else {
      //$('#gasUsedTotal').text(0);
      //$('#gasFeeTotal').text('Ξ' + 0);
    }
  }

  

  const showErrorMessage = message => {
    NotificationManager.error(message, "Error", 5000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Getting transactions for below address 
        </p>
      </header>
      <div className="mb-wrap mb-style-2">
          <blockquote cite="http://www.gutenberg.org/ebboks/11">
            <p>{selectedAddress}</p>
          </blockquote>
      </div>
    </div>
  );
}

export default App;
