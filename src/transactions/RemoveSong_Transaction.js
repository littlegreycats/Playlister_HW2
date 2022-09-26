import  jsTPS_Transaction  from "../common/jsTPS";
export default class RemoveSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, songKeyPair) {
        super();
        this.app = initApp;
        this.songKeyPair = songKeyPair;
        this.song = songKeyPair.song;
    }

    doTransaction() {
        this.title = this.songKeyPair.song.title;
        this.artist = this.songKeyPair.song.artist;
        this.id = this.songKeyPair.song.youTubeId;
        this.oldSongKeyPair = this.songKeyPair;
        this.app.removeSong(this.songKeyPair.key)
    }

    undoTransaction() {
        console.log(this.title);
        console.log(this.artist);
        console.log(this.id);
        this.app.addSong();
        this.app.moveSong(this.songKeyPair.key+1, this.app.state.currentList.songs.length);
        this.app.editSong(this.songKeyPair, this.title, this.artist, this.id);
    }
}