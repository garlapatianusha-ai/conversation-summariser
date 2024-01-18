import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:5000";

export const uploadFile = async (data)=>{
    try{
        const response = await axios.post(`${API_BASE_URL}/upload`,data);
        return response
    }catch(e){
        console.log(e)
        return null
    }
}
