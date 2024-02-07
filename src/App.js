// import React, { useState } from "react";
// import { uploadFile } from './Api.js';
// import './index.css';
// import { Button } from "@carbon/react";
// import Styles from './App.scss';
// import { RadioButton, FileUploader, RadioButtonGroup } from "carbon-components-react";

// const App = () => {
//   const [file, setFile] = useState(null);

//   const downloadTxtFile = () => {
//     const element = document.createElement("a");
//     const fileContent = document.getElementById('generated_summary').innerText;
//     const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
//     element.href = URL.createObjectURL(file);
//     element.download = "summary.txt";
//     document.body.appendChild(element);
//     element.click();
//   };

//   const disRadio = (Button) => {
//     let audio = document.getElementById('select_format_audio');
//     let video = document.getElementById('select_format_video');
//     let text = document.getElementById('select_format_text');
//     let scrum = document.getElementById('convo_type_scrum');
//     let interview = document.getElementById('convo_type_interview');
//     let speech = document.getElementById('convo_type_speech');

//     if (Button == "video" && video && video.checked == true) {
//       audio.checked = false;
//       text.checked = false;
//     }
//     if (Button == "text" && text && text.checked == true) {
//       audio.checked = false;
//       video.checked = false;
//     }
//     if (Button == "audio" && audio && audio.checked == true) {
//       video.checked = false;
//       text.checked = false;
//     }
//     if (Button == "scrum" && scrum && scrum.checked == true) {
//       interview.checked = false;
//       speech.checked = false;
//     }
//     if (Button == "interview" && interview && interview.checked == true) {
//       scrum.checked = false;
//       speech.checked = false;
//     }
//     if (Button == "speech" && speech && speech.checked == true) {
//       interview.checked = false;
//       scrum.checked = false;
//     }
//   };

//   const onFileChange = (event) => {
//     const fileChosen = document.getElementById('file-chosen');
//     if (event.target.files && event.target.files[0]) {
//       const files = event.target.files;
//       setFile(event.target.files[0]);
//       fileChosen.innerHTML = files[0].name;
//     } else {
//       fileChosen.innerHTML = "Please select a file";
//     }
//   };
  
//   const upload = () => {
//     let audio = document.getElementById('select_format_audio');
//     let video = document.getElementById('select_format_video');
//     let text = document.getElementById('select_format_text');
//     let upload = document.getElementById('upload');

//     if(text && text.checked == true && upload) {
//       upload.accept=".txt, .json, .csv"
//     } else if(audio && audio.checked == true && upload) {
//       upload.accept=".mp3" 
//     } else if(video && video.checked == true && upload) {
//       upload.accept=".mp4"
//     }
//   };

  
//   const calValue = async () => {
//     let audio = document.getElementById('select_format_audio');
//     let text = document.getElementById('select_format_text');
//     let video = document.getElementById('select_format_video');
//     let scrum = document.getElementById('convo_type_scrum');
//     let interview = document.getElementById('convo_type_interview');
//     let speech = document.getElementById('convo_type_speech');

//     let format, convo_type;

//     if (text && text.checked == true ) {
//       format = "text";
//     } else if (audio && audio.checked == true ) {
//       format = "audio";
//     } else if (video && video.checked == true) {
//       format = "video";
//     }

//     if (scrum && scrum.checked == true ) {
//       convo_type = "scrum";
//     } else if (interview && interview.checked == true) {
//       convo_type = "interview";
//     } else if (speech && speech.checked == true) {
//       convo_type = "speech";
//     }

//     const formData = new FormData();
//     formData.append("file", file);
//     const api_response = await uploadFile(formData);
//     console.log(api_response);
//     let summary;

//     summary = document.getElementById("generated_summary").innerHTML = api_response.data.message;
//     return summary;
//   };

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '80vh', paddingTop: '70px', backgroundColor: '#f4f4f4' }}>
//       <div style={{ border: '2px solid #3498db', padding: '20px', borderRadius: '10px', boxSizing: 'border-box', width: '70%', background: 'white' }}>
//         <h1 className={Styles.heading} style={{ textAlign: 'center', marginBottom: '20px', color: '#3498db' }}>Conversation Summarizer</h1>
//         <div className={Styles.iodiv} style={{ display: 'flex', justifyContent: 'space-between' }}>
//           <div style={{ width: '48%' }}>
//             <div className="iohead" style={{ textAlign: 'center' }}>Input</div>
//             <div>Select format</div>
//             <br />
//             <RadioButtonGroup
//               defaultSelected="audio"
//               name="format"
//               onChange={(value) => disRadio(value)}
//             >
//               <RadioButton id="select_format_audio" value="audio" labelText="Audio" />
//               <RadioButton id="select_format_video" value="video" labelText="Video" />
//               <RadioButton id="select_format_text" value="text" labelText="Text" />
//             </RadioButtonGroup>
          
//             <br />
//             <FileUploader
//               id="upload"
//               labelText="Upload"
//               style={{ marginLeft: '10px' }}
//               accept={upload.accept}
//               onChange={(event) => onFileChange(event)}
//               buttonLabel="Upload"
//             />
//             <div id="file-chosen"></div>
//             <br />
//             <div>Select conversation type</div>
//             <br />
//             <RadioButtonGroup
//               defaultSelected="scrum"
//               name="convoType"
//               onChange={(value) => disRadio(value)}
//             >
//               <RadioButton id="convo_type_scrum" value="scrum" labelText="Scrum" />
//               <RadioButton id="convo_type_interview" value="interview" labelText="Interview" />
//               <RadioButton id="convo_type_speech" value="speech" labelText="Speech" />
//             </RadioButtonGroup>
//             <br />
//             <Button style={{ marginLeft: '10px', marginTop: '20px' }} onClick={() => calValue()}>Summarize</Button>
//           </div>
//           <div style={{ width: '58%', borderLeft: '1px dashed #3498db', paddingLeft: '20px' }}>
//             <div className="iohead" style={{ textAlign: 'center' }}>Output</div>
//             <ul className="generated_summary" id="generated_summary"></ul>
//             <div className={Styles.download} style={{ marginTop: '10px' }}>
//               <Button style={{ marginLeft: '10px' }} onClick={() => downloadTxtFile()}>Download</Button>
//             </div>
//           </div>
//         </div>
//         <div style={{ textAlign: 'right', marginTop: '10px', color: '#3498db' }}>Powered by WatsonX.ai</div>
//       </div>
//     </div>
//   );
// };

// export default App;


import React, { useState } from "react";
import { uploadFile } from './Api.js'; // Import the uploadFile function
import './index.css';
import { Button } from "@carbon/react";
import Styles from './App.scss';
import { RadioButton, FileUploader, RadioButtonGroup } from "carbon-components-react";

const App = () => {
  const [file, setFile] = useState(null);

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const fileContent = document.getElementById('generated_summary').innerText;
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "summary.txt";
    document.body.appendChild(element);
    element.click();
  };

  const disRadio = (Button) => {
    let audio = document.getElementById('select_format_audio');
    let video = document.getElementById('select_format_video');
    let text = document.getElementById('select_format_text');
    let scrum = document.getElementById('convo_type_scrum');
    let interview = document.getElementById('convo_type_interview');
    let speech = document.getElementById('convo_type_speech');

    // Radio button logic...
  };

  const onFileChange = (event) => {
    const fileChosen = document.getElementById('file-chosen');
    if (event.target.files && event.target.files[0]) {
      const files = event.target.files;
      setFile(event.target.files[0]);
      fileChosen.innerHTML = files[0].name;
    } else {
      fileChosen.innerHTML = "Please select a file";
    }
  };
  
  const upload = () => {
    let audio = document.getElementById('select_format_audio');
    let video = document.getElementById('select_format_video');
    let text = document.getElementById('select_format_text');
    let upload = document.getElementById('upload');

    // Upload logic...
  };

  const calValue = async () => {
    let audio = document.getElementById('select_format_audio');
    let text = document.getElementById('select_format_text');
    let video = document.getElementById('select_format_video');
    let scrum = document.getElementById('convo_type_scrum');
    let interview = document.getElementById('convo_type_interview');
    let speech = document.getElementById('convo_type_speech');

    // Radio button and format logic...

    const formData = new FormData();
    formData.append("file", file);

    try {
      const api_response = await uploadFile(formData); // Call the uploadFile function
      console.log(api_response);

      if (api_response && api_response.data && api_response.data.message) {
        document.getElementById("generated_summary").innerHTML = api_response.data.message;
      } else {
        console.error('API response is null or missing expected data');
        // Handle error condition, such as displaying an error message to the user
      }
    } catch (error) {
      console.error('Error occurred while uploading file:', error);
      // Handle error condition, such as displaying an error message to the user
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '80vh', paddingTop: '70px', backgroundColor: '#f4f4f4' }}>
      <div style={{ border: '2px solid #3498db', padding: '20px', borderRadius: '10px', boxSizing: 'border-box', width: '70%', background: 'white' }}>
        <h1 className={Styles.heading} style={{ textAlign: 'center', marginBottom: '20px', color: '#3498db' }}>Conversation Summarizer</h1>
        <div className={Styles.iodiv} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '48%' }}>
            <div className="iohead" style={{ textAlign: 'center' }}>Input</div>
            <div>Select format</div>
            <br />
            <RadioButtonGroup
              defaultSelected="audio"
              name="format"
              onChange={(value) => disRadio(value)}
            >
              <RadioButton id="select_format_audio" value="audio" labelText="Audio" />
              <RadioButton id="select_format_video" value="video" labelText="Video" />
              <RadioButton id="select_format_text" value="text" labelText="Text" />
            </RadioButtonGroup>
          
            <br />
            <FileUploader
              id="upload"
              labelText="Upload" // Use labelText instead of labeltext
              style={{ marginLeft: '10px' }}
              accept={upload.accept}
              onChange={(event) => onFileChange(event)}
              buttonLabel="Upload"
            />
        
            <div id="file-chosen"></div>
            <br />
            <div>Select conversation type</div>
            <br />
            <RadioButtonGroup
              defaultSelected="scrum"
              name="convoType"
              onChange={(value) => disRadio(value)}
            >
              <RadioButton id="convo_type_scrum" value="scrum" labelText="Scrum" />
              <RadioButton id="convo_type_interview" value="interview" labelText="Interview" />
              <RadioButton id="convo_type_speech" value="speech" labelText="Speech" />
            </RadioButtonGroup>
            <br />
            <Button style={{ marginLeft: '10px', marginTop: '20px' }} onClick={() => calValue()}>Summarize</Button>
          </div>
          <div style={{ width: '58%', borderLeft: '1px dashed #3498db', paddingLeft: '20px' }}>
            <div className="iohead" style={{ textAlign: 'center' }}>Output</div>
            <ul className="generated_summary" id="generated_summary"></ul>
            <div className={Styles.download} style={{ marginTop: '10px' }}>
              <Button style={{ marginLeft: '10px' }} onClick={() => downloadTxtFile()}>Download</Button>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', marginTop: '10px', color: '#3498db' }}>Powered by WatsonX.ai</div>
      </div>
    </div>
  );
};

export default App;
