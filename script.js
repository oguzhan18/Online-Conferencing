"use strict";
const sponsorRooms = [
  {
  roomName: 'İş_Görüşme',
  isSponsor: true,
  people: [
  { userID: '1', displayName: 'Oğuzhan ÇART' }] },
{
  roomName: 'İş_yatırımcı',
  isSponsor: true,
  people: [
  { userID: '2', displayName: 'Oğuzhan ÇART' }] },
{
  roomName: 'İş_sponsor',
  isSponsor: true,
  people: [
  { userID: '3', displayName: 'Oğuzhan ÇART' }] }
];

function ensureSponsors(data) {
  sponsorRooms.forEach(function (sponsor) {
    const roomInData = data.find(function (record) {
      return record.roomName === sponsor.roomName;
    });   
    if (!roomInData) {
      data.push(sponsor);
    } else {
      roomInData.isSponsor = true;
      if (!roomInData.people) {roomInData.people = [];} 
      roomInData.people.push(sponsor.people[0]); 
    }
  });
  return JSON.parse(JSON.stringify(data));
}
const app = new Vue({
  el: '#app',
  data: {
    meeting: undefined,
    currentRoom: null,
    userEmail: 'oguzhancart1@gmail.com',
    userID: new Date().toISOString(),
    baseRoom: window.location.pathname.split("/").pop(), 
    tables: ensureSponsors([]) },

  mounted() {

  },
  computed: {
    displayName() {var _urlParams$get;
      const urlParams = new URLSearchParams(window.location.search);
      return (_urlParams$get = urlParams.get('name')) !== null && _urlParams$get !== void 0 ? _urlParams$get : "Oğuzhan ÇART";
    } },

  methods: {
    table_class(table) {
      return table.roomName === this.currentRoom ? 'table-occupied' : '';
    },
    button_class(table) {
      return 'button-join' + Math.min(3, table.people.length);
    },
    person_class(person) {
      return person.userID === this.userID ? 'person-me' : '';
    },
    not_current(table) {
      return table.roomName !== this.currentRoom;
    },
    join_room(roomName) {
      if (Boolean(this.meeting)) {
        this.meeting.dispose();
      }
      const me = { userID: this.userID, displayName: this.displayName };

      document.getElementById("meet").innerHTML = "";

      const domain = 'meet.jit.si';
      const options = {
        roomName: this.baseRoom + '-' + roomName,
        userInfo: {
          email: this.userEmail,
          displayName: this.displayName },

        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          desktopSharingChromeDisabled: true,
          desktopSharingFirefoxDisabled: true,
          disableDeepLinking: true },

        interfaceConfigOverwrite: {
          SHOW_CHROME_EXTENSION_BANNER: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          JITSI_WATERMARK_LINK: '',
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          DISABLE_FOCUS_INDICATOR: true,
          TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'settings',
          'raisehand', 'videoquality', 'filmstrip', 'feedback',
          'stats', 'shortcuts', 'tileview', 'videobackgroundblur',
          'help'],

          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          HIDE_KICK_BUTTON_FOR_GUESTS: true,
          DEFAULT_BACKGROUND: '#000000' },

        parentNode: document.querySelector('#meet') };


      this.meeting = new JitsiMeetExternalAPI(domain, options);
      this.meeting.executeCommand('subject', ' ');
      this.meeting.executeCommand('toggleTileView');
      this.meeting.addEventListener('readyToClose', () => {
        this.meeting.dispose();
        document.getElementById("meet").innerHTML = "Başlamak için bir masaya katılın veya yeni bir masaya başlayın!";
        this.set_room(me, null);
      });
      this.set_room(me, roomName);
    },
    set_room(subject, newRoomName) {
      var newTables = [];
      var newRoom = true;
      for (let table of this.tables) {
        var newTable = JSON.parse(JSON.stringify(table));
        newTable.people = newTable.people.filter(function (person) {
          return person.userID !== subject.userID;
        });
        if (newTable.roomName === newRoomName) {
          newRoom = false;
          newTable.people.push(subject);
        }
        if (newTable.people.length > 0 || newTable.isSponsor) {
          newTables.push(newTable);
        }
      }
      if (newRoom && newRoomName !== null) {
        var newTable = { roomName: newRoomName, people: [subject], isSponsor: false };
        newTables.push(newTable);
      }
      newTables.sort(function(a, b) { return a.people.length - b.people.length });
      this.tables = newTables;
      this.currentRoom = newRoomName;
    },
    new_room() {
      let newTableName;
      while (!newTableName) {
        newTableName = prompt('Table name?', `${this.displayName} room`);
      }
      this.join_room(`${newTableName}`);
    } } });