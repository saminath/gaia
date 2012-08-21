var nfcText = {

createTextNdefRecord_Utf8: function(text, lang) {
  var record = new MozNdefRecord();

  record.tnf = nfc.tnf_well_known;
  record.type = nfc.rtd_text;
  record.id = null;

  // Payload:
  var prefix = 0x02;
  var payload = String.fromCharCode(prefix) + lang + text;

  record.payload = payload;

  return record;
}

}
