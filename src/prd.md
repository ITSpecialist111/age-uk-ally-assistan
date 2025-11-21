# Age UK Ally - AI Meeting Assistant PRD

An offline-first AI meeting facilitator that addresses real privacy and connectivity challenges advisors face when supporting vulnerable clients. Built to leverage local AI capabilities for sensitive conversations where data privacy is paramount.

## Core Purpose Statement

Empower Age UK advisors with real-time AI assistance during client meetings through local speech recognition, contextual knowledge retrieval, and intelligent safeguarding alerts—all running entirely offline to protect client confidentiality.

**Experience Qualities**

1. **Trustworthy & Secure**: Every interaction reinforces that client data never leaves the device, building confidence in handling sensitive situations
2. **Intelligently Supportive**: The AI feels like a knowledgeable colleague, surfacing relevant information at exactly the right moment without overwhelming
3. **Calmly Efficient**: The interface recedes during conversation, emerging only when needed with clear, actionable insights

## Project Classification & Approach

**Complexity Level**: Complex Application - Advanced functionality with real-time processing, local AI inference, voice activity detection, offline RAG knowledge base, and multi-modal interactions

**Primary User Activity**: Interacting - Real-time collaboration between advisor and AI assistant during sensitive client meetings with zero cloud dependency

## Essential Features

### 1. Live Meeting Transcription with Multi-Speaker Diarization
- **Functionality**: Real-time speech-to-text using local Whisper models with WhisperX for 2-speaker identification (Advisor/Client)
- **Purpose**: Creates accurate meeting records with automatic speaker attribution for sensitive client conversations
- **Trigger**: Session starts → continuous audio capture begins
- **Progression**: Audio stream → Voice Activity Detection → Whisper transcription → Speaker diarization → Content analysis → Real-time display with speaker labels
- **Success criteria**: 90%+ transcription accuracy in quiet environments, 85%+ correct speaker identification, <3s latency from speech to display

### 2. Offline AI Insights & Contextual Suggestions
- **Functionality**: Local language model (Phi-3.5-Mini/Phi-4-Mini via Microsoft Foundry Local) analyzes conversation chunks to generate insights, suggestions, and emotional sentiment indicators
- **Purpose**: Provides advisors with intelligent guidance without sending data to cloud services
- **Trigger**: Every 30 seconds of conversation OR when specific keywords detected (benefits, housing, safeguarding terms)
- **Progression**: Transcript chunk → LLM analysis prompt → Structured insight generation (alert/suggestion/safeguarding) → Display with color-coded priority → Auto-scroll to newest
- **Success criteria**: Insights appear within 5 seconds of triggering content, 80%+ relevance rating from advisors, zero cloud API calls

### 3. Offline RAG Knowledge Base (PDF Integration)
- **Functionality**: Local vector database (FAISS) with embedded Age UK resources ("The Bible" factsheets, learned knowledge) for semantic search during meetings
- **Purpose**: Instant retrieval of relevant guidance without internet connectivity
- **Trigger**: Questions detected in conversation OR advisor explicitly searches
- **Progression**: PDF upload → Document chunking → Local embedding generation (sentence-transformers) → FAISS indexing → Query embedding → Similarity search → Top-K retrieval → Display with source citations and page numbers
- **Success criteria**: <2s retrieval time, relevant documents surface for 80%+ of common enquiry types, citations include source PDF and page number

### 4. Safeguarding Alert System
- **Functionality**: Real-time pattern matching and LLM analysis to identify vulnerability indicators (food insecurity, isolation, financial abuse)
- **Purpose**: Ensures no safeguarding concern is missed during emotionally charged conversations
- **Trigger**: Keywords detected (hunger, afraid, pressure, threatened) OR sentiment analysis shows extreme distress
- **Progression**: Trigger detected → LLM validates concern → Safeguarding alert generated → Visual/audio notification → Advisor acknowledges → Linked to relevant safeguarding pathway document
- **Success criteria**: 100% of clear safeguarding indicators flagged, <1% false positive rate, alert includes specific pathway guidance

### 5. Structured Meeting Notes & Action Item Extraction
- **Functionality**: End-of-session generation of formatted meeting summary with agenda tracking, decisions made, and action items with owners/deadlines
- **Purpose**: Eliminates post-meeting admin burden and ensures follow-through on commitments
- **Trigger**: "End Session" button pressed
- **Progression**: Full transcript compiled → LLM prompt for structured summarization → Extract action items with regex + NLP → Generate Markdown document → Local save → Optional OneDrive sync when online → Persistent storage for future reference
- **Success criteria**: Summary generated in <30 seconds, 90%+ of commitments captured as action items, exportable formats (Markdown, PDF, JSON)

### 6. Voice Activity Detection & Speaker Visualization
- **Functionality**: Web Audio API analyzes real-time audio levels to show visual indicators of who is currently speaking
- **Purpose**: Provides immediate feedback that the system is listening and processing correctly
- **Trigger**: Continuous monitoring during active session
- **Progression**: Audio input → Frequency analysis → Volume threshold detection → Speaker activity badge display → Pause detection → Clear current speaker indicator after 1.5s silence
- **Success criteria**: <100ms latency for visual feedback, clear differentiation between active/inactive states, works in moderate ambient noise

### 7. Agenda Tracking & Time Management
- **Functionality**: Pre-loaded agenda items are tracked against conversation topics with visual progress indicators and time reminders
- **Purpose**: Keeps meetings focused and ensures all topics are covered within time constraints
- **Trigger**: Advisor sets agenda before session starts
- **Progression**: Agenda input → Topic extraction → Real-time topic matching against transcript → Progress visualization → Midpoint reminder at 50% time elapsed → 5-minute warning before scheduled end
- **Success criteria**: 80%+ accuracy in topic matching, timely notifications without interrupting flow

## Edge Case Handling

- **No Speech Recognition Available**: Gracefully falls back to demo mode with sample conversation, displays clear notification explaining browser/OS limitations
- **Extended Silence**: After 5 minutes of no speech, prompts advisor to confirm session is still active to prevent unnecessary battery/CPU usage
- **Safeguarding Alert Overload**: If multiple alerts trigger in quick succession, consolidates into single notification to avoid alarm fatigue
- **Long Meetings (>2 hours)**: Automatically creates session checkpoints every 30 minutes for memory management and crash recovery
- **PDF Upload Failures**: Provides clear error messages, validates file size (<50MB), checks for text-extractable PDFs
- **Microphone Permission Denied**: Shows prominent setup instructions with screenshots, offers manual transcript entry as fallback
- **Ambiguous Speaker Attribution**: When confidence is low, shows both potential speakers and allows advisor to correct with single click

## Design Direction

The interface should feel like a trusted colleague quietly observing the meeting—present when needed but invisible when not. The design evokes **calm professional confidence** through a sophisticated dark theme that reduces eye strain during long sessions while glassmorphic elements suggest transparency and clarity of insight. This is a serious tool for serious work, but approachable enough to not intimidate users new to AI assistance.

**Interface Philosophy**: Minimal vs. rich leans heavily toward minimal—information appears progressively as it becomes relevant rather than overwhelming with all capabilities at once. The glass panels and subtle animations serve functional purposes (showing active states, guiding attention) rather than decorative flourishes.

## Color Selection

**Triadic color scheme** balancing professionalism (blues), warmth (amber accent), and urgency (red for safeguarding). This creates visual hierarchy where normal operations feel calm, important insights draw attention, and critical alerts demand immediate action.

- **Primary Color (Deep Indigo - oklch(0.4 0.15 260))**: Represents AI intelligence and professional authority. Used for branding, primary actions, and advisor-related elements. Communicates trustworthiness and technological sophistication without feeling cold.

- **Secondary Colors**: 
  - Dark Gray-Blue (oklch(0.25 0.02 260)) for secondary surfaces and client-related elements—maintains professionalism while differentiating from advisor UI
  - Muted Slate (oklch(0.2 0.02 260)) for tertiary surfaces and inactive states

- **Accent Color (Warm Amber - oklch(0.75 0.12 80))**: Draws attention to AI-generated insights and suggestions—warm enough to feel helpful but not alarming. Signals "pay attention to this" without urgency.

- **Destructive/Alert Color (Soft Red - oklch(0.65 0.2 30))**: Reserved exclusively for safeguarding alerts and session recording indicators. The softer red prevents alarm while still communicating seriousness.

**Foreground/Background Pairings** (WCAG AA validated):
- **Background (oklch(0.11 0.02 260)) with Foreground (oklch(0.95 0 0))**: 14.8:1 ratio ✓ - Primary text on main background
- **Card (oklch(0.16 0.02 260)) with Foreground (oklch(0.95 0 0))**: 12.3:1 ratio ✓ - Glass panel content
- **Primary (oklch(0.4 0.15 260)) with White (oklch(0.95 0 0))**: 7.2:1 ratio ✓ - Buttons and interactive elements
- **Secondary (oklch(0.25 0.02 260)) with Foreground (oklch(0.95 0 0))**: 9.8:1 ratio ✓ - Secondary surfaces
- **Accent (oklch(0.75 0.12 80)) with Dark Background (oklch(0.2 0 0))**: 8.1:1 ratio ✓ - Insight highlights
- **Muted (oklch(0.2 0.02 260)) with Muted Foreground (oklch(0.7 0.02 260))**: 4.9:1 ratio ✓ - Subdued text

## Font Selection

**Inter** exclusively—a typeface designed specifically for UI legibility at small sizes with excellent character differentiation (critical for reading AI-generated content quickly during live meetings). Inter's versatility across weights (400-700) provides clear hierarchy without introducing visual complexity through multiple font families. The slightly wider characters improve scannability during stressful situations.

**Typographic Hierarchy**:
- **H1 (App Title)**: Inter Bold / 20px / tight tracking (-0.02em) - Compact but authoritative in header
- **H2 (Section Headers)**: Inter Semibold / 18px / normal tracking - Clear section delineation
- **Body (Transcript Text)**: Inter Regular / 14px / 1.5 line-height - Optimized for extended reading
- **Speaker Labels**: Inter Bold / 12px / uppercase / wide tracking (0.05em) - Quick visual scanning
- **Insights**: Inter Medium / 13px / 1.6 line-height - Slightly larger leading for comprehension
- **Timestamps/Metadata**: Inter Regular / 11px / monospace numerals - Technical precision
- **Button Labels**: Inter Semibold / 14px - Clear call-to-action hierarchy

## Animations

**Purposeful restraint**—animations serve functional feedback rather than decoration. Every motion reinforces the mental model of "AI processing in the background" without calling attention to itself. Smooth, natural physics (ease-in-out curves) suggest competence and reliability.

- **Purposeful Meaning**: Pulse animations on recording indicator and voice activity badge communicate "the system is actively listening." Fade-in for new insights suggests AI generating content in real-time. Smooth scrolling keeps user oriented as content accumulates.

- **Hierarchy of Movement**: 
  1. Safeguarding alerts get immediate attention (slide-in from right with subtle bounce)
  2. New transcript items animate on appearance (fade + slide up) to show live processing
  3. Insights appear with staggered delays when multiple generate simultaneously
  4. Background elements (session timer, status badges) use minimal motion

**Timing**:
- Recording pulse: 2s infinite alternate (breathing rhythm)
- Transcript item appearance: 400ms ease-out
- Insight cards: 500ms with 100ms stagger for multiple
- Voice activity badge: 150ms instant feedback on state change
- Panel transitions: 300ms for smooth but responsive feel

## Component Selection

**Components** (Shadcn UI v4):
- **Card**: Glass panels for transcript, insights, knowledge sections—modified with `glass-panel` class for frosted effect
- **Badge**: Recording indicator, voice activity status, processing states—animated variants for pulsing effects
- **Button**: Primary actions (Start Session, End Session), secondary (Mark Key Moment, Pause Recording)—size variants for hierarchy
- **ScrollArea**: All content panels to handle long sessions gracefully with custom styled scrollbars
- **Dialog**: End session confirmation, safeguarding alert details, settings modal (future)
- **Separator**: Subtle dividers between insight types and knowledge sources
- **Avatar**: Future feature for user profiles and multi-advisor sessions

**Customizations**:
- Custom `.glass-panel` class combining backdrop-filter, semi-transparent backgrounds, and subtle borders
- `.glowing-dot` class for animated recording indicator using box-shadow keyframes
- `.ai-insight::before` pseudo-element adds sparkle emoji consistently across insight types
- Custom scrollbar styling (8px width, rounded thumbs matching theme colors)

**States**:
- **Buttons**: Distinct hover (opacity 90%), active (scale 95%), disabled (opacity 50%, cursor not-allowed), focus (ring outline)
- **Transcript bubbles**: Advisor (indigo gradient background, right-aligned) vs Client (neutral gray, left-aligned)
- **Insight cards**: Color-coded left borders (blue=suggestion, amber=alert, red=safeguarding) with matching background tints
- **Voice badge**: Idle (muted colors) vs Active (full saturation + pulse animation)

**Icon Selection** (Phosphor Icons):
- **Microphone**: Primary app identity, recording controls—weight=regular, size=20-24px
- **Scroll**: Transcript section—suggests written record
- **Sparkle**: AI insights—universal symbol for AI/magic
- **Books/Library**: Knowledge base—clearly represents documentation
- **Flag**: Key moments and safeguarding alerts—attention-grabbing
- **Square**: Stop/end session—standard media control metaphor
- **Clock**: Time tracking and agenda progress
- **MicrophoneSlash**: Pause recording state

**Spacing**: Consistent 4px base unit via Tailwind scale
- Card padding: p-6 (24px) for comfortable breathing room
- Gap between sections: gap-6 (24px) vertical rhythm
- Transcript bubbles: space-y-4 (16px) for scannable conversation flow
- Insight items: space-y-3 (12px) for denser information packing
- Header/footer: p-4 (16px) to feel lighter than content areas

**Mobile Considerations**:
- Above 1024px: Side-by-side layout (transcript left, insights/knowledge right)
- 768-1023px: Stacked layout with collapsible sections using Accordion
- Below 768px: Single column priority view (transcript first, insights accessible via bottom sheet)
- Touch targets: Minimum 44x44px for all interactive elements
- Reduced glass blur on mobile for performance (backdrop-filter: blur(8px) instead of 12px)

## Technology Architecture (Current & Future)

### Current Implementation (Phase 1 - Cloud-Based MVP)
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Shadcn v4
- **Speech Recognition**: Web Speech API (browser-native, limited speaker detection)
- **AI Processing**: Spark Runtime (spark.llm with gpt-4o-mini) for insights and knowledge generation
- **Persistence**: useKV hook for session data, transcript history, insights
- **Animations**: Framer Motion for purposeful UI feedback

### Future Implementation (Phase 2 - Offline Microsoft Foundry Local)
- **AI Runtime**: Microsoft Foundry Local (http://localhost:5273/v1) - zero-dependency local inference
- **Models**: Phi-3.5-Mini or Phi-4-Mini quantized for consumer hardware
- **Speech**: Whisper (base/small model) + WhisperX for multi-speaker diarization
- **Diarization**: Pyannote Audio 3.1 for 2-speaker identification (Advisor/Client)
- **RAG Pipeline**: LangChain + FAISS vector store + sentence-transformers/all-MiniLM-L6-v2 embeddings
- **PDF Processing**: PyPDF2 for document ingestion, RecursiveCharacterTextSplitter for chunking
- **Sync**: Microsoft Graph API for OneDrive for Business integration (when online)
- **Mobile**: React Native bridge to Foundry Local Android (private preview access required)

**Migration Strategy**:
1. Current Spark LLM calls abstracted into service layer
2. OpenAI-compatible API interface for Foundry Local drop-in replacement
3. Gradual feature parity (speech → insights → RAG → structured notes)
4. Hybrid mode allowing cloud fallback when offline models unavailable

### Accessibility
- WCAG AA contrast compliance across all color pairings (validated above)
- Keyboard navigation: Tab order follows visual hierarchy, Enter/Space activate all interactive elements
- Screen reader: ARIA labels on all icons, live regions for dynamic transcript/insights, role="log" for conversation feed
- Visual indicators: Never rely on color alone (icons + text labels for all states)
- Audio visualization: Optional waveform display for hearing-impaired users to confirm speech capture
- Focus management: Trapped in modals, returns to trigger element on close

### Performance Considerations
- Efficient memory: useKV with functional updates to avoid stale closures, transcript chunking after 100 items
- Lazy loading: Insights/knowledge components render virtualized for long sessions (react-window future enhancement)
- Audio processing: Web Audio API runs in separate context, throttled analysis at 100ms intervals
- Local inference (future): Foundry Local automatically selects quantized model variants based on available hardware
- Battery optimization: Reduces speech recognition sensitivity after 5min silence, pauses VAD monitoring when recording paused