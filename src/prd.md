# Age UK Ally - AI Meeting Assistant PRD

## Core Purpose & Success

- Relevant AI insights that help advisors

**Experience Qualities**
## Project Classification & Approach
- Relevant AI insights that help advisors
**Primary User Activity**: Interacting - Real-time
## Essential Features

- **Why it matters**: Creates accurate meeting records with pro

## Project Classification & Approach

**Complexity Level**: Complex Application - Advanced functionality with real-time processing, AI integration, voice activity detection, and multi-modal interactions

**Primary User Activity**: Interacting - Real-time collaboration between advisor and AI assistant during client meetings

## Essential Features

### Live Meeting Transcription with Voice Activity Detection
- **What it does**: Real-time speech-to-text conversion with enhanced speaker identification using voice activity patterns, content analysis, and conversation flow detection
- **Why it matters**: Creates accurate meeting records with proper speaker attribution without manual intervention
- **Success criteria**: 90%+ accuracy in quiet environments, 85%+ correct speaker identification through combined voice activity and content analysis

### Enhanced Speaker Identification
- **What it does**: Uses voice activity detection, conversation patterns, and content analysis to automatically identify who is speaking
- **Why it matters**: Eliminates manual speaker tagging and improves transcript accuracy
- **Success criteria**: Accurate speaker identification in 85%+ of conversation segments, visual indicators for voice activity

- **Voice Activity Badge**: Sec
- **What it does**: Analyzes conversation content to provide contextual advice and alerts
- **Why it matters**: Helps advisors identify key issues and next steps they might miss
- **Success criteria**: Relevant suggestions appear within 5 seconds of triggering content

### Knowledge Base Integration
- **What it does**: Surfaces relevant Age UK resources and procedures based on conversation topics
- **Why it matters**: Instant access to correct information improves advice quality
- **Success criteria**: Relevant documents appear for 80%+ of common enquiry types

### Safeguarding Alerts
- **What it does**: Flags potential safeguarding concerns in real-time
- **Why it matters**: Ensures vulnerable clients receive appropriate protection
- **Success criteria**: 100% of clear safeguarding indicators are flagged

## Design Direction

The application employs a sophisticated dark theme with glassmorphic elements to create a professional, modern interface that doesn't distract from the important work being done. The design emphasizes clarity and calm efficiency with enhanced visual feedback for voice activity.

### Visual Identity
- **Emotional Response**: Confidence, professionalism, calm efficiency, technological sophistication
- **Design Personality**: Professional yet approachable, sophisticated but not intimidating
- **Visual Metaphors**: Glass panels suggesting transparency and clarity, subtle glow effects indicating AI activity, pulse animations for voice detection


- **Primary**: Rich indigo (oklch(0.4 0.15 260)) - Professional and trustworthy

- **Secondary**: Muted blue-gray (oklch(0.25 0.02 260)) - Voice activity indicators

- **Surfaces**: Semi-transparent gray-blue panels with blur effects for depth

### Voice Activity Visual Feedback
- **Voice Activity Badge**: Secondary color with pulsing animation when voice is detected
- **Speaker Indicators**: Real-time visual feedback showing who is currently speaking



- **Font**: Inter - Clean, professional, highly legible

- **Layout**: Three-column grid maximizing information density while maintaining readability
- **Voice Indicators**: Microphone emoji and activity badges provide clear voice status

## Implementation Considerations


- React-based SPA with real-time speech recognition

- Enhanced speaker identification using multiple signals

- Persistent storage for session data and insights
- Responsive design for various screen sizes

### Voice Activity Detection
- Real-time audio level monitoring using Web Audio API

- Speaker pattern analysis for improved identification



- High contrast ratios throughout the interface
- Keyboard navigation support
- Screen reader compatibility
- Clear visual indicators for all interactive states
- Audio level visualization for hearing-impaired users

### Performance

- Efficient memory management for long sessions
- Progressive loading of historical data
- Audio processing optimization to minimize CPU usage