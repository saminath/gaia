
var nfcSms = {

createSmsNdefRecord: function(sms) {
  var record = new MozNdefRecord();

  record.tnf = nfc.tnf_well_known;
  record.type = nfc.rtd_uri;
  record.id = null;
  
  // Payload:
  var prefix = 0x00; // No Prefix.
  var payload = String.fromCharCode(prefix) + "sms:"+sms.phoneNumber+"?body="+sms.message;
  record.payload = payload;

  return record;
}

}
