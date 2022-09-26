import jsTPS_Transaction from "../common/jsTPS.js"
export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initApp) {
        super();
        this.app = initApp;
    }
    doTransaction() {
        this.app.addSong();
    }

    undoTransaction() {
        let index = this.app.state.currentList.songs.length - 1;
        console.log("remove index: " + index);
        this.app.removeSong(index);
    }
}