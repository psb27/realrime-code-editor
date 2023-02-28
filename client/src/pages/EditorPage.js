import React, { useState, useRef, useEffect } from 'react';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditorPage = () => {

	const socketRef = useRef(null);
	const codeRef = useRef(null);
	const location = useLocation();
	const { roomId } = useParams();
	const reactNavigator = useNavigate();
	
	const [clients, setClients] = useState([]);


	useEffect(() => {
	  
		const init = async () => {
			socketRef.current = await initSocket(); // calling the initSocket funtion from socket.js
			//**error handling
			socketRef.current.on('connect_error', (err) => handleError(err));
			socketRef.current.on('connect_failed', (err) => handleError(err));

			function handleError(e) {
				toast.error('Socket connection failed, try agiain this later');
				reactNavigator('/'); //TODO rdirect user to homepage
			}
			socketRef.current.emit(ACTIONS.JOIN, {
				roomId,
				username: location.state?.username,
			}); // emitting the join event


			// listening for joined event

			socketRef.current.on(ACTIONS.JOINED, 
				({clients, username, sockedId}) => {
					if(username !== location.state?.username) { // notify only other clients not me
						toast.success(`${username} joined the room`);
					}
					
					setClients(clients);
					
					//! syncing the code as soon as user join the room
					socketRef.current.emit(ACTIONS.SYNC_CODE, {
						code: codeRef.current,
						sockedId,
					}); 
					
				}
			);

			// Listening for the disconnect event

			socketRef.current.on(ACTIONS.DISCONNECTED,
				({ socketId, username }) => {
					toast.success(`${username} left the room`); //? nofiying all the clients
					setClients((prev) => {
						return prev.filter(  //* removing the client from the socket
							(client) => client.socketId !== socketId

						);
						
					});
				}
			);

		};
		init();

		//! clearing all the listeners in the useEffect to avoid memory leak
		return () => {
			socketRef.current.off(ACTIONS.JOINED);
			socketRef.current.off(ACTIONS.DISCONNECTED);
			socketRef.current.disconnect();
		}
	  
	}, []);

	async function copyRoomId() {
		try {
			await navigator.clipboard.writeText(roomId); //* copying roomId to the clipboard
			toast.success("Room ID has been copied");
		} catch(err) {
			toast.error("Could not copy room ID");
			console.log(err);
		}
	};


	function leaveRoom() {
		reactNavigator('/') //? redirecting user to home page
	}
	

	 //! check if the username is present in the state or not
	 if (!location.state) {
		return <Navigate to="/" /> //TODO redirect user to homepage
	 }

  return (
    <div className="mainWrap">
      <div className="aside">
		<div className="asideInnner">
			<div className="logo">
				<img 
					className="logoImage"
					src="/code-sync.png"
					alt="logo"
				/>
			</div>
			<h3>Connected</h3>
			<div className="clientsList">

				{ 
				
					clients.map((client) => {
						return <Client 
							key={client.sockedId} 
							username={client.username} 
						/>
					})
				}
			</div>
		</div>
		<button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
		<button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
      </div>
      <div className="editorWrap">
        <Editor 
			socketRef={socketRef} 
			roomId={roomId} 
			onCodeChange={(code) => {
				codeRef.current = code;
			}}
		/>
      </div>
    </div>
  )
}

export default EditorPage;