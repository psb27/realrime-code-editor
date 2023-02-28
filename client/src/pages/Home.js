import React, { useState } from 'react';
import {v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast' // it will give pop up notification
import { useNavigate } from 'react-router-dom'; // for redirecting from one page to another

const Home = () => {

    const navigate = useNavigate();
    // setting up room id to the state
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");

    // creating a new room 
    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4(); // generating a new room id
        setRoomId(id);
        toast.success("Created a new room"); // showing notification after creation of room
    };

    // function for joining room 
    const joinRoom = () => {

        if (!roomId || !username) {
            toast.error("ROOM ID & username is required");
            return;
        }

        navigate(`/editor/${roomId}`, {

            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter'){
            joinRoom();
        }
    }


  return (
    <div className="homePageWrapper">
        <div className="formWrapper">
            <img className="homePageLogo" src="/code-sync.png" alt="code-sync-logo" />
            <h4 className="mainLabel">Paste invitation ROOM ID</h4>
            <div className="inputGroup">
                <input 
                    type="text"
                    className="inputBox"
                    placeholder="ROOM ID"
                    onChange={(e) => setRoomId(e.target.value)} // storing state if user manually enters the room id
                    value={roomId} // binding room id to the input state
                    onKeyUp={handleInputEnter} // directly ennter to the editor page by pressing enter
                />
                 <input 
                    type="text"
                    className="inputBox"
                    placeholder="USERNAME"
                    onChange={(e) => setUsername(e.target.value)} // storing state if user manually enters the user
                    value={username} // binding username to the input state
                    onKeyUp={handleInputEnter} // // directly enter to the editor page by pressing enter
                />
                <button className="btn joinBtn" onClick={joinRoom}>Join</button>
                <span className="createInfo">
                    If you don't have an invite then create &nbsp;
                    <a 
                        onClick={createNewRoom} 
                        href="" 
                        className="createNewBtn"
                        >
                        new room
                    </a>
                </span>
            </div>
        </div>

        <footer>
            <h4>Built with 💛 by <a href="https://github.com/psb27"> Prateek Singh </a> </h4>
        </footer>
    </div>
  )
}

export default Home