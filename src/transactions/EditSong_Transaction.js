import jsTPS_Transaction from "../common/jsTPS.js"
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, songKeyPair, title, artist, youTubeId) {
        super();
        this.app = initApp;
        this.songKeyPair = songKeyPair;
        this.title = title;
        this.artist = artist;
        this.youTubeId = youTubeId;
    }

    doTransaction() {
        this.oldTitle = this.songKeyPair.song.title;
        this.oldArtist = this.songKeyPair.song.artist;
        this.oldId = this.songKeyPair.song.youTubeId;
        // console.log(this.songKeyPair)
        this.app.editSong(this.songKeyPair, this.title, this.artist, this.youTubeId);
    }

    undoTransaction() {
        this.app.editSong(this.songKeyPair, this.oldTitle, this.oldArtist, this.oldId);
    }
}