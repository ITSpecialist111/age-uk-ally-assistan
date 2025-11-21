# Implementation Guide: Migration to Foundry Local

This guide provides step-by-step instructions for migrating Age UK Ally from cloud-based AI to Microsoft Foundry Local offline capabilities.

## Quick Start

### Step 1: Install Foundry Local (5 minutes)

**Windows:**
```powershell
winget install Microsoft.FoundryLocal
```

**macOS:**
```bash
brew install microsoft/foundrylocal/foundrylocal
```

**Verify Installation:**
```bash
foundry --version
foundry status
```

### Step 2: Download AI Models (10 minutes)

```bash
# Download Phi-3.5-Mini (recommended for development)
foundry model pull phi-3.5-mini

# Or Phi-4-Mini (better quality, larger size)
foundry model pull phi-4-mini

# Verify cached models
foundry cache list
```

### Step 3: Test Basic Inference (5 minutes)

Create a test file `test_foundry.py`:

```python
from foundry_local import FoundryLocalManager
import openai

# Initialize Foundry Local
manager = FoundryLocalManager("phi-3.5-mini")
print(f"✓ Foundry Local endpoint: {manager.endpoint}")

# Create OpenAI client pointing to local endpoint
client = openai.OpenAI(
    base_url=manager.endpoint,
    api_key=manager.api_key
)

# Test inference
response = client.chat.completions.create(
    model=manager.model_info.id,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain what Foundry Local is in one sentence."}
    ]
)

print(f"✓ Response: {response.choices[0].message.content}")
```

Run it:
```bash
pip install foundry-local-sdk openai
python test_foundry.py
```

Expected output:
```
✓ Foundry Local endpoint: http://localhost:5273/v1
✓ Response: Foundry Local is Microsoft's on-device AI runtime that runs language models entirely offline without requiring cloud connectivity.
```

---

## Implementation Phases

## Phase 1: AI Service Abstraction Layer

Create a unified service that can use either Foundry Local or Spark Runtime.

### 1.1: Create Service Directory

```bash
mkdir -p src/services
```

### 1.2: Implement AI Service

Create `src/services/ai-service.ts`:

```typescript
import type { TranscriptItem } from '@/types'

interface AIProvider {
  generateInsight(transcript: string, speaker: string): Promise<InsightResponse>
  generateKnowledge(transcript: string): Promise<KnowledgeResponse>
  isAvailable(): boolean
}

interface InsightResponse {
  type: 'suggestion' | 'alert' | 'safeguarding'
  text: string
}

interface KnowledgeResponse {
  title: string
  source: string
  snippet: string
}

class SparkRuntimeProvider implements AIProvider {
  async generateInsight(transcript: string, speaker: string): Promise<InsightResponse> {
    const prompt = (window as any).spark.llmPrompt`
      Analyze this transcript from an Age UK advice session.
      Speaker: ${speaker}
      Text: "${transcript}"
      
      Provide insights in one of these categories:
      - "alert": Emotional state or risk indicators
      - "suggestion": Advice for the advisor
      - "safeguarding": Immediate concerns requiring action
      
      Respond with JSON: {"type": "alert|suggestion|safeguarding", "text": "your insight"}
    `
    
    const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
    return JSON.parse(response)
  }
  
  async generateKnowledge(transcript: string): Promise<KnowledgeResponse> {
    const prompt = (window as any).spark.llmPrompt`
      Based on this Age UK meeting transcript, suggest relevant knowledge resources.
      Text: "${transcript}"
      
      Respond with JSON: {"title": "Resource Title", "source": "The Bible|Learned Knowledge", "snippet": "Brief excerpt"}
      Only respond if relevant to housing, benefits, care, or Age UK services.
    `
    
    const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
    const result = JSON.parse(response)
    return result.title ? result : null
  }
  
  isAvailable(): boolean {
    return typeof (window as any).spark !== 'undefined'
  }
}

// Future: Foundry Local Provider
class FoundryLocalProvider implements AIProvider {
  private endpoint: string = 'http://localhost:5273/v1'
  private modelId: string = 'phi-3.5-mini'
  private isConnected: boolean = false
  
  constructor() {
    this.checkConnection()
  }
  
  private async checkConnection() {
    try {
      const response = await fetch(`${this.endpoint}/models`)
      this.isConnected = response.ok
    } catch {
      this.isConnected = false
    }
  }
  
  async generateInsight(transcript: string, speaker: string): Promise<InsightResponse> {
    const response = await fetch(`${this.endpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.modelId,
        messages: [
          { role: 'system', content: 'You are an AI assistant analyzing Age UK advice sessions.' },
          { role: 'user', content: `Analyze this ${speaker} statement: "${transcript}". Provide one insight as JSON: {"type": "alert|suggestion|safeguarding", "text": "insight"}` }
        ],
        response_format: { type: 'json_object' }
      })
    })
    
    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  }
  
  async generateKnowledge(transcript: string): Promise<KnowledgeResponse> {
    // Similar implementation...
    return null
  }
  
  isAvailable(): boolean {
    return this.isConnected
  }
}

export class AIService {
  private provider: AIProvider
  
  constructor() {
    // Try Foundry Local first, fallback to Spark
    const foundryProvider = new FoundryLocalProvider()
    const sparkProvider = new SparkRuntimeProvider()
    
    this.provider = foundryProvider.isAvailable() ? foundryProvider : sparkProvider
    
    console.log(`Using AI provider: ${this.provider.constructor.name}`)
  }
  
  async generateInsight(transcript: string, speaker: string): Promise<InsightResponse> {
    return this.provider.generateInsight(transcript, speaker)
  }
  
  async generateKnowledge(transcript: string): Promise<KnowledgeResponse> {
    return this.provider.generateKnowledge(transcript)
  }
  
  getCurrentProvider(): string {
    return this.provider.constructor.name
  }
}
```

### 1.3: Update App.tsx to Use Service

In `src/App.tsx`, replace direct `spark.llm` calls:

```typescript
// Add import at top
import { AIService } from '@/services/ai-service'

// In component
const [aiService] = useState(() => new AIService())

// Replace generateInsights function
const generateInsights = async (transcript: string, speaker: 'Advisor' | 'Client') => {
  try {
    const insight = await aiService.generateInsight(transcript, speaker)
    
    if (insight.type && insight.text) {
      addInsight(insight)
    }
  } catch (error) {
    console.error('Error generating insights:', error)
  }
}

// Replace generateKnowledge function
const generateKnowledge = async (transcript: string) => {
  try {
    const knowledge = await aiService.generateKnowledge(transcript)
    
    if (knowledge && knowledge.title) {
      addKnowledgeItem(knowledge)
    }
  } catch (error) {
    console.error('Error generating knowledge:', error)
  }
}
```

---

## Phase 2: Offline Speech Recognition Setup

### 2.1: Install Python Dependencies

```bash
pip install faster-whisper pyannote.audio torch torchaudio
```

### 2.2: Create Backend Service

Create `backend/whisper_service.py`:

```python
from faster_whisper import WhisperModel
from pyannote.audio import Pipeline
import numpy as np
import asyncio
from typing import List, Dict
import pyaudio

class OfflineTranscriptionService:
    def __init__(self, model_size: str = "base"):
        print("Loading Whisper model...")
        self.whisper_model = WhisperModel(
            model_size, 
            device="cpu", 
            compute_type="int8"
        )
        
        print("Loading speaker diarization...")
        self.diarization_pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token="YOUR_HUGGINGFACE_TOKEN"
        )
        
        self.speaker_map = {}
        self.first_speaker = None
        
    def transcribe_audio_file(self, audio_path: str) -> List[Dict]:
        """Transcribe pre-recorded audio with speaker identification"""
        
        # Transcribe with Whisper
        segments, info = self.whisper_model.transcribe(
            audio_path, 
            beam_size=5,
            language="en",
            vad_filter=True  # Voice activity detection
        )
        
        # Perform speaker diarization
        diarization = self.diarization_pipeline(
            audio_path,
            num_speakers=2
        )
        
        # Map speakers
        result = []
        for segment in segments:
            start_time = segment.start
            
            # Find speaker at this timestamp
            speaker_label = None
            for turn, _, label in diarization.itertracks(yield_label=True):
                if turn.start <= start_time <= turn.end:
                    speaker_label = label
                    break
            
            # Map to Advisor/Client
            if speaker_label:
                if self.first_speaker is None:
                    self.first_speaker = speaker_label
                    self.speaker_map[speaker_label] = "Advisor"
                elif speaker_label not in self.speaker_map:
                    self.speaker_map[speaker_label] = "Client"
                
                friendly_speaker = self.speaker_map.get(speaker_label, "Unknown")
            else:
                friendly_speaker = "Unknown"
            
            result.append({
                "speaker": friendly_speaker,
                "text": segment.text,
                "start": segment.start,
                "end": segment.end,
                "confidence": segment.no_speech_prob
            })
        
        return result
    
    def transcribe_realtime_stream(self):
        """Real-time transcription from microphone"""
        CHUNK = 1024
        RATE = 16000
        
        audio = pyaudio.PyAudio()
        stream = audio.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=RATE,
            input=True,
            frames_per_buffer=CHUNK
        )
        
        print("🎤 Listening...")
        
        audio_buffer = []
        while True:
            data = stream.read(CHUNK)
            audio_buffer.append(np.frombuffer(data, dtype=np.int16))
            
            # Every 30 seconds, transcribe buffer
            if len(audio_buffer) >= (RATE * 30) / CHUNK:
                audio_segment = np.concatenate(audio_buffer)
                
                # Transcribe segment
                segments, info = self.whisper_model.transcribe(
                    audio_segment,
                    beam_size=5,
                    language="en"
                )
                
                for segment in segments:
                    yield {
                        "text": segment.text,
                        "start": segment.start,
                        "end": segment.end
                    }
                
                audio_buffer = []

# Usage
if __name__ == "__main__":
    service = OfflineTranscriptionService(model_size="base")
    
    # Test with audio file
    transcript = service.transcribe_audio_file("test_meeting.wav")
    
    for item in transcript:
        print(f"{item['speaker']}: {item['text']}")
```

### 2.3: Create REST API

Create `backend/api.py`:

```python
from fastapi import FastAPI, UploadFile, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from whisper_service import OfflineTranscriptionService
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

transcription_service = OfflineTranscriptionService()

@app.post("/transcribe")
async def transcribe_file(file: UploadFile):
    """Upload audio file and get transcription"""
    
    # Save uploaded file
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Transcribe
    result = transcription_service.transcribe_audio_file(file_path)
    
    return {"transcript": result}

@app.websocket("/ws/realtime")
async def realtime_transcription(websocket: WebSocket):
    """WebSocket for real-time transcription"""
    await websocket.accept()
    
    try:
        for segment in transcription_service.transcribe_realtime_stream():
            await websocket.send_json(segment)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

Run the server:
```bash
pip install fastapi uvicorn python-multipart
python backend/api.py
```

### 2.4: Connect Frontend to Backend

Update `src/App.tsx`:

```typescript
// Add WebSocket connection
const wsRef = useRef<WebSocket | null>(null)

const connectToWhisperService = () => {
  const ws = new WebSocket('ws://localhost:8000/ws/realtime')
  
  ws.onopen = () => {
    console.log('✓ Connected to Whisper service')
  }
  
  ws.onmessage = (event) => {
    const segment = JSON.parse(event.data)
    processTranscript(segment.text)
  }
  
  ws.onerror = (error) => {
    console.warn('Whisper service unavailable, using Web Speech API')
  }
  
  wsRef.current = ws
}

// In startSession
const startSession = () => {
  setSessionStarted(true)
  setIsRecording(true)
  
  // Try Whisper service first
  try {
    connectToWhisperService()
  } catch {
    // Fallback to Web Speech API
    if (recognitionRef.current) {
      recognitionRef.current.start()
    } else {
      startDemoMode()
    }
  }
}
```

---

## Phase 3: RAG Knowledge Base

### 3.1: Setup FAISS Vector Store

Create `backend/knowledge_base.py`:

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os

class OfflineKnowledgeBase:
    def __init__(self, persist_directory="./vector_store"):
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        self.persist_directory = persist_directory
        self.vector_store = None
        
        if os.path.exists(persist_directory):
            print(f"Loading existing knowledge base from {persist_directory}")
            self.vector_store = FAISS.load_local(
                persist_directory,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
    
    def ingest_pdfs(self, pdf_directory: str):
        """Batch ingest all PDFs from directory"""
        all_chunks = []
        
        for filename in os.listdir(pdf_directory):
            if filename.endswith('.pdf'):
                pdf_path = os.path.join(pdf_directory, filename)
                print(f"Processing: {filename}")
                
                # Load PDF
                loader = PyPDFLoader(pdf_path)
                documents = loader.load()
                
                # Split into chunks
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200
                )
                chunks = text_splitter.split_documents(documents)
                
                # Add metadata
                for chunk in chunks:
                    chunk.metadata['source_file'] = filename
                
                all_chunks.extend(chunks)
        
        # Create or update vector store
        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(all_chunks, self.embeddings)
        else:
            self.vector_store.add_documents(all_chunks)
        
        # Persist
        self.vector_store.save_local(self.persist_directory)
        
        print(f"✓ Ingested {len(all_chunks)} chunks from {len(os.listdir(pdf_directory))} PDFs")
    
    def query(self, question: str, k: int = 3):
        """Search knowledge base"""
        if self.vector_store is None:
            return []
        
        docs = self.vector_store.similarity_search_with_score(question, k=k)
        
        return [
            {
                "content": doc.page_content,
                "source": doc.metadata.get('source_file', 'Unknown'),
                "page": doc.metadata.get('page', 0),
                "score": float(score)
            }
            for doc, score in docs
        ]

# Setup script
if __name__ == "__main__":
    kb = OfflineKnowledgeBase()
    
    # Ingest Age UK resources
    kb.ingest_pdfs("./age_uk_resources")
    
    # Test query
    results = kb.query("What are the eligibility criteria for Attendance Allowance?")
    print("\n📚 Knowledge Base Test Results:")
    for result in results:
        print(f"  Source: {result['source']}, Page: {result['page']}")
        print(f"  Content: {result['content'][:200]}...")
        print()
```

### 3.2: Add API Endpoint

Add to `backend/api.py`:

```python
from knowledge_base import OfflineKnowledgeBase

kb = OfflineKnowledgeBase()

@app.post("/knowledge/ingest")
async def ingest_pdfs(directory: str):
    """Ingest PDFs from directory"""
    kb.ingest_pdfs(directory)
    return {"status": "success"}

@app.post("/knowledge/query")
async def query_knowledge(question: str, k: int = 3):
    """Query knowledge base"""
    results = kb.query(question, k)
    return {"results": results}
```

### 3.3: Frontend Integration

Create `src/services/knowledge-service.ts`:

```typescript
export class KnowledgeService {
  private baseUrl = 'http://localhost:8000'
  
  async queryKnowledgeBase(question: string): Promise<KnowledgeResult[]> {
    const response = await fetch(`${this.baseUrl}/knowledge/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, k: 3 })
    })
    
    const data = await response.json()
    return data.results
  }
  
  async uploadPDF(file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    
    await fetch(`${this.baseUrl}/knowledge/upload`, {
      method: 'POST',
      body: formData
    })
  }
}

interface KnowledgeResult {
  content: string
  source: string
  page: number
  score: number
}
```

---

## Testing

### Test Foundry Local
```bash
cd tests
python test_foundry_local.py
```

### Test Whisper
```bash
python test_whisper.py --audio test_meeting.wav
```

### Test RAG
```bash
python test_rag.py --query "What are housing benefits?"
```

### Test Full Pipeline
```bash
# Start backend
python backend/api.py

# Start frontend (separate terminal)
npm run dev

# Upload test audio and observe real-time processing
```

---

## Next Steps

1. **✅ Complete Phase 1**: Service abstraction layer
2. **🔄 Start Phase 2**: Install Python dependencies and test Whisper
3. **📋 Plan Phase 3**: Organize Age UK PDF resources
4. **📝 Document**: Update README with setup instructions
5. **🧪 Test**: Create test audio files and benchmark performance

---

## Troubleshooting

### Foundry Local Connection Issues
```bash
# Check if service is running
foundry status

# Restart service
foundry restart

# Check logs
foundry logs --tail 50
```

### Whisper Out of Memory
- Use smaller model: `base` instead of `small`
- Reduce chunk size in audio processing
- Enable `compute_type="int8"` for quantization

### FAISS Installation Issues
```bash
# If FAISS fails to install
pip uninstall faiss-cpu
pip install faiss-cpu --no-cache-dir

# Or use conda
conda install -c conda-forge faiss-cpu
```

---

*For questions, see FOUNDRY_LOCAL_ARCHITECTURE.md or open a GitHub issue.*
