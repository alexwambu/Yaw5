import axios from "axios";

export const API_BASE = "https://yaw5a.onrender.com";

export async function generateMovie({ script, title, images, clips }) {
  const form = new FormData();
  form.append("script", script);
  form.append("title", title);

  images.forEach((file) => form.append("images", file));
  clips.forEach((file) => form.append("clips", file));

  const res = await axios.post(`${API_BASE}/generate_movie`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function checkStatus(jobId) {
  const res = await axios.get(`${API_BASE}/status/${jobId}`);
  return res.data;
}

export async function generateCharacter(imageFile, script) {
  const form = new FormData();
  form.append("image", imageFile);
  form.append("script", script);

  const res = await axios.post(`${API_BASE}/character_from_image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}
