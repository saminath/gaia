/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

(function() {
  /**
   * Constants
   */
  var DEBUG = true;

  /**
   * Debug method
   */
  function debug(msg, optObject) {
    if (DEBUG) {
      var output = '[DEBUG] SYSTEM NFC: ' + msg;
      if (optObject) {
        output += JSON.stringify(optObject);
      }
      console.log(output);
    }
  }

  debug(" Initializing NFC Message %%%%%%%%%%%%%%%%%%%%%%");
  // Register to receive Nfc commands
  window.navigator.mozSetMessageHandler('nfc-ndef-discovered', handleNdefDiscoveredCommand);
  window.navigator.mozSetMessageHandler('nfc-ndef-disconnected', handleNdefDisconnected);
  window.navigator.mozSetMessageHandler('nfc-request-status', handleWriteRequestStatus);
  window.navigator.mozSetMessageHandler('secureelement-activated', null);
  window.navigator.mozSetMessageHandler('secureelement-deactivated', null);
  window.navigator.mozSetMessageHandler('secureelement-transaction', null);

  /**
   * Local functions
   */
  function launchBrowser(url) {
    var a = new MozActivity({
      name: 'view',
      data: {
        type: 'url',
        url: 'http://www.nytimes.com'
      }
    });
  }

  function launchDialer(info) {
    var a = new MozActivity({
      name: 'dial',
      data: {
        type: 'webtelephony/number',
        number: '4085551234'
      }
    });
  }

  function handleWellKnownTypes(tag) {
    var url = 'http://www.nytimes.com';
    // Launch NFC demo
    var a = new MozActivity({
      name: 'nfc-ndefmessage',
      data: {
        type: 'url',
        //blobs: [tag]
        url: url
      }
    });
    //launchBrowser(url);
    launchDialer(url);
    return true;
  }

  function handleNdefDiscoveredCommand(command) {
    debug("NdefDiscovered command playload: " + JSON.stringify(command));
    // Send activity to listeners:
    if(handleWellKnownTypes(command)) {
      return;
    } else {
      debug("Unimplemented. Handle Unknown type.");
    }

  }

  function handleWriteRequestStatus(command) {
    var a = new MozActivity({
      name: 'nfc-write-request-status',
      data: {
        type: 'info',
        message: ''
      }
    });
  }

  function handleNdefDisconnected(command) {
    var a = new MozActivity({
      name: 'nfc-ndefdisconnected',
      data: {
        type: 'info',
        message: ''
      }
    });
  }



})();
