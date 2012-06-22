/* NDef tag submission functions */
var nDefJson = '{"type": "ndefDiscovered", "content": { "records": [{ "tnf": "2", "type": "dGV4dC94LXZDYXJk", "id": "", "payload": "QkVHSU46VkNBUkQNClZFUlNJT046Mi4xDQpOOkRvZTtKb2huOzs7DQpGTjpKb2huIERvZQ0KVEVMO0NFTEw6NjUwMjI5NDc5Nw0KRU5EOlZDQVJEDQo=" } ] }}';

function NdefWrite(message) {
    console.log("Writing this to Nfc: " + message);
    navigator.mozNfc.sendToNfcd(message);
}

function validateJson(message) {
    return true;
}


/* UI */
function writeContactTag() {
    /* single record only */
    var records = new Array();
    var record = {
       tnf: "",
       type: "",
       id: "",
       payload: ""
    };
    
    records[0] = record;

    // Globals
    record.tnf = $("#nfc_contact_tnf_id").val(); // nfc.flags_tnf; // From tag itself.
    record.type = $("#nfc_contact_type_id").val(); // text/VCard
    record.id = $("#nfc_contact_id_id").val(); // empty

    /* payload */
    var fname = $("#nfc_contact_payload_name_first_id").val();
    var lname = $("#nfc_contact_payload_name_last_id").val();
    var mname1 = $("#nfc_contact_payload_name_middle_1_id").val();
    var mname2 = $("#nfc_contact_payload_name_middle_2_id").val();

    var fullname = $("#nfc_contact_payload_name_fullname_id").val();
    var telephone = $("#nfc_contact_payload_telephone_id").val();
    var mobile = $("#nfc_contact_payload_mobile_id").val();

    console.log("FN: " + fname + " LN: " + lname + " MN1: " + mname1 + " MN2: " + mname2);

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
        payload += "CELL:"+mobile+";\n";
    } else {
        payload += "CELL;\n";
    }

    payload += "END:VCARD";

    record.payload = payload;

    console.log("Record: " + "[" +
        records[0].tnf + "][" +
        records[0].type + "][" +
        records[0].id + "][" +
        records[0].payload + "]");

    // Create JSON record, and encode to base64 for transport.
    var jsonRecords = '{ "records": [';
    for (var i = 0; i < records.length; i++) {
        jsonRecords += "{";
        
        jsonRecords += '"tnf": "' + records[i].tnf + '", ';
        jsonRecords += '"type": "' + window.btoa(records[i].type) + '", ';
        jsonRecords += '"id": "' + window.btoa(records[i].id) + '", ';
        jsonRecords += '"payload": "' + window.btoa(records[i].payload) + '"';
        
        jsonRecords += "}";
        if ( (i+1) < records.length ) {
            jsonRecords += ", "
        }
    }
    jsonRecords += '] }';
    var prefix = '{"type": "ndefDiscovered", "content": ';
    var suffix = "}";
    jsonRecords = prefix + jsonRecords + suffix;
  
    //console.log("JSON record: <" + jsonRecords + ">");
    

    /* add record headers (URL, UTF-8, etc), or let platform nxp generate do that (pass user data,
       it generates missing headers and NDefRecord[])? */
    NdefWrite(jsonRecords);
}

function createNfcTagList(targetId) {
    $(targetId).append();
}
