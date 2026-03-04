import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv('OPENROUTER_API_KEY'),
)

# Image input embeddings use multimodal content format
embedding = client.embeddings.create(
  extra_headers={
    "HTTP-Referer": "https://edushare.uz",
    "X-OpenRouter-Title": "EduShare",
  },
  model="nvidia/llama-nemotron-embed-vl-1b-v2:free",
  input=[
    {
      "content": [
        {"type": "text", "text": "What is in this image?"},
        {"type": "image_url", "image_url": {"url": "https://live.staticflickr.com/3851/14825276609_098cac593d_b.jpg"}}
      ]
    }
  ],
  encoding_format="float"
)

print(embedding.data[0].embedding[:5])