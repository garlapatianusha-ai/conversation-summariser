import { useState } from "react";
import { uploadFile } from './Api';
import './App.css';
import './index.css';

const App = () => {
  const [file, setFile] = useState(null);

  // const [summarizedText, setSummarizedText] = useState('');
  // const [downloadLink, setDownloadLink] = useState('');
  // const [loading, setLoading] = useState(false);
  // const [fileType, setFileType] = useState('video'); // Default to video


  // const handleSummarize = async (event) => {
  //   event.preventDefault();

  //   const formData = new FormData(event.target);

  //   try {
  //     setLoading(true);

  //     const response = await fetch('http://localhost:5000/summarize', {
  //       method: 'POST',
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const result = await response.json();
  //     window.alert(result)
  //     setSummarizedText(result.summary);
  //     setDownloadLink(result.download_link);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     setSummarizedText('Error occurred. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  function downloadTxtFile() {
    const element = document.createElement("a");
    const file = new Blob([document.getElementById('generated_summary').value],
      { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "myFile.txt";
    document.body.appendChild(element);
    element.click();
  }

  function disRadio(button) {
    //fetch select format radio button data

    //fetch select format radio button data
    let audio = document.getElementById('select_format_audio');
    let video = document.getElementById('select_format_video');
    let text = document.getElementById('select_format_text');

    //fetch conversation type radio button data
    let scrum = document.getElementById('convo_type_scrum');
    let interview = document.getElementById('convo_type_interview');
    let speech = document.getElementById('convo_type_speech');

    if (button == "video" && video && video.checked == true) {
      audio.checked = false;
      text.checked = false;
    }
    if (button == "text" && text && text.checked == true) {
      audio.checked = false;
      video.checked = false;
    }
    if (button == "audio" && audio && audio.checked == true) {
      video.checked = false;
      text.checked = false;
    }
    if (button == "scrum" && scrum && scrum.checked == true) {
      interview.checked = false;
      speech.checked = false;
    }
    if (button == "interview" && interview && interview.checked == true) {
      scrum.checked = false;
      speech.checked = false;
    }
    if (button == "speech" && speech && speech.checked == true) {
      interview.checked = false;
      scrum.checked = false;
    }
  }


  const onFileChange = (event) => {
    const fileChosen = document.getElementById('file-chosen');
    if (event.target.files && event.target.files[0]) {
      const files = event.target.files;
      setFile(event.target.files[0])
      fileChosen.innerHTML = files[0].name
    }else{
      fileChosen.innerHTML = "Please select a file";
    }
  }

  function upload() {

    let audio = document.getElementById('select_format_audio');
    let video = document.getElementById('select_format_video');
    let text = document.getElementById('select_format_text');
    let upload = document.getElementById('upload');

    if (text && text.checked == true && upload) {
      upload.accept = ".txt, .json, .csv"
    } else if (audio && audio.checked == true && upload) {
      upload.accept = ".mp3"
    } else if (video && video.checked == true && upload) {
      upload.accept = ".mp4"
    }
  }

  async function calValue() {
    //fetch select format radio button data
    let audio = document.getElementById('select_format_audio');
    let text = document.getElementById('select_format_text');
    let video = document.getElementById('select_format_video');

    //fetch conversation type radio button data
    let scrum = document.getElementById('convo_type_scrum');
    let interview = document.getElementById('convo_type_interview');
    let speech = document.getElementById('convo_type_speech');

    let format;
    let convo_type;
    //check which format is selected using radio button
    if (text && text.checked == true) {
      format = "text";
    } else if (audio && audio.checked == true) {
      format = "audio";
    } else if (video && video.checked == true) {
      format = "video"
    }

    //check which convo_type is selected using radio button
    if (scrum && scrum.checked == true) {
      convo_type = "scrum";
    } else if (interview && interview.checked == true) {
      convo_type = "interview";
    } else if (speech && speech.checked == true) {
      convo_type = "speech"
    }

    const formData = new FormData();
    formData.append("file",file);
    const api_response = await uploadFile(formData);
    console.log(api_response)
    let summary;
    // if (document.getElementById("generated_summary") && format && convo_type) {
    //   summary = document.getElementById("generated_summary").innerHTML = "Your selected format is: " + format + "</br> and </br> Selected convo_type is: " + convo_type;
    // }
    summary = document.getElementById("generated_summary").innerHTML = api_response.data.message; 
    //return data to HTML form
    return summary
  }

  // const actualBtn = document.getElementById('upload');
  // const fileChosen = document.getElementById('file-chosen');
  // actualBtn.addEventListener('change', function(){
  //   fileChosen.textContent = this.files[0].name
  // })

  return (
    <div>
      <div className='heading'>Conversation Summarizer</div>
      <div className='iodiv'>
        <div>
          <div className="iohead">Input</div>
          <div> Select format </div>
          <br />
          <div>
            <div>
              <input id="select_format_audio" type="radio" value="audio" name="audio" onChange={() => disRadio("audio")} />
              <label for="select_format_audio">Audio</label><br />
              <input id="select_format_text" type="radio" value="text" name="text" onChange={() => disRadio("text")} />
              <label for="select_format_text">Text</label><br />
              <input id="select_format_video" type="radio" value="video" name="video" onChange={() => disRadio("video")} />
              <label for="select_format_video">Video</label><br />
            </div>
            <br />
            <input type="file" id="upload" accept hidden onChange={onFileChange} onClick={() => upload()} />
            <label className="upload" for="upload" >Upload </label>
            <span id="file-chosen"></span>
          </div>
          <br />
          <div> Select conversation type</div>
          <br />
          <div>
            <div>
              <input id="convo_type_scrum" type="radio" value="scrum" name="scrum" onChange={() => disRadio("scrum")} />
              <label for="convo_type_scrum">Scrum</label><br />
              <input id="convo_type_interview" type="radio" value="interview" name="interview" onChange={() => disRadio("interview")} />
              <label for="convo_type_interview">Interview</label><br />
              <input id="convo_type_speech" type="radio" value="speech" name="speech" onChange={() => disRadio("speech")} />
              <label for="convo_type_speech">Speech</label><br />

            </div>
            <br />
            <button onClick={() => calValue()}>Summarize</button>
          </div>
        </div>
        <div className="vertical"></div>
        <div>
          <div className="iohead">Output</div>
          <div className="generated_summary" id="generated_summary"></div>
          <div className="download">
            <button onClick={() => downloadTxtFile()}>Download</button>
          </div>
        </div>
      </div>

      {/* <form onSubmit={handleSummarize} encType="multipart/form-data">
        <label htmlFor="file_type">Select File Type:</label>
        <select>
          id="file_type"
          name="file_type"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="text">Text</option>
        </select>

        <label htmlFor="conversation_type">Select Conversation Type:</label>
        <select id="conversation_type" name="conversation_type">
          <option value="scrum">Scrum Call</option>
          <option value="interview">Interview</option>
          <option value="speech">Speech</option>
        </select>

        <input type="file" name="file" accept=".txt, .audio, .video, .mp4, .avi, .mkv, .mp3, .wav, .csv, .json" />

        <button type="submit">
          Summarize
        </button>
      </form>

      {loading && <p>Loading...</p>}

      <div id="output-box">
        <h2>Summarized Conversation</h2>
        <p>{summarizedText}</p>
        {downloadLink && (
          <a href={downloadLink} download="summarized_conversation.txt">
            <button>Download</button>
          </a>
        )}
      </div> */}
    </div>
  );
};

export default App;

