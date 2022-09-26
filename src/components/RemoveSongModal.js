import React, { Component } from 'react';
export default class RemoveSongModal extends Component {
    render() {
        const { songKeyPair, removeSongCallback, hideRemoveSongModalCallback } = this.props;
        let song = {
            title: "",
            artist: "",
            youTubeId: ""
        }
        if (songKeyPair) {
            song = songKeyPair.song;
        }
        return (
            <div 
                class="modal" 
                id="remove-song-modal" 
                data-animation="slideInOutDown">
                    <div class="modal-root" id='verify-remove-song-root'>
                        <div class="modal-north">
                            Delete song?
                        </div>
                        <div class="modal-center">
                            <div class="modal-center-content">
                            Are you sure you wish to permanently remove {song.title} from the playlist?
                            </div>
                        </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="remove-song-confirm-button" 
                                class="modal-button" 
                                onClick={removeSongCallback}
                                value='Confirm' />
                            <input type="button" 
                                id="remove-song-cancel-button" 
                                class="modal-button" 
                                onClick={hideRemoveSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}