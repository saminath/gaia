
function showRecord(record) {

    if (!record) {
        console.log("showRecord: Record is null");
        return;
    }

    console.log("Record: " + "[" +
        records[0].tnf + "][" +
        records[0].type + "][" +
        records[0].id + "][" +
        records[0].payload + "]");

    NdefWrite(jsonRecords);
}
