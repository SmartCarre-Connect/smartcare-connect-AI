import axios from 'axios';

const API = axios.create({ baseURL: '/api/v1' });

export async function generateVideo(avatar_id, script, language = 'en', voice = 'female', title = 'smartcare-onboarding') {
  const res = await API.post('/heygen/generate', { avatar_id, script, language, voice, title });
  return res.data;
}

export async function getJobStatus(jobId) {
  const res = await API.get(`/heygen/status/${jobId}`);
  return res.data;
}
