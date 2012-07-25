/* URL NDEF tag */
// Depends on nfc_consts.js

var nfcUrl = {

// Returns a json object matching record type.
lookupUrlRecordType: function (uri) {
  // Skip the first value, which is not used.
  for (var i = 1; i < nfc.uris.length; i++) {
    var len = nfc.uris[i].length;
    if (uri.substring(0, len) == nfc.uris[i]) {
      uriPayload = uri.substring(len);
      return {'identifier' : i, 'uri' : uriPayload}
    }
  }
  return {'identifier' : "\u0000", 'uri' : uri};
},

// Creates a single non-Array NdefRecord for a URL.
// Abbreviate will shorten the protocol of that url
createUriNdefRecord: function (uri, abbreviate) {
  var uriPayload = null;
  var record = new MozNdefRecord();

  if (uri == null) {
    return null;
  }

  // Take each known URL type prefix, and check against URL.
  // It is appropriate to do deeper checking in the application
  // context to check prefixes.
  if (abbreviate == true) {
    var split = this.lookupUrlRecordType(uri);
    if (split.identifier == 0) {
      urlPayload = uri; // unmodified.
    } else {
      urlPayload = String.fromCharCode(split.identifier) + split.uri;
    }
  } else {
    urlPayload = url; // unmodified.
  }
  console.log("Current URL payload: " + urlPayload);

  record.tnf = nfc.tnf_well_known; // NFC Forum Well Known type
  record.type = nfc.rtd_uri; // URL type
  record.id = null;
  record.payload = urlPayload;

  return record;
}

} // end nfcUrl
