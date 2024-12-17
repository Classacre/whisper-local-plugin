import sys
import json
import torch
from transformers import pipeline
from transformers.utils import is_flash_attn_2_available

def main():
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    # Extract parameters
    audio_path = input_data['audio_path']
    model_type = input_data['model_type']
    batch_size = input_data['batch_size']
    use_flash_attention = input_data['use_flash_attention']
    language = input_data.get('language', None)
    
    try:
        # Initialize pipeline with optimized settings
        pipe = pipeline(
            "automatic-speech-recognition",
            model=f"openai/whisper-{model_type}",
            torch_dtype=torch.float16,
            device="cuda:0",
            model_kwargs={
                "attn_implementation": "flash_attention_2" 
                if use_flash_attention and is_flash_attn_2_available() 
                else "sdpa"
            }
        )
        
        # Transcribe with optimized settings
        outputs = pipe(
            audio_path,
            chunk_length_s=30,
            batch_size=batch_size,
            language=language if language != 'auto' else None,
            return_timestamps=True
        )
        
        # Return success result
        print(json.dumps({
            "success": True,
            "text": outputs["text"]
        }))
        
    except Exception as e:
        # Return error result
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

if __name__ == "__main__":
    main() 