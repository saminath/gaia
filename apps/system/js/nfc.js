/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

// The modal dialog listen to mozbrowsershowmodalprompt event.
// Blocking the current app and then show cutom modal dialog
// (alert/confirm/prompt)

var NfcEventManager = {

  init: function nfc_init() {
    // Add listeners for named events
    window.addEventListener('nfc-ndef-discovered', this, true);
    window.addEventListener('nfc-ndef-disconnected', this, true);
    window.addEventListener('nfc-ndef-write', this, true);
    window.addEventListener('nfc-request-status', this, true);
    window.addEventListener('nfc-ndef-push', this, true);
    window.addEventListener('nfc-secure-element-activated', this, true);
    window.addEventListener('nfc-secure-element-transaction', this, true);
    window.addEventListener('nfc-secure-element-deactivated', this, true);

    // Set message handlers for each named event
    window.navigator.mozSetMessageHandler('nfc-ndef-discovered',
      function handleDiscoveredCommand(command) {
        console.log("Ndef Tag Discovered Command: ["+JSON.stringify(command)+"]");
      }
    );
    window.navigator.mozSetMessageHandler('nfc-ndef-disconnected',
      function handleDisconnectedCommand(command) {
         console.log("Ndef Disconnected Command: ["+JSON.stringify(command)+"]");
      }
    );
    window.navigator.mozSetMessageHandler('nfc-ndef-write',
      function handleWriteCommand(command) {
        console.log("Ndef Tag Write Command: ["+JSON.stringify(command)+"]");
      }
    );
    window.navigator.mozSetMessageHandler('nfc-request-status',
      function handleRequestStatus(command) {
        console.log("Ndef Tag Status: ["+JSON.stringify(command)+"]");
      }
    );
    window.navigator.mozSetMessageHandler('nfc-ndef-push',
      function handleNdefPush(command) {
        console.log("Ndef Push Command: ["+JSON.stringify(command)+"]");
      }
    );
    window.navigator.mozSetMessageHandler('nfc-secure-element-activated',
      function handleSecureElementActivated(command) {
        console.log("Secure Element Activated: ["+JSON.stringify(command)+"]");
      }
    );
    window.navigator.mozSetMessageHandler('nfc-secure-element-transaction',
      function handleSecureElementTransaction(command) {
        console.log("Secure Element Transaction: ["+JSON.stringify(command)+"]");
      }
    );
    window.navigator.mozSetMessageHandler('nfc-secure-element-deactivated',
      function handleSecureElementDeactivated(command) {
        console.log("Secure Element Deactivated: ["+JSON.stringify(command)+"]");
      }
    );
  }

};

NfcEventManager.init();

