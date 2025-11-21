# Microsoft Foundry Local Integration Architecture

## Overview

This document outlines the technical architecture for migrating Age UK Ally from cloud-based AI (Spark Runtime) to fully offline capabilities using **Microsoft Foundry Local**. This enables the application to run entirely on-device without Azure subscriptions, perfect for handling sensitive client conversations where data privacy is paramount.

## Why Microsoft Foundry Local?

### Core Advantages
- ✅ **Zero Cloud Dependency**: Runs entirely on-device once models are cached locally
- ✅ **No Azure Subscription**: Completely free local inference
- ✅ **Privacy-First**: No meeting data leaves the device unless explicitly synced to OneDrive
- ✅ **Hardware Adaptive**: Automatically selects CPU/GPU/NPU variants based on available hardware
- ✅ **OpenAI Compatible**: Drop-in replacement for existing OpenAI SDK code
- ✅ **Cross-Platform**: Windows (x64/ARM64), macOS, Linux, and Android (private preview)

### Android Support Status
**Microsoft announced Android support on November 18, 2025** for "smartphones, tablets, and IoT devices" including Whisper model support for "privacy-preserving speech and audio processing". This aligns perfectly with your APK deployment goals.

---

## Architecture Components

### 1. AI Runtime Layer

#### Current (Phase 1 - MVP)
```typescript
// Using Spark Runtime (cloud-based)
const prompt = spark.llmPrompt`Analyze this meeting transcript...`
const response = await spark.llm(prompt, 'gpt-4o-mini', true)
```

#### Future (Phase 2 - Foundry Local)
```typescript
// Service abstraction layer for seamless migration
import { AIService } from '@/services/ai-service'

const aiService = new AIService() // Auto-detects Foundry Local or falls back to Spark
const response = await aiService.generateInsight(transcriptChunk)
```

**Implementation**:
```typescript
// src/services/ai-service.ts
import { FoundryLocalManager } from 'foundry-local-sdk'
import OpenAI from 'openai'

export class AIService {
  private client: OpenAI
  private isLocalAvailable: boolean
  
  constructor() {
    if (this.detectFoundryLocal()) {
      // Use local Foundry
      const manager = new FoundryLocalManager('phi-3.5-mini')
      this.client = new OpenAI({
        baseURL: manager.endpoint, // http://localhost:5273/v1
        apiKey: manager.apiKey
      })
      this.isLocalAvailable = true
    } else {
      // Fallback to Spark Runtime
      this.client = new OpenAI({
        baseURL: 'spark-runtime-proxy',
        apiKey: 'spark-key'
      })
      this.isLocalAvailable = false
    }
  }
  
  async generateInsight(transcript: string, speaker: string) {
    const prompt = `Analyze this ${speaker} statement: "${transcript}"
    Provide one insight as JSON: {"type": "alert|suggestion|safeguarding", "text": "insight"}`
    
    const response = await this.client.chat.completions.create({
      model: this.isLocalAvailable ? 'phi-3.5-mini' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })
    
    return JSON.parse(response.choices[0].message.content)
  }
}
```

### 2. Speech Recognition Layer

#### Current (Phase 1)
- **Technology**: Web Speech API (browser-native `SpeechRecognition`)
- **Limitations**: Limited speaker identification, requires internet on some browsers
- **Languages**: English (en-GB) only
- **Speaker Detection**: Heuristic-based (content analysis + pause patterns)

#### Future (Phase 2 - Offline Whisper)
```python
# Backend service (Python)
import whisper
from pyannote.audio import Pipeline

class WhisperTranscriptionService:
    def __init__(self):
        # Load Whisper model (runs completely offline once downloaded)
        self.whisper_model = whisper.load_model("base")
        
        # Load speaker diarization (requires HuggingFace token for first download)
        self.diarization_pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token="YOUR_HF_TOKEN"
        )
    
    def transcribe_with_speakers(self, audio_path: str):
        # Transcribe audio
        result = self.whisper_model.transcribe(audio_path, language="en")
        
        # Perform 2-speaker diarization
        diarization = self.diarization_pipeline(audio_path, num_speakers=2)
        
        # Map speakers to Advisor/Client based on first speaker assumption
        speaker_map = {}
        first_speaker = None
        
        transcript_with_speakers = []
        for segment in result["segments"]:
            start_time = segment["start"]
            
            # Find speaker at this timestamp
            speaker_label = None
            for turn, _, label in diarization.itertracks(yield_label=True):
                if turn.start <= start_time <= turn.end:
                    speaker_label = label
                    break
            
            # Map to Advisor/Client (assume first speaker is Advisor)
            if speaker_label:
                if first_speaker is None:
                    first_speaker = speaker_label
                    speaker_map[speaker_label] = "Advisor"
                elif speaker_label not in speaker_map:
                    speaker_map[speaker_label] = "Client"
                
                friendly_speaker = speaker_map.get(speaker_label, "Unknown")
            else:
                friendly_speaker = "Unknown"
            
            transcript_with_speakers.append({
                "speaker": friendly_speaker,
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"]
            })
        
        return transcript_with_speakers
```

**Real-Time Streaming** (for live meetings):
```python
from faster_whisper import WhisperModel
import pyaudio

model = WhisperModel("base", device="cpu", compute_type="int8")

# Audio stream
CHUNK = 1024
RATE = 16000
audio = pyaudio.PyAudio()
stream = audio.open(format=pyaudio.paInt16, channels=1, rate=RATE, input=True, frames_per_buffer=CHUNK)

audio_buffer = []
while meeting_active:
    data = stream.read(CHUNK)
    audio_buffer.append(np.frombuffer(data, dtype=np.int16))
    
    # Every 30 seconds, transcribe buffer
    if len(audio_buffer) >= (RATE * 30) / CHUNK:
        audio_segment = np.concatenate(audio_buffer)
        segments, info = model.transcribe(audio_segment, beam_size=5)
        
        for segment in segments:
            # Send to frontend via WebSocket
            send_transcript_update({
                "speaker": determine_speaker(segment),
                "text": segment.text,
                "timestamp": segment.start
            })
        
        audio_buffer = []
```

### 3. RAG Knowledge Base Layer

#### Current (Phase 1)
- Knowledge items generated dynamically by Spark LLM
- No persistent knowledge base
- Limited to LLM's training data

#### Future (Phase 2 - Offline FAISS)
```typescript
// Frontend TypeScript (for web version)
// Backend Python (for native desktop/Android)

// Python implementation
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

class OfflineKnowledgeBase:
    def __init__(self, persist_directory="./vector_store"):
        # Local embeddings (no API calls)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        self.persist_directory = persist_directory
        self.vector_store = None
        
        # Load existing vector store
        if os.path.exists(persist_directory):
            self.vector_store = FAISS.load_local(
                persist_directory, 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
    
    def ingest_pdf(self, pdf_path: str):
        """Add Age UK PDF to knowledge base"""
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        
        # Chunk documents
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = text_splitter.split_documents(documents)
        
        # Add metadata
        for i, chunk in enumerate(chunks):
            chunk.metadata['source_file'] = os.path.basename(pdf_path)
            chunk.metadata['chunk_id'] = i
        
        # Index in FAISS
        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        else:
            self.vector_store.add_documents(chunks)
        
        # Persist to disk
        self.vector_store.save_local(self.persist_directory)
        
        return len(chunks)
    
    def query(self, question: str, k: int = 3):
        """Retrieve relevant context"""
        if self.vector_store is None:
            return []
        
        docs = self.vector_store.similarity_search_with_score(question, k=k)
        
        return [{
            "content": doc.page_content,
            "source": doc.metadata.get('source_file', 'Unknown'),
            "page": doc.metadata.get('page', 'N/A'),
            "relevance_score": score
        } for doc, score in docs]

# Usage during meeting
kb = OfflineKnowledgeBase()

# Pre-meeting: Ingest Age UK resources
kb.ingest_pdf("age_uk_bible_housing.pdf")
kb.ingest_pdf("age_uk_bible_benefits.pdf")
kb.ingest_pdf("safeguarding_pathways.pdf")

# During meeting: Query when questions arise
context = kb.query("What are the eligibility criteria for Attendance Allowance?")

# Send context to Foundry Local LLM
manager = FoundryLocalManager("phi-4-mini")
client = OpenAI(base_url=manager.endpoint, api_key=manager.api_key)

response = client.chat.completions.create(
    model=manager.model_info.id,
    messages=[
        {"role": "system", "content": "You are an Age UK knowledge assistant."},
        {"role": "user", "content": f"Context: {context[0]['content']}\n\nQuestion: What are the eligibility criteria?"}
    ]
)
```

### 4. Structured Note Generation

#### Implementation (works with both Spark and Foundry Local)
```typescript
// src/services/meeting-notes-service.ts
export class MeetingNotesService {
  constructor(private aiService: AIService) {}
  
  async generateStructuredNotes(
    transcript: TranscriptItem[],
    insights: InsightItem[],
    knowledgeItems: KnowledgeItem[],
    agenda?: string
  ) {
    const fullTranscript = transcript
      .map(item => `${item.speaker} (${formatTime(item.timestamp)}): ${item.text}`)
      .join('\n')
    
    const prompt = `Create comprehensive meeting notes from this Age UK advice session.

${agenda ? `Agenda: ${agenda}\n` : ''}
Full Transcript:
${fullTranscript}

Key Insights Generated:
${insights.map(i => `- ${i.text}`).join('\n')}

Knowledge Resources Referenced:
${knowledgeItems.map(k => `- ${k.title} (${k.source})`).join('\n')}

Generate structured notes with these sections:
# Meeting Summary
## Attendees
## Agenda Items Covered
## Key Discussion Points
## Decisions Made
## Action Items
   Format: | Task | Owner | Deadline |
## Safeguarding Concerns (if any)
## Next Steps

Use professional, clear language suitable for Age UK records.`

    const response = await this.aiService.client.chat.completions.create({
      model: this.aiService.isLocalAvailable ? 'phi-4-mini' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert Age UK meeting facilitator.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5
    })
    
    return response.choices[0].message.content
  }
  
  exportAsMarkdown(notes: string, sessionMetadata: any) {
    const filename = `age_uk_session_${new Date().toISOString().slice(0,10)}.md`
    const fullDocument = `---
Date: ${sessionMetadata.date}
Duration: ${sessionMetadata.duration}
Advisor: ${sessionMetadata.advisor || 'Unknown'}
Client: ${sessionMetadata.clientType || 'Unknown'}
---

${notes}
`
    
    // Save locally
    const blob = new Blob([fullDocument], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    
    return filename
  }
}
```

### 5. OneDrive for Business Sync

```typescript
// src/services/onedrive-sync-service.ts
import { PublicClientApplication } from '@azure/msal-browser'

export class OneDriveSyncService {
  private msalInstance: PublicClientApplication
  
  constructor() {
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: 'YOUR_AZURE_APP_ID',
        authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
        redirectUri: window.location.origin
      }
    })
  }
  
  async authenticate() {
    try {
      const response = await this.msalInstance.loginPopup({
        scopes: ['Files.ReadWrite', 'User.Read']
      })
      return response.accessToken
    } catch (error) {
      console.error('OneDrive authentication failed:', error)
      throw error
    }
  }
  
  async uploadMeetingNotes(filename: string, content: string) {
    const token = await this.authenticate()
    
    const endpoint = `https://graph.microsoft.com/v1.0/me/drive/root:/AgeUK_MeetingNotes/${filename}:/content`
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/markdown'
      },
      body: content
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
    
    return await response.json()
  }
  
  async syncWhenOnline(localNotes: { filename: string, content: string }[]) {
    // Check connectivity
    if (!navigator.onLine) {
      console.log('Offline - notes saved locally only')
      return
    }
    
    // Batch upload all pending notes
    const results = await Promise.allSettled(
      localNotes.map(note => this.uploadMeetingNotes(note.filename, note.content))
    )
    
    return results
  }
}
```

---

## Installation & Setup Guide

### Prerequisites

#### For Desktop (Windows/macOS/Linux)
1. **Install Foundry Local**:
   ```bash
   # Windows
   winget install Microsoft.FoundryLocal
   
   # macOS
   brew install microsoft/foundrylocal/foundrylocal
   
   # Verify installation
   foundry --version
   ```

2. **Install Python Dependencies** (for Whisper + RAG):
   ```bash
   pip install openai-whisper faster-whisper pyannote.audio
   pip install langchain langchain-community faiss-cpu
   pip install sentence-transformers pypdf2
   pip install foundry-local-sdk
   ```

3. **Download Models**:
   ```bash
   # Download Phi-3.5-Mini for on-device inference
   foundry model pull phi-3.5-mini
   
   # Or Phi-4-Mini for better quality (larger)
   foundry model pull phi-4-mini
   
   # List cached models
   foundry cache list
   ```

4. **Setup Whisper**:
   ```python
   import whisper
   model = whisper.load_model("base")  # Auto-downloads on first run
   ```

5. **Pyannote Authentication** (one-time):
   - Visit https://huggingface.co/settings/tokens
   - Create read token
   - Accept pyannote terms: https://huggingface.co/pyannote/speaker-diarization-3.1
   - Use token in code:
     ```python
     from pyannote.audio import Pipeline
     pipeline = Pipeline.from_pretrained(
         "pyannote/speaker-diarization-3.1",
         use_auth_token="YOUR_HF_TOKEN"
     )
     ```

#### For Android (Future)
1. **Request Private Preview Access**:
   - Visit Azure AI Foundry portal
   - Submit request for Foundry Local Android preview
   - Microsoft will provide SDK and documentation

2. **React Native Setup** (when preview available):
   ```bash
   npm install foundry-local-sdk
   npm install react-native-fs  # For local file access
   ```

---

## Development Roadmap

### ✅ Phase 1: Cloud-Based MVP (CURRENT)
- [x] Web Speech API transcription
- [x] Real-time AI insights via Spark Runtime
- [x] Voice activity detection
- [x] Session persistence with useKV
- [x] Glassmorphic UI with dark theme
- [x] Basic speaker identification (heuristic)

### 🚧 Phase 2: Foundry Local Integration (NEXT)
- [ ] Install Foundry Local on development machine
- [ ] Create AI service abstraction layer
- [ ] Test Phi-3.5-Mini for insight generation
- [ ] Implement fallback logic (Foundry → Spark)
- [ ] Performance benchmarking (latency, accuracy)

### 📋 Phase 3: Offline Speech Recognition
- [ ] Setup Python backend service
- [ ] Integrate Whisper + WhisperX
- [ ] Implement 2-speaker diarization
- [ ] WebSocket connection for real-time streaming
- [ ] Compare accuracy vs Web Speech API

### 📚 Phase 4: RAG Knowledge Base
- [ ] Build PDF ingestion pipeline
- [ ] Setup FAISS vector store
- [ ] Implement semantic search
- [ ] Create knowledge upload UI
- [ ] Test with Age UK resource PDFs

### 📝 Phase 5: Structured Notes & Export
- [ ] Action item extraction with NER
- [ ] Meeting summary generation
- [ ] Markdown/PDF export
- [ ] Local file storage

### ☁️ Phase 6: OneDrive Sync
- [ ] Azure app registration
- [ ] MSAL authentication
- [ ] Graph API integration
- [ ] Offline queue management
- [ ] Auto-sync when online

### 📱 Phase 7: Android Deployment
- [ ] Obtain Foundry Local Android preview
- [ ] React Native bridge implementation
- [ ] Native audio capture optimization
- [ ] APK build pipeline
- [ ] Distribution strategy

---

## Performance Considerations

### Hardware Requirements

#### Minimum (CPU-Only)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free (for models + vector store)
- **CPU**: Intel Core i5 / AMD Ryzen 5 or equivalent
- **Expected Performance**: 
  - Whisper transcription: ~2-3x real-time (base model)
  - LLM inference: 5-10 tokens/second (Phi-3.5-Mini quantized)

#### Recommended (GPU-Accelerated)
- **RAM**: 16GB+
- **Storage**: 20GB free
- **GPU**: 
  - Windows: DirectML-compatible GPU (most modern GPUs)
  - macOS: Apple Silicon M1/M2/M3 (Metal acceleration)
  - Linux: CUDA-compatible NVIDIA GPU
- **Expected Performance**:
  - Whisper transcription: Real-time or faster
  - LLM inference: 20-50 tokens/second

### Model Size Comparison

| Model | Size | Quality | Speed (CPU) | Use Case |
|-------|------|---------|-------------|----------|
| Phi-3.5-Mini | 3.8GB | Good | Fast | Development, testing |
| Phi-4-Mini | 7GB | Better | Medium | Production (recommended) |
| Whisper Base | 290MB | Good | 2x real-time | Standard meetings |
| Whisper Small | 967MB | Better | 1.5x real-time | High accuracy needed |

### Optimization Strategies

1. **Quantization**: Foundry Local automatically uses INT8 quantized models on CPU
2. **Batching**: Process transcript chunks in batches for efficiency
3. **Caching**: Cache frequent knowledge base queries
4. **Lazy Loading**: Load models only when needed
5. **Memory Management**: Clear old transcript items after 1000 entries

---

## Security & Privacy

### Data Flow
1. **Audio**: Captured locally → Processed by local Whisper → Discarded (not stored)
2. **Transcript**: Stored locally in browser/device storage → Optional OneDrive sync (encrypted in transit)
3. **AI Processing**: All inference happens locally via Foundry Local → No data sent to cloud
4. **Knowledge Base**: PDFs stored locally → Embeddings never leave device

### Compliance
- ✅ **GDPR Compliant**: No data processing outside user's device
- ✅ **Data Minimization**: Audio not stored, only transcripts
- ✅ **Right to Deletion**: All data stored locally, user controls deletion
- ✅ **Transparency**: Clear indicators when data would sync to OneDrive

---

## Troubleshooting

### Foundry Local Not Detected
```bash
# Check if service is running
foundry status

# Start service manually
foundry start

# View logs
foundry logs
```

### Whisper Transcription Slow
- Use `faster-whisper` instead of `openai-whisper` (5-10x faster)
- Switch to `int8` compute type
- Use `base` model instead of `small`/`medium`

### Speaker Diarization Inaccurate
- Ensure audio quality is good (minimize background noise)
- Verify `num_speakers=2` parameter is set
- Consider voice enrollment (future feature: pre-record advisor voice)

### FAISS Index Errors
```bash
# Rebuild vector store
rm -rf ./vector_store
python -c "from knowledge_base import OfflineKnowledgeBase; kb = OfflineKnowledgeBase(); kb.ingest_pdf('path/to/pdf.pdf')"
```

---

## References & Resources

### Official Documentation
- [Microsoft Foundry Local](https://learn.microsoft.com/en-us/azure/ai-studio/foundry-local)
- [Foundry Local SDK (Python)](https://pypi.org/project/foundry-local-sdk/)
- [Foundry Local SDK (JavaScript)](https://www.npmjs.com/package/foundry-local-sdk)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [Pyannote Audio](https://github.com/pyannote/pyannote-audio)
- [LangChain RAG Guide](https://python.langchain.com/docs/use_cases/question_answering/)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/api/overview)

### Community Examples
- [Foundry Local Example Apps](https://github.com/microsoft/foundry-local-examples)
- [WhisperX Tutorial](https://github.com/m-bain/whisperX)
- [LangChain + FAISS Integration](https://python.langchain.com/docs/integrations/vectorstores/faiss)

### Model Cards
- [Phi-3.5 Technical Report](https://arxiv.org/abs/2404.14219)
- [Whisper Paper](https://arxiv.org/abs/2212.04356)
- [Sentence Transformers](https://www.sbert.net/)

---

## Contact & Support

**Project Repository**: https://github.com/ITSpecialist111/age-uk-ally-assistant

For questions about:
- **Foundry Local**: Microsoft AI Studio support
- **Age UK Ally Features**: GitHub Issues
- **Android Preview Access**: Azure AI Foundry portal

---

*Last Updated: 2025-01-21*
*Version: 2.0 (Foundry Local Architecture)*
