/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

(function() {
  var DEBUG = true;
  var screenEnabled = false;
  var screenLocked = false;

  /**
   * Constants
   */
  var nfc = {
    flags_tnf: 0x07,
    flags_ss: 0x10,
    flags_il: 0x08,

    tnf_empty: 0x00,
    tnf_well_known: 0x01,
    tnf_mime_media: 0x02,
    tnf_absolute_uri: 0x03,
    tnf_external_type: 0x04,
    tnf_unknown: 0x05,
    tnf_unchanged: 0x06,
    tnf_reserved: 0x06,

    rtd_text: "T",
    rtd_uri: "U",
    rtd_smart_poster: "Sp",
    rtd_alternative_carrier: "ac",
    rtd_handover_carrier: "Hc",
    rtd_handover_request: "Hr",
    rtd_handover_select: "Hs",

    smartposter_action: "act",

    // Action Record Values:
    doAction: 0x00,
    saveForLaterAction: 0x01,
    openForEditingAction: 0x02,
    RFUAction: 0x03,  // Reserved from 0x03 to 0xFF

    uris: new Array(),

    init: function() {
      this.uris[0x00] = "";
      this.uris[0x01] = "http://www.";
      this.uris[0x02] = "https://www.";
      this.uris[0x03] = "http://";
      this.uris[0x04] = "https://";
      this.uris[0x05] = "tel:";
      this.uris[0x06] = "mailto:";
      this.uris[0x07] = "ftp://anonymous:anonymous@";
      this.uris[0x08] = "ftp://ftp.";
      this.uris[0x09] = "ftps://";
      this.uris[0x0A] = "sftp://";
      this.uris[0x0B] = "smb://";
      this.uris[0x0C] = "nfs://";
      this.uris[0x0D] = "ftp://";
      this.uris[0x0E] = "dav://";
      this.uris[0x0F] = "news:";
      this.uris[0x10] = "telnet://";
      this.uris[0x11] = "imap:";
      this.uris[0x12] = "rtsp://";
      this.uris[0x13] = "urn:";
      this.uris[0x14] = "pop:";
      this.uris[0x15] = "sip:";
      this.uris[0x16] = "sips:";
      this.uris[0x17] = "tftp:";
      this.uris[0x18] = "btspp://";
      this.uris[0x19] = "btl2cap://";
      this.uris[0x1A] = "btgoep://";
      this.uris[0x1B] = "tcpobex://";
      this.uris[0x1C] = "irdaobex://";
      this.uris[0x1D] = "file://";
      this.uris[0x1E] = "urn:epc:id:";
      this.uris[0x1F] = "urn:epc:tag:";
      this.uris[0x20] = "urn:epc:pat:";
      this.uris[0x21] = "urn:epc:raw:";
      this.uris[0x22] = "urn:epc:";
      this.uris[0x23] = "urn:nfc:";
    },

    rtd_text_iana_length: 0x3F,
    rtd_text_encoding: 0x40,
    rtd_text_utf8: 0,
    rtd_text_utf16: 1,
  }


  /**
   * Debug method
   */
  function debug(msg, optObject) {
    if (DEBUG) {
      var output = '[DEBUG] SYSTEM NFC: ' + msg;
      if (optObject) {
        output += JSON.stringify(optObject);
      }
      console.log(output);
    }
  }

  debug(" Initializing NFC Message %%%%%%%%%%%%%%%%%%%%%%");
  /**
   * NFC certified apps can register to receive Nfc commands. Apps without
   * NFC certified app permissions can still receive activity messages.
   */
  window.navigator.mozSetMessageHandler('nfc-ndef-discovered', handleNdefDiscovered);
  // Not NDEF formatted. Handle as generic technology tag.
  window.navigator.mozSetMessageHandler('nfc-technology-discovered', handleTechnologyDiscovered);
  // Unknown tag, fallback to anything registered for a generic tag.
  window.navigator.mozSetMessageHandler('nfc-tag-discovered', handleTagDiscovered);

  window.navigator.mozSetMessageHandler('nfc-disconnected', handleNdefDisconnected);
  window.navigator.mozSetMessageHandler('nfc-request-status', handleWriteRequestStatus);


  // FIXME: The following should be handled not by NFC, but by a secure elements manager that checks permissions.
  window.navigator.mozSetMessageHandler('secureelement-activated', null);
  window.navigator.mozSetMessageHandler('secureelement-deactivated', null);
  window.navigator.mozSetMessageHandler('secureelement-transaction', null);

  // Events:
  function handleEvent(evt) {
    switch (evt.type) {
      case 'screenchange':
        screenEnabled = evt.detail.screenEnabled;
        break;
      case 'lock':
        screenLocked = true;
        break;
      case 'unlock':
        screenLocked = false;
        break;
    }
  };
  window.addEventListener('screenchange', handleEvent);
  window.addEventListener('lock', handleEvent);
  window.addEventListener('unlock', handleEvent);

  nfc.init();

  /**
   * Local functions
   */

  function launchBrowser(url) {
    var a = new MozActivity({
      name: 'view',
      data: {
        type: 'url',
        url: url
      }
    });
  }

  // FIXME
  function launchAddContact(record) {
    var a = new MozActivity({
      name: 'new',
      data: {
        type: 'webcontacts/contact',
        name: 'PlaceHolderName',
        tel: 'PlaceHolderTel',
        email: 'PlaceHolderEmail',
        record: record
      }
    });
  }

  function launchDialer(record) {
    var number = record.payload.substring(1);
    var a = new MozActivity({
      name: 'ndef-discovered',
      data: {
        type: 'webtelephony/number',
        number: number,
        record: record
      }
    });
  }

  function decodeNdefMessages(ndefmessages) {
    var records = ndefmessages;
    for (var i = 0; i < records.length; i++) {
      records[i].tnf = records[i].tnf;
      records[i].type = atob(records[i].type);
      records[i].id = atob(records[i].id);
      records[i].payload = atob(records[i].payload);
    }
    return records;
  }

  // An Ndef Message is an array of one or more Ndef tags.
  function handleNdefMessages(ndefmessages) {
    var action = new Array();
    var ndefmessages = decodeNdefMessages(ndefmessages);

    for (var i = 0; i < ndefmessages.length; i++) {
      var record = ndefmessages[i];
      var handle = null;
      debug("RECORD: " + JSON.stringify(record));

      switch(+record.tnf) {
        case nfc.tnf_empty:
          handle = handleEmpty(record);
          if (handle) {
            action.push(handle);
          }
        case nfc.tnf_well_known:
          handle = handleWellKnownRecord(record);
          if (record.type == nfc.rtd_smart_poster) {
            for(var j = 0; j < handle.records.length; j++) {
              var subRecord = handle.records[j];
              var subHandle = handleWellKnownRecord(subRecord);
              action.push(subHandle);
              debug("Subrecord: " + action[action.length-1]);
            }
          } else {
            action.push(handle);
            if (handle) {
              action.push(handle);
            }
            debug("Record activity: " + action[action.length-1]);
          }
          break;

        case nfc.tnf_absolute_uri:
          handle = handleURIRecord(record);
          action.push(handle);
          break;

        case nfc.tnf_mime_media:
          handle = handleMimeMedia(record);
          action.push(handle);
          break;
        case nfc.tnf_external_type:
          handle = handleExternalType(record);
          action.push(handle);
          break;
        case nfc.tnf_unknown:
        case nfc.tnf_unchanged:
        case nfc.tnf_reserved:
        default:
          debug("Unknown or unimplemented tnf or rtd subtype.");
          break;
      }
    }
    if (action.length <= 0) {
      debug("XX Found no ndefmessage actions. XX");
      return null;
    }
    return action;
  }

  /**
   * Tags, and fallback tag handling.
   */

  function acceptNfcEvents() {
    // Policy:
    if (screenEnabled && !screenLocked) {
      return true;
    } else {
      return false;
    }
  }

  function handleNdefDiscovered(command) {
    if (!acceptNfcEvents()) {
      debug("Ignoring NFC NDEF tag message. Screen state is disabled.");
      return;
    }

    var action = handleNdefMessages(command.content.records);

    if(action.length <=0) {
      debug("Unimplemented. Handle Unknown type.");
    } else {
      // Policy: Only first ndef message record action is used for triggering activities.
      // Registered ndef message handlers should interpret messages containing multiiple records
      // and nested subrecords.
      debug("Action: " + JSON.stringify(action[0]));
      var a = new MozActivity(action[0]);
    }

  }

  function handleTechnologyDiscovered(command) {
    if (!acceptNfcEvents()) {
      debug("Ignoring NFC technology tag message. Screen state is disabled.");
      return;
    }

    var technologyTag = command.content.tag;
    var a = new MozActivity({
      name: 'technology-discovered',
      data: {
        type: 'tag',
        tag: technologyTag
      }
    });
  }

  function handleTagDiscovered(command) {
    if (!acceptNfcEvents()) {
      debug("Ignoring NFC Tag discovered message. Screen state is disabled.");
      return;
    }

    var nfctag = command.content.tag;
    var a = new MozActivity({
      name: 'tag-discovered',
      data: {
        type: 'tag',
        tag: nfctag
      }
    });
  }

  // Apps should use the write status callback, not a broadcasted activity.
  function handleWriteRequestStatus(command) {
    var a = new MozActivity({
      name: 'nfc-write-request-status',
      data: {
        type: 'info',
        message: ''
      }
    });
  }

  function handleNdefDisconnected(command) {
    var a = new MozActivity({
      name: 'nfc-ndefdisconnected',
      data: {
        type: 'info',
        message: ''
      }
    });
  }


  /**
   * NDEF parsing functions
   */
  function handleEmpty(record) {
    return {
      name: 'ndef-discovered',
      data: {
        type: 'empty'
      }
    }
  }

  function handleWellKnownRecord(record) {
    debug("XXXXXXXXXXXXXXXXXXXX HandleWellKnowRecord XXXXXXXXXXXXXXXXXXXX" );
    if(record.type == nfc.rtd_text) {
      return handleTextRecord(record);
    } else if(record.type == nfc.rtd_uri) {
      return handleURIRecord(record);
    } else if(record.type == nfc.rtd_smart_poster) {
      return handleSmartPosterRecord(record);
    } else if (record.type == nfc.smartposter_action) {
      return handleSmartPosterAction(record);
    } else {
      console.log("Unknown record type: " + record.type);
    }
    return null;
  }

  function handleTextRecord(record) {
    var status = record.payload.charCodeAt(0);
    var languageLength = status & nfc.rtd_text_iana_length;
    var language = record.payload.substring(1, languageLength + 1);
    var encoding = status & nfc.rtd_text_encoding;
    var text;
    var encodingString;
    if(encoding == nfc.rtd_text_utf8) {
      text = decodeURIComponent(escape(record.payload.substring(languageLength + 1)));
      encodingString='UTF-8';
    } else if(encoding == nfc.rtd_text_utf16) {
      record.payload.substring(languageLength + 1);
      encodingString='UTF-16';
    }
    var activityText = {
      name: 'ndef-discovered',
      data: {
        type: 'text',
        rtd: record.type,
        text: text,
        language: language,
        encoding: encodingString,
        record: record
      }
    }
    return activityText;
  }

  function handleURIRecord(record) {
    debug("XXXXXXXXXXXXXXX Handle Ndef URI type XXXXXXXXXXXXXXXX");
    var activityText = null;
    var prefix = nfc.uris[record.payload.charCodeAt(0)];
    if (!prefix) {
      return null;
    }

    if (prefix == "tel:") {
      // handle special case (FIXME: dialer doesn't currently handle parsing a full ndef message):
      var number = record.payload.substring(1);
      debug("XXXXXXXXXXXXXXX Handle Ndef URI type, TEL XXXXXXXXXXXXXXXX");
      activityText = {
        name: 'ndef-discovered',
        data: {
          type: 'webtelephony/number',
          number: number,
          uri: prefix + record.payload.substring(1),
          record: record
        }
      }
    } else {
      activityText = {
        name: 'ndef-discovered',
        data: {
          type: 'uri',
          rtd: record.type,
          uri: prefix + record.payload.substring(1),
          record: record
        }
      }
    }
    return activityText;
  }

  function handleMimeMedia(record) {
    var type = "mime-media";
    var activityText = null;

    debug("XXXXXXXXXXXXXXXXXXXX HandleMimeMedia XXXXXXXXXXXXXXXXXXXX" );
    if (record.type == "text/x-vCard") {
      activityText = handleVCardRecord(record);
    } else {
      activityText = {
        name: 'ndef-discovered',
        data: {
          type: record.type,
          record: record
        }
      }
    }
    return activityText;
  }



  // FIXME, incomplete mapping/formatting. App should parse the full ndef vcard.
  function handleVCardRecord(record) {
    var name = record.payload.substring(record.payload.indexOf("FN:") + "FN:".length);
    name = name.substring(0, name.indexOf("\n"));
    var first = name.substring(0, name.indexOf(" "));
    var last = name.substring(name.indexOf(" ")+1);
    var cell = record.payload.substring(record.payload.indexOf("TEL;TYPE:cell:") + "TEL;TYPE:cell:".length);
    cell = cell.substring(0, cell.indexOf("\n"));
    var tel = record.payload.substring(record.payload.indexOf("TEL:") + "TEL:".length);
    tel = tel.substring(0, tel.indexOf("\n"));
    var email = record.payload.substring(record.payload.indexOf("EMAIL:") + "EMAIL:".length);
    tel = email.substring(0, email.indexOf("\n"));

    var type = "webcontacts/contact"; // platform mapping?
    var activityText = {
      name: 'new',
      data: {
        type: type,
        name: first + ' ' + last,
        cell: cell,
        tel: tel,
        email: email,
        record: record
      }
    }
    return activityText;
  }

  function handleExternalType(record) {
    var activityText = {
      name: 'ndef-discovered',
      data: {
        type: 'external-type',
        rtd: record.type,
        record: record
      }
    }
    return activityText;
  }

  // Smartposters can be multipart NDEF messages. The meaning and actions are application dependent.
  function handleSmartPosterRecord(record) {
    var activityText = {
      name: 'ndef-discovered',
      data: {
        type: 'smart-poster',
        record: record
      }
    }
    return activityText;
  }

  function handleSmartPosterAction(record) {
    // The recommended action has an application specific meaning:
    var smartaction = record.payload.charCodeAt(0);
    var activityText = {
      name: 'ndef-discovered',
      data: {
        type: 'smartposter-action',
        action: smartaction,
        record: record
      }
    }
    return activityText;
  }

})();
