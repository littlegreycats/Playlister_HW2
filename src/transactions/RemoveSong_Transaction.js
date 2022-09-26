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
        // console.log(this.songKeyPair.key);
        // this.app.addSong();
        console.log(this.title);
        console.log(this.artist);
        console.log(this.id);
        // console.log(this.app.state.currentList.songs.length-1);
        // this.app.switchSongs(this.app.state.currentList.songs.length-1, this.songKeyPair.key);
        // console.log(this.oldSongKeyPair);
        // this.app.editSong(this.oldSongKeyPair, this.title, this.artist, this.id);
    }
}