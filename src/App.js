import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction';
import RemoveSong_Transaction from './transactions/RemoveSong_Transaction';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import EditSongModal from './components/EditSongModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';
import RemoveSongModal from './components/RemoveSongModal';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            songKeyPairMarkedForEditing : null,
            songKeyPairMarkedForDeletion : null
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            },
            songKeyPairMarkedForEditing: prevState.songKeyPairMarkedForEditing,
            songKeyPairMarkedForDeletion: prevState.songKeyPairMarkedForDeletion
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            },
            songKeyPairMarkedForEditing: prevState.songKeyPairMarkedForEditing,
            songKeyPairMarkedForDeletion: prevState.songKeyPairMarkedForDeletion
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            },
            songKeyPairMarkedForEditing: prevState.songKeyPairMarkedForEditing,
            songKeyPairMarkedForDeletion: prevState.songKeyPairMarkedForDeletion
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData,
            songKeyPairMarkedForEditing: prevState.songKeyPairMarkedForEditing,
            songKeyPairMarkedForDeletion: prevState.songKeyPairMarkedForDeletion
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.tps.clearAllTransactions();
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData,
            songKeyPairMarkedForEditing: prevState.songKeyPairMarkedForEditing,
            songKeyPairMarkedForDeletion: prevState.songKeyPairMarkedForDeletion
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData,
            songKeyPairMarkedForEditing: prevState.songKeyPairMarkedForEditing,
            songKeyPairMarkedForDeletion: prevState.songKeyPairMarkedForDeletion
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
            this.setStateWithUpdatedList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
            this.setStateWithUpdatedList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData,
            songKeyPairMarkedForEditing: prevState.songKeyPairMarkedForEditing,
            songKeyPairMarkedForDeletion: prevState.songKeyPairMarkedForDeletion
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
    }

    // marks a song key pair for editing
    markSongKeyPairForEditing = (songKeyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            songKeyPairMarkedForEditing: songKeyPair,
            songKeyPairMarkedForDeletion: prevState.songKeyPairMarkedForDeletion
        }), () => {
            this.showEditSongModal();
        });
    }

    // shows edit song modal
    showEditSongModal() {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
    }

    // hides edit song modal
    hideEditSongModal() {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
    }

    addEditSongTransaction = () => {
        // console.log(this.state.songKeyPairMarkedForEditing);
        let songTitle = document.getElementById("edit-song-title").value;
        let songArtist = document.getElementById("edit-song-artist").value;
        let songId = document.getElementById("edit-song-id").value;
        let transaction = new EditSong_Transaction(this, this.state.songKeyPairMarkedForEditing, songTitle, songArtist, songId);
        this.tps.addTransaction(transaction);
    }

    // edits song that's marked for editing
    editSong = (songKeyPair, title, artist, youTubeId) => {
        // edit song based on input values
        // console.log(songKeyPair.song);
        let song = this.state.currentList.songs[songKeyPair.key];
        song.title = title;
        song.artist = artist;
        song.youTubeId = youTubeId;
        // console.log(songKeyPair.song);

        // refresh list and close modal
        this.setStateWithUpdatedList(this.state.currentList);
        this.hideEditSongModal();
    }

    addAddSongTransaction = () => {
        let transaction = new AddSong_Transaction(this);
        this.tps.addTransaction(transaction);
        // console.log("transaction added");
    }

    addSong() {
        let song = {
            title: "Untitled",
            artist: "Untitled",
            youTubeId: "dQw4w9WgXcQ"
        }
        let list = this.state.currentList;
        list.songs.push(song);
        // console.log(this.state.currentList.songs);
        this.setStateWithUpdatedList(list);
    }

    removeSong = (index) => {
        console.log("removing song at index " + index);
        this.state.currentList.songs.splice(index, 1);
        this.setStateWithUpdatedList(this.state.currentList);
    }

    switchSongs(start, end) {
        let list = this.state.currentList;
        let tempSong = list.songs[start];
        list.songs[start] = list.songs[end];
        list.songs[end] = tempSong;
        this.setStateWithUpdatedList(list);
    }

    markSongKeyPairForDeletion = (index) => {
        let song = this.state.currentList.songs[index];
        console.log("song marked for deletion: " + song.title);
        let songKeyPair = {
            key: index,
            song: song
        };
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            songKeyPairMarkedForEditing: prevState.songKeyPairMarkedForEditing,
            songKeyPairMarkedForDeletion: songKeyPair
        }), () => {
            this.showRemoveSongModal();
        });
    }

    showRemoveSongModal = () => {
        console.log("opening remove song modal");
        let modal = document.getElementById("remove-song-modal");
        modal.classList.add("is-visible");
    }

    hideRemoveSongModal = () => {
        console.log("closing remove song modal");
        let modal = document.getElementById("remove-song-modal");
        modal.classList.remove("is-visible");
    }

    addRemoveSongTransaction = (index) => {
        console.log("adding remove song transaction");
        let transaction = new RemoveSong_Transaction(this, this.state.songKeyPairMarkedForDeletion);
        this.tps.addTransaction(transaction);
        this.hideRemoveSongModal();
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && event.code === 'KeyZ') {
            // console.log("CONTROL Z");
            this.undo();
        } else if (event.ctrlKey && event.code === 'KeyY') {
            // console.log("CONTROL Y");
            this.redo();
        }
    }

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        let canAddList = this.state.currentList == null;
        return (
            <div id="root" onKeyDown={this.onKeyDown} tabIndex="0">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                    canAddList={canAddList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    addCallback={this.addAddSongTransaction}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    editSongCallback={this.markSongKeyPairForEditing}
                    removeSongCallback={this.markSongKeyPairForDeletion} />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <EditSongModal
                    songKeyPair={this.state.songKeyPairMarkedForEditing}
                    editSongCallback={this.addEditSongTransaction}
                    hideEditSongModalCallback={this.hideEditSongModal}
                />
                <RemoveSongModal
                    songKeyPair={this.state.songKeyPairMarkedForDeletion}
                    removeSongCallback={this.addRemoveSongTransaction}
                    hideRemoveSongModalCallback={this.hideRemoveSongModal}
                />
            </div>
        );
    }
}

export default App;
