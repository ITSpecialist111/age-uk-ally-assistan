# Age UK Ally - Real-Time Meeting Assistant

A sophisticated real-time meeting assistant designed to support Age UK advisors during client consultations by providing live transcription, AI-powered insights, and contextual knowledge recommendations.

**Experience Qualities**:
1. **Supportive** - Creates a safety net for advisors with intelligent suggestions and safeguarding alerts
2. **Unobtrusive** - Operates seamlessly in the background without disrupting natural conversation flow
3. **Empowering** - Enhances advisor capability with instant access to relevant knowledge and procedures

**Complexity Level**: Light Application (multiple features with basic state)
- Real-time transcription simulation with speaker identification
- Dynamic AI insights triggered by conversation context
- Knowledge base integration with contextual recommendations
- Session management with timing and recording indicators

## Essential Features

**Live Transcription Display**
- Functionality: Real-time speech-to-text conversion with speaker identification
- Purpose: Provides accurate meeting records and enables AI analysis
- Trigger: Automatic when session starts
- Progression: Audio input → Speech recognition → Speaker identification → Display with visual distinction
- Success criteria: Clear, readable transcript with proper speaker attribution and timestamps

**AI-Powered Insights & Alerts**
- Functionality: Contextual suggestions, emotional sentiment analysis, and safeguarding alerts
- Purpose: Assists advisors in providing comprehensive support and identifying critical issues
- Trigger: Keyword detection in conversation or emotional indicators
- Progression: Conversation analysis → Pattern recognition → Insight generation → Visual notification
- Success criteria: Relevant, timely suggestions that enhance advisor decision-making

**Contextual Knowledge Retrieval**
- Functionality: Automatically surfaces relevant policies, procedures, and factsheets
- Purpose: Provides instant access to "The Bible" (Age UK knowledge base) during conversations
- Trigger: Topic detection in conversation or manual search
- Progression: Topic identification → Knowledge matching → Resource presentation → Quick access
- Success criteria: Accurate, helpful knowledge suggestions that save time and improve service

**Session Management**
- Functionality: Meeting timer, recording indicator, session metadata tracking
- Purpose: Maintains professional session structure and compliance
- Trigger: Manual session start/stop controls
- Progression: Session initiation → Active monitoring → Status display → Session closure
- Success criteria: Clear session status, accurate timing, proper session documentation

## Edge Case Handling

- **No Audio Input**: Display clear "waiting for audio" state with troubleshooting guidance
- **AI Service Unavailable**: Graceful fallback to manual note-taking mode with offline knowledge access
- **Sensitive Information**: Automatic redaction of personal data in transcripts with privacy indicators
- **Long Sessions**: Transcript pagination and performance optimization for extended meetings
- **Network Issues**: Local caching of critical knowledge base items for offline access

## Design Direction

The interface should feel professional yet warm, like a trusted digital assistant that enhances rather than replaces human judgment - sophisticated technology presented with accessible simplicity that builds confidence in both advisors and clients.

## Color Selection

Triadic color scheme creating professional depth while maintaining warmth and accessibility.

- **Primary Color**: Deep Indigo (oklch(0.4 0.15 260)) - Communicates trust, professionalism, and reliability
- **Secondary Colors**: 
  - Warm Gray (oklch(0.25 0.02 260)) - Supporting neutral for content backgrounds
  - Soft Blue (oklch(0.7 0.08 240)) - Accent for informational elements
- **Accent Color**: Golden Yellow (oklch(0.75 0.12 80)) - Attention-grabbing highlight for important alerts and CTAs
- **Foreground/Background Pairings**:
  - Background (Deep Gray #1f2937): White text (oklch(0.95 0 0)) - Ratio 15.8:1 ✓
  - Card (Medium Gray #374151): White text (oklch(0.95 0 0)) - Ratio 11.2:1 ✓
  - Primary (Deep Indigo #4338ca): White text (oklch(0.95 0 0)) - Ratio 8.9:1 ✓
  - Accent (Golden Yellow #f59e0b): Dark text (oklch(0.2 0 0)) - Ratio 8.1:1 ✓

## Font Selection

Clean, highly legible typography that conveys professionalism while remaining approachable for users of all technical backgrounds, using Inter for its excellent readability and modern feel.

- **Typographic Hierarchy**:
  - H1 (Application Title): Inter Bold/24px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/18px/normal spacing
  - Body Text (Transcript): Inter Regular/16px/relaxed line height
  - Interface Labels: Inter Medium/14px/normal spacing
  - Time/Status: Inter Medium/14px/monospace numerals

## Animations

Subtle, purposeful motion that guides attention to important updates without being distracting during sensitive conversations - smooth transitions that feel natural and professional.

- **Purposeful Meaning**: Gentle fade-ins for new insights communicate real-time intelligence, while slide transitions for knowledge articles suggest helpful discovery
- **Hierarchy of Movement**: Critical safeguarding alerts use attention-grabbing but respectful motion, while routine updates use minimal, ambient animation

## Component Selection

- **Components**: 
  - Cards for transcript bubbles and insight panels with subtle shadows
  - Badges for speaker identification and alert types with appropriate color coding
  - Progress indicators for session timing with smooth updates
  - Buttons with clear hover states for session controls
  - Scroll areas with custom styling for transcript and knowledge feeds
- **Customizations**: 
  - Glass-morphism effect for main panels using backdrop blur
  - Custom recording indicator with pulsing animation
  - Transcript bubbles with speaker-specific styling and positioning
- **States**: 
  - Recording indicator: active (pulsing red), paused (amber), stopped (gray)
  - Insights: normal (blue border), important (yellow border), critical (red border)
  - Knowledge items: default, hover (subtle highlight), selected (accent border)
- **Icon Selection**: 
  - Microphone for recording status, Sparkles for AI insights, Library for knowledge base
  - Flag for marking key moments, Square for session end, Clock for timing
- **Spacing**: 
  - Consistent 6-unit (24px) gaps between major sections
  - 4-unit (16px) padding within cards and panels
  - 2-unit (8px) spacing for related elements
- **Mobile**: 
  - Single-column layout on small screens with collapsible sidebar
  - Touch-friendly button sizes (minimum 44px)
  - Optimized transcript display with improved readability
  - Swipe gestures for navigating between transcript and insights