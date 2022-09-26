import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false
        }
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);

        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("song");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false
        }));

        // ASK THE MODEL TO MOVE THE DATA
        this.props.moveCallback(sourceId, targetId);
    }

    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length);
    }

    handleClick = (event) => {
        if (event.detail === 2) { // if song card double clicked
            // initiate edit song
            event.stopPropagation();
            const { song } = this.props;
            let songKeyPair = {
                key: this.getItemNum()-1,
                song: song
            }
            this.props.editCallback(songKeyPair);
        }
    }

    handleRemoveSong = () => {
        // this.stopPropagation();
        this.props.removeCallback(this.getItemNum() - 1);
    }

    render() {
        const { song } = this.props;
        let num = this.getItemNum();
        // console.log("num: " + num);
        let itemClass = "list-card unselected-list-card";
        if (this.state.draggedTo) {
            // itemClass = "playlister-song-dragged-to";
        }
        return (
            <div
                id={'song-' + num}
                className={itemClass}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                onClick={this.handleClick}
                draggable="true"
            >
                {num + ". "}
                <a 
                    title={song.title + " by " + song.artist}
                    href={"https://www.youtube.com/watch?v=" + song.youTubeId}>
                    {song.title} by {song.artist}</a>
                    <input
                        id={"delete-song-" + num}
                        onClick={this.handleRemoveSong}
                        class="list-card-button"
                        type="button"
                        value="🗑"
                        style={{ marginLeft: "auto" }}></input>
            </div>
        )
    }
}