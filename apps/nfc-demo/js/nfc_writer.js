/* NDef tag submission functions */
var nDefJson = '{"type": "ndefDiscovered", "content": { "records": [{ "tnf": "2", "type": "dGV4dC94LXZDYXJk", "id": "", "payload": "QkVHSU46VkNBUkQNClZFUlNJT046Mi4xDQpOOkRvZTtKb2huOzs7DQpGTjpKb2huIERvZQ0KVEVMO0NFTEw6NjUwMjI5NDc5Nw0KRU5EOlZDQVJEDQo=" } ] }}';

function NdefWrite(message) {
    console.log("Writing this to Nfc: " + message);
    navigator.mozNfc.sendToNfcd(message);
}

function validateJson(message) {
    return true;
}

function contactFormToNdefRecord() {
    var record = new MozNdefRecord();
    //var record = new NdefRecord();
    
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


    return record;
}


// Convienience function for writeContactArrayTag
function writeContactTag(ndefRecord) {
    var records =  new Array();
    records.push(ndefRecord);
    writeContactArrayTag(records);
}

function writeContactArrayTag(ndefRecords) {

    if (!ndefRecords) {
        return;
    }

    // Create JSON record
    var jsonRecordStr = JSON.stringify(records);
    var prefix = '{"type": "ndefDiscovered", "content": ';
    var suffix = "}";
    jsonRecordStr = prefix + jsonRecords + suffix;
    var jsonRecords = JSON.parse(jsonRecordStr);

    console.log("JSON record before encode: <" + JSON.stringify(jsonRecords) + ">");
    // encode applicable fields for transport (TODO: move this code to NdefWrite)
    for (i = 0; i < jsonRecords.length; i++) {
        jsonRecords[i].type += window.btoa(jsonRecords[i].type);
        jsonRecords[i].id += window.btoa(jsonRecords[i].id);
        jsonRecords[i].payload += window.btoa(jsonRecords[i].payload);
    }

    jsonRecordStr = JSON.stringify(jsonRecords);
    console.log("JSON record after encode: <" + jsonRecordStr + ">");

    NdefWrite(jsonRecordStr);
}

function writeURLTag() {
}

function createNfcTagList(targetId) {
    $(targetId).append();
}
