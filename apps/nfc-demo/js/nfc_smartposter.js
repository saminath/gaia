
var nfcSmartPoster = {

// Action Record Values:
doAction: 0x00,
saveForLaterAction: 0x01,
openForEditingAction: 0x02,
RFUAction: 0x03, // Reserved

// There is no specified standard for field order for the parts of the email
// message. Example format: email URI followed by the action requesting the
// reciever is requested to send it.
// mail parameter format: {"mailto" : emailAddress, "subject" : subjectLine, "body" : emailMessageBody}
// Action: See constants of nfcSmartPoster.
createEmailNdefRecord: function(mail, receiverAction) {
  var records;
  var main = new MozNdefRecord();

  main.tnf = nfc.tnf_well_known;
  main.type = nfc.rtd_smart_poster;
  main.id = null;
  main.payload = null;

  // Sub-payloads attached to above payload

  var uriType = nfc.rtd_uri;
  var recordTypeLen = 1;
  var recordType = nfc.rtd_uri;
  var prefix = 0x06; // mailto: URI
  var uri = mail.mailto+"?"+"subject="+mail.subject+"&"+"body"+mail.body;
  var uriPayloadLen = 1 + uri.length; // length of prefix and email
  var uriRec = String.fromCharCode(nfc.tnf_well_known) + String.fromCharCode(recordTypeLen) + String.fromCharCode(uriPayloadLen);
  uriRec += uriType + String.fromCharCode(prefix) + uri;


  if (receiverAction === undefined) {
    // no action specified.
    main.payload = uriRec;
  } else {
    // Action sub-payload for receiver of message.
    if (receiverAction < this.doAction || receiverAction > this.RFUAction) {
      debug("Bad action");
      return null;
    }
    var actionLen = 3;
    var payloadLen;
    var action = doAction;
    var actionRec = String.fromCharCode(nfc.tnf_well_known) + String.fromCharCode(actionLen) + String.fromCharCode(1);
    actionRec += "act" + String.fromCharCode(action);
    main.payload = uriRec + actionRec; 
  }

  return main;
}

}
