/* NDef tag submission functions */

function NdefWrite(message) {
  console.log("Writing this to Nfc: " + message);
  navigator.mozNfc.sendToNfcd(message);
}

function validateNdefTagRecords(ndefRecords) {
  if (ndefRecords instanceof Array) {
    return navigator.mozNfc.validateNdefTag(ndefRecords);
  } else {
    return false;
  }
}

/**
 * Returns a request object. To observe the result, define and
 * attach callbacks taking an event to the request's onsuccess
 * and onerror.
 */
function writeRecordArrayTag(ndefRecords, p2p) {
  if (ndefRecords == null) {
    return null;
  }
  var domreq = navigator.mozNfc.writeNdefTag(ndefRecords);
  console.log("Returned from writeNdefTag call");
  return domreq;
}


/**
 * NDEF well known types:
 */
// Text Example:
function textFormToNdefRecord(elementRef) {
  var text = $(elementRef + " > .text").val();
  record = nfcText.createTextNdefRecord_Utf8(text, "en");
  return record;
}


// URL:
function urlFormToNdefRecord(elementRef, abbreviate) {
  var uri = $(elementRef + " > .uri").val();
  record = nfcUri.createUriNdefRecord(uri, abbreviate);
  return record;
}

// SmartPoster URI:
function smartPosterUriFormToNdefRecord(elementRef) {
  var title = $(elementRef + " > .title").val();
  var uri = $(elementRef + " > .uri").val();
  var titlelang = $(elementRef + " > .titleLang").val();
  var aTitle = {"title": title, "lang": titlelang};
  record = nfcSmartPoster.createUriNdefRecord(uri, aTitle, nfcSmartPoster.doAction);
  return record;
}

// Email:
function emailFormToNdefRecord(elementRef) {
  var mailto = $(elementRef + " > .emailMailTo").val();
  var subject = $(elementRef + " > .emailSubject").val();
  var body = $(elementRef + " > .emailBody").val();
  record = nfcUri.createEmailNdefRecord({"mailto" : mailto, "subject" : subject, "body" : body});
  return record;
}

// SmartPoster Email:
function smartPosterEmailFormToNdefRecord(elementRef) {
  var title = $(elementRef + " > .title").val();
  var titlelang = $(elementRef + " > .titleLang").val();
  var mailto = $(elementRef + " > .emailMailTo").val();
  var subject = $(elementRef + " > .emailSubject").val();
  var body = $(elementRef + " > .emailBody").val();
  var aTitle =  {"title": title, "lang": titlelang};
  record = nfcSmartPoster.createEmailNdefRecord({"mailto" : mailto, "subject" : subject, "body" : body}, aTitle, nfcSmartPoster.doAction);
  return record;
}

// SMS:
function smsFormToNdefRecord(elementRef) {
  var phoneNumber = $(elementRef + " > .smsPhoneNumber").val();
  var message = $(elementRef + " > .smsMessage").val();
  record = nfcSms.createSmsNdefRecord({"phoneNumber" : phoneNumber, "message" : message});
  return record;
}


// Basic Contact Example 
// (Format reference: http://www.w3.org/TR/2012/WD-contacts-api-20120712/#the-contact-dictionary)
function contactFormToNdefRecord(elementRef) {
  var record = new MozNdefRecord();

  record.tnf = $(elementRef + " > .nfc_contact_tnf").val(); // nfc.flags_tnf; // From tag itself.
  record.type = $(elementRef + " > .nfc_contact_type").val(); // text/VCard
  record.id = $(elementRef + " > .nfc_contact_id").val(); // empty

  /* payload */
  var fname = $(elementRef + " > .nfc_contact_payload_name_first").val();
  var lname = $(elementRef + " > .nfc_contact_payload_name_last").val();
  var mname1 = $(elementRef + " > .nfc_contact_payload_name_middle_1").val();
  var mname2 = $(elementRef + " > .nfc_contact_payload_name_middle_2").val();

  var fullname = $(elementRef + " > .nfc_contact_payload_name_fullname").val();
  var telephone = $(elementRef + " > .nfc_contact_payload_telephone").val();
  var mobile = $(elementRef + " > .nfc_contact_payload_mobile").val();

  console.log("Form processing Results: " +
              "FirstName: " + fname + " LastName: " + lname +
              " MiddleName1: " + mname1 + " MiddleName2: " + mname2 +
              " FullName: " + fullname + " Telephone: " + telephone +
              " Mobile: " + mobile);

  // payload:
  var payload = "BEGIN:VCARD\n";
  payload += "VERSION:2.1\n";
  payload += "N:"+lname+";"+fname+";"+mname1+";"+mname2+";\n";
  payload += "FN:"+fullname+"\n";

  if (telephone) {
    payload += "TEL:"+telephone+";";
  } else {
    payload += "TEL;";
  }

  if (mobile) {
    payload += "CELL:"+mobile+"\n";
  } else {
    payload += "CELL\n";
  }

  payload += "END:VCARD";

  record.payload = payload;

  // See if Moz object actually has values:
  console.log("payload print(intended: " + payload + ")");
  console.log("tnf(" + record.tnf + ")");
  console.log("type(" + record.type + ")");
  console.log("id(" + record.id + ")");
  console.log("payload(" + record.payload + ")");

  return record;
}

