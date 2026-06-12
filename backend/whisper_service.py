import whisper
import sys
import json

model = whisper.load_model("base")

file_path = sys.argv[1]

result = model.transcribe(file_path)

print(json.dumps(result))