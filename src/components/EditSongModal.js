import React, { Component } from 'react';

export default class EditSongModal extends Component {
    handleConfirmClick = (event) => {
        this.props.editSongCallback();
    }

    render() {
        const { songKeyPair, hideEditSongModalCallback } = this.props;
        let song = {
            title: "",
            artist: "",
            youTubeId: ""
        };
        if (songKeyPair) {
            song = songKeyPair.song;
        }
        return (
            <div 
                class="modal" 
                id="edit-song-modal" 
                data-animation="slideInOutRight">
                    <div class="modal-root" id='edit-song-modal-root'>
                        <div class="modal-north">
                            Edit Song?
                        </div>
                        <div class="modal-center">
                            <div class="modal-center-content">
                                <div/>
                                    {"Title: "}
                                <input
                                        className="input"
                                        type="text"
                                        id="edit-song-title"
                                        defaultValue={song.title}
                                        key={song.title}
                                    />
                                <br></br>
                                <div/>
                                    {"Artist: "}
                                <input
                                    className="input"
                                    type="text"
                                    id="edit-song-artist"
                                    defaultValue={song.artist}
                                    key={song.artist}
                                    style={{width: "60%"}}
                                />
                                <br></br>
                                <div/>
                                    {"ID: "}
                                <input
                                    className="input"
                                    type="text"
                                    id="edit-song-id"
                                    defaultValue={song.youTubeId}
                                    key={song.youTubeId}
                                />
                            </div>
                        </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="edit-song-confirm-button" 
                                class="modal-button" 
                                onClick={this.handleConfirmClick}
                                value='Confirm' />
                            <input type="button" 
                                id="edit-song-cancel-button" 
                                class="modal-button" 
                                onClick={hideEditSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}