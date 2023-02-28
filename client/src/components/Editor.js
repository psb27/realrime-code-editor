import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {

  const editorRef = useRef(null);

  useEffect(() => {
    
    async function init() {
      editorRef.current = Codemirror.fromTextArea(document.getElementById('realTimeEditor'), {  //? toring the contents of editor in the ref
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      //? listener for the code change
      editorRef.current.on('change', (instance, changes) => {
        const { origin }  = changes ;
        const code = instance.getValue(); //* getting the instance of the code change
        onCodeChange(code);
        if(origin !== 'setValue') {

          socketRef.current.emit(ACTIONS.CODE_CHANGE, {  //* emitting code change action and sending roomId and code to the server
            roomId,
            code,
          });

        };

      });
      
    };

    init();
    
  }, []);


  //* displaying the code change on the client
  useEffect(() => {

    if(socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if(code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    //? clean up functions
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    }
  }, [socketRef.current]);
  

  return (
    <textarea id="realTimeEditor"></textarea>
  )
}

export default Editor;