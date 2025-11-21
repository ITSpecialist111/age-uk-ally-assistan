# Age UK Ally - AI Meeting Assistant

An offline-first AI meeting facilitator designed for Age UK advisors supporting vulnerable clients. Built with privacy at its core, using local AI inference to ensure sensitive conversations never leave the device.

![Age UK Ally Screenshot](https://via.placeholder.com/800x400?text=Age+UK+Ally+Screenshot)

## ✨ Features

### Current (Phase 1 - Cloud-Based MVP)
- 🎤 **Real-time Speech Transcription**: Web Speech API with automatic speaker identification
- 🧠 **AI Insights & Suggestions**: Contextual advice powered by AI analysis
- 🚨 **Safeguarding Alerts**: Automatic flagging of vulnerability indicators
- 📚 **Knowledge Base**: Dynamic resource suggestions based on conversation topics
- 👁️ **Voice Activity Detection**: Visual feedback showing who is currently speaking
- 💾 **Session Persistence**: Meeting transcripts and insights saved locally
- 🎨 **Professional UI**: Dark glassmorphic design optimized for long sessions

### Future (Phase 2 - Offline Microsoft Foundry Local)
- 🔒 **100% Offline AI**: Microsoft Foundry Local for zero-cloud inference
- 🎯 **Enhanced Speaker ID**: WhisperX multi-speaker diarization (Advisor/Client)
- 📖 **Offline RAG**: FAISS vector database with Age UK PDF knowledge base
- 📝 **Structured Notes**: Automatic meeting summaries with action item extraction
- ☁️ **Optional Cloud Sync**: OneDrive for Business integration when online
- 📱 **Android Support**: React Native APK with Foundry Local mobile runtime

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser with Web Speech API support (Chrome, Edge recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/ITSpecialist111/age-uk-ally-assistant.git
cd age-uk-ally-assistant

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

### First Session

1. Click **"Start Session"** on the welcome screen
2. Grant microphone permissions when prompted
3. Begin speaking naturally - the system will transcribe and identify speakers
4. Watch AI insights appear in real-time based on the conversation
5. Click **"End Session"** when finished

**Note**: If Web Speech API is unavailable, the app demonstrates functionality with a sample conversation.

## 📖 Documentation

- **[PRD.md](./src/prd.md)**: Complete product requirements document with design specifications
- **[FOUNDRY_LOCAL_ARCHITECTURE.md](./FOUNDRY_LOCAL_ARCHITECTURE.md)**: Technical architecture for Microsoft Foundry Local integration
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**: Step-by-step migration guide with code examples

## 🏗️ Architecture

### Current Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 + Shadcn UI v4
- **AI**: Spark Runtime (spark.llm) with GPT-4o-mini
- **Speech**: Web Speech API (browser-native)
- **State**: React hooks + useKV for persistence
- **Animation**: Framer Motion

### Future Tech Stack (Offline)
- **AI Runtime**: Microsoft Foundry Local (Phi-3.5/Phi-4-Mini)
- **Speech**: Whisper + WhisperX + Pyannote Audio
- **RAG**: LangChain + FAISS + sentence-transformers
- **Backend**: FastAPI (Python) + REST/WebSocket
- **Sync**: Microsoft Graph API (OneDrive)
- **Mobile**: React Native + Foundry Local Android

## 🔧 Development

### Project Structure

```
age-uk-ally-assistant/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── components/
│   │   └── ui/                 # Shadcn UI components
│   ├── services/               # Future: AI/Knowledge/Sync services
│   ├── hooks/
│   │   └── use-mobile.ts      # Responsive breakpoint hook
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   ├── index.css              # Theme definitions
│   └── prd.md                 # Product requirements
├── backend/                    # Future: Python backend for offline AI
│   ├── api.py                 # FastAPI server
│   ├── whisper_service.py     # Speech recognition
│   └── knowledge_base.py      # RAG pipeline
├── FOUNDRY_LOCAL_ARCHITECTURE.md
├── IMPLEMENTATION_GUIDE.md
└── README.md
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Key Components

**App.tsx**: Main application with session management, speech recognition, and AI integration

**Voice Activity Detection**: Real-time audio analysis using Web Audio API

**Speaker Identification**: Heuristic-based detection using content analysis and conversation patterns

**AI Insights**: Contextual suggestions categorized as alerts, suggestions, or safeguarding concerns

## 🎨 Design Philosophy

Age UK Ally employs a **calm, professional aesthetic** through:

- **Dark Theme**: Reduces eye strain during long advisory sessions
- **Glassmorphism**: Semi-transparent panels suggest transparency and clarity
- **Progressive Disclosure**: Information appears when relevant, not all at once
- **Purposeful Animation**: Motion serves functional feedback, not decoration
- **High Contrast**: WCAG AA compliant for accessibility

**Color System**:
- **Primary Indigo** (oklch(0.4 0.15 260)): Professional AI intelligence
- **Warm Amber** (oklch(0.75 0.12 80)): Attention-grabbing insights
- **Soft Red** (oklch(0.65 0.2 30)): Safeguarding alerts
- **Muted Grays**: Calm, efficient surfaces

## 🔐 Privacy & Security

### Current Implementation
- ✅ Transcripts stored locally in browser storage (useKV)
- ✅ AI processing via Spark Runtime (cloud-based)
- ✅ No third-party analytics or tracking
- ✅ Microphone access only during active sessions

### Future (Foundry Local)
- 🔒 100% local AI inference - no data sent to cloud
- 🔒 Audio processed locally and discarded (not stored)
- 🔒 Knowledge base embedded locally
- 🔒 Optional OneDrive sync (encrypted in transit, user-controlled)
- 🔒 GDPR compliant - data minimization and user control

## 🛣️ Roadmap

### ✅ Phase 1: Cloud-Based MVP (COMPLETE)
- [x] Real-time transcription with Web Speech API
- [x] AI insights via Spark Runtime
- [x] Voice activity detection
- [x] Glassmorphic UI design
- [x] Session persistence

### 🚧 Phase 2: Foundry Local Integration (IN PROGRESS)
- [ ] AI service abstraction layer
- [ ] Foundry Local installation and testing
- [ ] Performance benchmarking (latency, accuracy)
- [ ] Fallback logic (Foundry → Spark)

### 📋 Phase 3: Offline Speech Recognition
- [ ] Python backend with FastAPI
- [ ] Whisper + WhisperX integration
- [ ] 2-speaker diarization
- [ ] Real-time streaming via WebSocket

### 📚 Phase 4: RAG Knowledge Base
- [ ] FAISS vector store setup
- [ ] PDF ingestion pipeline
- [ ] Semantic search implementation
- [ ] Knowledge upload UI

### 📝 Phase 5: Structured Notes
- [ ] Action item extraction with NER
- [ ] Meeting summary generation
- [ ] Markdown/PDF export
- [ ] Local file storage

### ☁️ Phase 6: OneDrive Sync
- [ ] Azure app registration
- [ ] Microsoft Graph API integration
- [ ] Offline queue management
- [ ] Auto-sync when online

### 📱 Phase 7: Android Deployment
- [ ] Foundry Local Android preview access
- [ ] React Native bridge
- [ ] APK build pipeline
- [ ] Distribution strategy

## 🤝 Contributing

This project is currently in active development. Contributions are welcome!

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Coding Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting (following existing patterns)
- Shadcn UI components preferred
- Tailwind utility classes for styling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Microsoft Foundry Local**: For enabling truly offline AI capabilities
- **OpenAI Whisper**: For state-of-the-art speech recognition
- **Shadcn UI**: For beautiful, accessible React components
- **Age UK**: For inspiring this privacy-first approach to AI assistance

## 📞 Support

- **Documentation**: See `FOUNDRY_LOCAL_ARCHITECTURE.md` and `IMPLEMENTATION_GUIDE.md`
- **Issues**: [GitHub Issues](https://github.com/ITSpecialist111/age-uk-ally-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ITSpecialist111/age-uk-ally-assistant/discussions)

## 🔗 Related Resources

- [Microsoft Foundry Local Documentation](https://learn.microsoft.com/en-us/azure/ai-studio/foundry-local)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [LangChain RAG Guide](https://python.langchain.com/docs/use_cases/question_answering/)
- [Age UK Website](https://www.ageuk.org.uk/)

---

**Built with ❤️ for Age UK advisors and the vulnerable clients they serve.**
