import React from "react";

export default class SidebarHeading extends React.Component {
    handleClick = (event) => {
        // console.log(event.target.className !== "toolbar-button disabled");
        if (event.target.className !== "toolbar-button disabled") {
            const { createNewListCallback } = this.props;
            createNewListCallback();
        }
    };
    render() {
        let canAddList = this.props.canAddList;
        let addPlaylist = "toolbar-button";
        if (!canAddList) addPlaylist += " disabled";
        return (
            <div id="sidebar-heading">
                <input 
                    type="button" 
                    id="add-list-button" 
                    className={addPlaylist}
                    onClick={this.handleClick}
                    value="+" />
                Your Playlists
            </div>
        );
    }
}