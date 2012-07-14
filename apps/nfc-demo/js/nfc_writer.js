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
        payload += "CELL:"+mobile+";\n";
    } else {
        payload += "CELL;\n";
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


// Convienience function for writeContactArrayTag
function writeContactTag(ndefRecord) {
    var records =  new Array();
    records.push(ndefRecord);
    return writeContactArrayTag(records);
}

// Returns a request object. To observe the result, define and
// attach callbacks taking an event to the request's onsuccess
// and onerror.
function writeContactArrayTag(ndefRecords) {

    if (ndefRecords == null) {
        return;
    }
    var req = navigator.mozNfc.writeNdefTag(ndefRecords);
    console.log("Returned from writeNdefTag call");
    return req;
}

function writeURLTag() {
}

function createNfcTagList(targetId) {
    $(targetId).append();
}

