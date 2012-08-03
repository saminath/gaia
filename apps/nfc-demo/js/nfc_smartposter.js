
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
createEmailNdefRecord: function(mail, lang, receiverAction) {
  var records;
  var main = new MozNdefRecord();

  main.tnf = nfc.tnf_well_known;
  main.type = nfc.rtd_smart_poster;
  main.id = null;
  main.payload = null;

  // Sub-payloads attached to above payload

  var uriType = nfc.rtd_uri;
  var recordTypeLen = 1;
  var prefix = 0x06; // mailto: URI
  var uri = mail.mailto+"?"+"subject="+mail.subject+"&"+"body"+mail.body;
  alert("Mail: " + mail + " mail.mailto: " + mail.mailto + " subject: " + mail.subject + " body: " + mail.body);
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
    var action = this.doAction;
    var actionRec = String.fromCharCode(nfc.tnf_well_known) + String.fromCharCode(actionLen) + String.fromCharCode(1);
    actionRec += "act" + String.fromCharCode(action);
    main.payload = uriRec + actionRec;
  }

  return main;
},

createUriNdefRecord: function (aUri, aTitle, aLang, aAction) {
  var records;
  var main = new MozNdefRecord();

  main.tnf = nfc.tnf_well_known;
  main.type = nfc.rtd_smart_poster;
  main.id = null;
  main.payload = null;
  var uriRec = null;
  var actionRec = null;
  var titleRec = null;

  // Sub-payloads attached to above payload

  var uriType = nfc.rtd_uri;
  var split = nfcUrl.lookupUrlRecordType(aUri);
  var prefix = split.identifier;
  var uri = split.uri;
  var uriTypeLen= 1;

  // URI: Sub record.
  var uriPayloadLen = 1 + uri.length; // length of prefix and email
  var uriRec = String.fromCharCode(nfc.tnf_well_known) + String.fromCharCode(uriTypeLen) + String.fromCharCode(uriPayloadLen);
  uriRec += uriType + String.fromCharCode(prefix) + aUri;
  main.payload = uriRec;
/*
  // Action: Sub record.
  if (aAction === undefined) {
    debug("Bad action");
    return null;
  } else if ((aAction > this.doAction) || (aAction < this.RFUAction)) {
    actionRec = String.fromCharCode(nfc.tnf_well_known) + String.fromCharCode(3) + String.fromCharCode(1);
    actionRec += "act" + String.fromCharCode(aAction);
  } else {
    debug("Invalid action number");
    return null;
  }

  // Title of record:
  title = aTitle;
  if (title == null || title === undefined) {
    main.payload = uriRec + actionRec; // Len calculated by NFC lib?
    return main;
  }
  var titlePayloadLen = 1 + aLang.length + aTitle.length;
  titleRec = String.fromCharCode(nfc.tnf_well_known) + String.fromCharCode(nfc.rtd_text.length) + titlePayloadLen;
  titleRec += nfc.rtd_text + aLang + aTitle;
  main.payload =  uriRec + actionRec + titleRec;
*/
  return main;
}

}
