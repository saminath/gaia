
var nfcSms = {

createSmsNdefRecord: function(sms) {
  var record = new MozNdefRecord();

  record.tnf = nfc.tnf_well_known;
  record.type = nfc.rtd_text;
  record.id = "";
  
  // Payload:
  var prefix = 0x00; // No Prefix.
  //var payload = String.fromCharCode(prefix) + "sms:"+sms.phoneNumber+"?body="+sms.message;
  payload = null;

  record.payload = payload;

  return record;
}

}
