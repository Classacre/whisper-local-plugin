# src/python/whisper_bridge.py
import sys
import json
import torch
from pathlib import Path
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor
import numpy as np

class WhisperTranscriber:
    def __init__(self, model_type="distil-large-v2", batch_size=4, use_flash_attention=False):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.torch_dtype = torch.float16 if self.device == "cuda" else torch.float32
        
        self.model = AutoModelForSpeechSeq2Seq.from_pretrained(
            f"openai/whisper-{model_type}",
            torch_dtype=self.torch_dtype,
            low_cpu_mem_usage=True,
            use_safetensors=True,
            use_flash_attention_2=use_flash_attention
        )
        self.model.to(self.device)
        
        self.processor = AutoProcessor.from_pretrained(f"openai/whisper-{model_type}")
        self.batch_size = batch_size

    def transcribe(self, audio_path):
        try:
            # Load and process audio
            input_features = self.processor(
                audio_path, 
                return_tensors="pt", 
                sampling_rate=16000
            ).input_features.to(self.device)

            # Generate transcription
            predicted_ids = self.model.generate(
                input_features,
                max_length=448,
                chunk_length=30,
                batch_size=self.batch_size
            )
            
            # Decode the transcription
            transcription = self.processor.batch_decode(
                predicted_ids, 
                skip_special_tokens=True
            )[0]

            return {"success": True, "text": transcription}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    transcriber = WhisperTranscriber(
        model_type=input_data.get("model_type", "distil-large-v2"),
        batch_size=input_data.get("batch_size", 4),
        use_flash_attention=input_data.get("use_flash_attention", False)
    )
    
    result = transcriber.transcribe(input_data["audio_path"])
    
    # Write result to stdout
    sys.stdout.write(json.dumps(result))
    sys.stdout.flush()