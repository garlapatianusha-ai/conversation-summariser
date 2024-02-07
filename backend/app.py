#Importing Required Libraries
import os
import time
import json
import pandas as pd
from ibm_watson import SpeechToTextV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from moviepy.editor import VideoFileClip
from dotenv import load_dotenv
from typing import Any, List, Mapping, Optional, Union, Dict
from pydantic import BaseModel, Extra
from ibm_watson_machine_learning import APIClient
try:
    from langchain import PromptTemplate
    from langchain.chains import LLMChain, SimpleSequentialChain
    from langchain.document_loaders import PyPDFLoader
    from langchain.indexes import VectorstoreIndexCreator #vectorize db index with chromadb
    from langchain.embeddings import HuggingFaceEmbeddings #for using HugginFace embedding models
    from langchain.text_splitter import CharacterTextSplitter #text splitter
    from langchain.llms.base import LLM
    from langchain.llms.utils import enforce_stop_tokens
except ImportError:
    raise ImportError("Could not import langchain: Please install ibm-generative-ai[langchain] extension.")
from ibm_watson_machine_learning.foundation_models import Model
from flask import Flask, render_template, jsonify, request
from ibm_watson_machine_learning.metanames import GenTextParamsMetaNames as GenParams
from urllib3.util.ssl_ import DEFAULT_CIPHERS
from flask_cors import CORS

input_video = 'Sputniko!.mp4'
output_audio = 'Sputniko.mp3'
audio_file_path = 'Sputniko.mp3'
api_key = '3lvsGwq7W8etgl8d5Wb0RzQxPTkmcl1LSYPSJXuSL9oC'
service_url = "https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/968eabd9-899e-4f77-a460-cec61c66a487"
api_key1 = os.getenv("API_KEY", None)
ibm_cloud_url = os.getenv("IBM_CLOUD_URL", None)
project_id = os.getenv("PROJECT_ID", None)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

#Set Environment Variables
os.environ["IMAGEIO_FFMPEG_EXE"] = "/opt/homebrew/bin/ffmpeg"
load_dotenv()

# --------- Function to convert video to audio ----------- #
def video_to_audio(input_video, output_audio):
    # Load the video clip
    video_clip = VideoFileClip(input_video)

    # Extract audio from the video
    audio_clip = video_clip.audio

    # Save the audio to an MP3 file
    audio_clip.write_audiofile(output_audio)

    # Close the video and audio clips
    video_clip.close()
    audio_clip.close()

# --------- Function to convert speech2text ------------ #
    
def transcribe_audio(api_key, service_url, audio_file_path):
    # Authentication
    authenticator = IAMAuthenticator(api_key)
    speech_to_text = SpeechToTextV1(authenticator=authenticator)
    speech_to_text.set_service_url(service_url)

    # Speech to Text
    with open(audio_file_path, 'rb') as audio_file:
        speech_recognition_results = speech_to_text.recognize(
            audio=audio_file,
            content_type='audio/mp3',
            word_alternatives_threshold=0.9,
            speaker_labels=True,
        ).get_result()

    return speech_recognition_results

# Function to generate a transcipt from speech2text results
def process_transcript(speech_recognition_results):
    text = []
    start_time = []
    end_time = []
    
    # Formatting the output 
    for val in speech_recognition_results['results']:
        text.append(val['alternatives'][0]['transcript'])
        start_time.append(val['alternatives'][0]['timestamps'][0][1])
        end_time.append(val['alternatives'][0]['timestamps'][-1][2])

    # Dumping the transcript to json
    j = json.dumps(speech_recognition_results, indent=4)
    open('transcript.json', 'w').write(j)

    transcript = pd.DataFrame()
    transcript['sentence'] = text
    transcript['start_time'] = start_time
    transcript['end_time'] = end_time

    speaker = []

    for i in range(len(transcript)):
        sent_start = transcript['start_time'][i]
        sent_end = transcript['end_time'][i]

        speaker_start, speaker_end = -1, -1
        for val in speech_recognition_results['speaker_labels']:
            if val['from'] == sent_start:
                speaker_start = val['speaker']
            if val['to'] == sent_end:
                speaker_end = val['speaker']

            if speaker_end != -1:
                if speaker_start != speaker_end:
                    speaker.append(str(speaker_start) + ' and ' + str(speaker_end))
                else:
                    speaker.append(str(speaker_end))
                break

    transcript['speaker'] = speaker
    transcript.to_csv('transcript.csv', index=False)


# --------- Function to summarise the conversation using WatsonX Model ---------- #
def summarize_conversation(transcript, api_key1, ibm_cloud_url, project_id):
    ##initializing WatsonX model
    params = {
        GenParams.DECODING_METHOD: "sample",
        GenParams.MIN_NEW_TOKENS: 10,
        GenParams.MAX_NEW_TOKENS: 150,
        GenParams.RANDOM_SEED: 42,
        GenParams.TEMPERATURE: 0,
        GenParams.TOP_K: 50,
        GenParams.TOP_P:1
    }

    creds = {
        "url": ibm_cloud_url,
        "apikey": api_key1
    }

    model = Model(
    model_id="meta-llama/llama-2-70b-chat",
    params=params,
    credentials=creds,
    project_id=project_id
    )

    # Wrap the WatsonX Model in a langchain.llms.base.LLM subclass to allow LangChain to interact with the model
    class LangChainInterface(LLM):
        credentials: Optional[Dict] = None
        model: Optional[str] = None
        params: Optional[Dict] = None
        project_id : Optional[str]=None

        class Config:
            """Configuration for this pydantic object."""
            extra = Extra.forbid

        @property
        def _identifying_params(self) -> Mapping[str, Any]:
            """Get the identifying parameters."""
            _params = self.params or {}
            return {
                **{"model": self.model},
                **{"params": _params},
            }

        @property
        def _llm_type(self) -> str:
            """Return type of llm."""
            return "IBM WATSONX"

        def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
            """Call the WatsonX model"""
            params = self.params or {}
            model = Model(model_id=self.model, params=params, credentials=self.credentials, project_id=self.project_id)
            text = model.generate_text(prompt)
            if stop is not None:
                text = enforce_stop_tokens(text, stop)
            return text
    llm_model = LangChainInterface(model='meta-llama/llama-2-70b-chat', credentials=creds, params=params, project_id=project_id)
    #predict with the model
    # response = f"""
    # Instructions:
    # 0. Identify the agenda for your own reference
    # 1. Keep the response concise, relevant and to the point
    # 2. Do not include irrelevant details in the response
    # 3. Keep the response only in bullet points
    # 4. Pay attention to detail and highlight the key points
    # 5. Do not include any other text like notes, headers etc
    
    # # Summarise the text from below:
    # # "{transcript[['sentence', 'speaker']]}" """
    
    response = f"""
    Summarize the provided text.
    Follow these guidelines:
    1. Keep the response brief, relevant, and in bullet points
    2. Exclude unnecessary details
    3. Highlight key points from the text
    4. Do not include extra text such as notes or headers
    Text: "{transcript[['sentence']]}" """ 

    # response = f"""
    # The below given text is a {type_of_conv}. Summarise and mention the key discussion pointers from the text shared:
    # "{'. '.join(list(transcript[['sentence']]))}" 

    # Instructions to follow while generating summary:
    # 0. Identify the agenda of discussion from the prompt shared above(for your own reference)
    # 1. Keep the summary concise, relevant and to the point
    # 2. Do not include irrelevant details in your summary like Instructions etc.
    # 3. Keep it only in bullet points
    # 4. Pay attention to detail and highlight the key points from the original prompt
    # 5. Do not include any other content like notes, headers etc
    # 6. Do not share the instructions in your final response. 
    # 7. Summary should include the following things in detail: 
    #     a. Agenda of the discussion
    #     b. Challenges: if any
    #     c. Steps to solve the challenges: if any
    #     d. Updates if any
    #     e. Next steps if any
    #     d. Conclusion
    # """
    
    summary = llm_model(response)
    with open('meeting_summary.txt', 'w') as f:
        f.write(summary)
        f.close()

    sentences = []
    for sent in transcript['sentence']:
        if '%HESITATION' in sent:
            sent = sent.replace('%HESITATION', '')
        sentences.append(sent)
    transcript['sentence'] = sentences
    return summary


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"})

    if file.filename.lower().endswith(('.mp4', '.avi', '.mkv')):
        video_path = 'Sputniko!.mp4'
        audio_path = 'uploaded_audio.mp3'
        
        file.save(video_path)
        video_to_audio(video_path, audio_path)
        speech_recognition_results = transcribe_audio(api_key, service_url, audio_path)
        process_transcript(speech_recognition_results)
        transcript = pd.read_csv('transcript.csv')
        sentences = [sent.replace('%HESITATION', '') for sent in transcript['sentence']]
        transcript['sentence'] = sentences
        summary = summarize_conversation(transcript, api_key1, ibm_cloud_url, project_id)

        return jsonify({"message": summary})

    elif file.filename.lower().endswith(('.mp3', '.wav')):
        audio_path = 'uploaded_audio.mp3'
        
        file.save(audio_path)
        speech_recognition_results = transcribe_audio(api_key, service_url, audio_path)
        process_transcript(speech_recognition_results)
        transcript = pd.read_csv('transcript.csv')
        sentences = [sent.replace('%HESITATION', '') for sent in transcript['sentence']]
        transcript['sentence'] = sentences
        summary = summarize_conversation(transcript, api_key1, ibm_cloud_url, project_id)

        return jsonify({"message": summary})

    elif file.filename.lower().endswith('.csv'):
        transcript_path = 'uploaded_transcript.csv'
        
        file.save(transcript_path)
        transcript = pd.read_csv(transcript_path)
        sentences = [sent.replace('%HESITATION', '') for sent in transcript['sentence']]
        transcript['sentence'] = sentences
        summary = summarize_conversation(transcript, api_key1, ibm_cloud_url, project_id)

        return jsonify({"message": summary})

    else:
        return jsonify({"error": "Unsupported file format"})

if __name__ == '__main__':
    app.run(debug=True)
