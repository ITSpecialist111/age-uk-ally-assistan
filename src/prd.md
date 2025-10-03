# Age UK Ally - AI Meeting Assistant PRD

## Core Purpose & Success

**Mission Statement**: Provide AI-powered meeting assistance for Age UK advisors to improve client support through real-time transcription, intelligent insights, and knowledge base integration.

**Success Indicators**: 
- Accurate real-time transcript generation with speaker identification
- Relevant AI insights that help advisors
- Quick access to relevant knowledge base articles
- Reduced administrative burden on advisors

**Experience Qualities**: Professional, Supportive, Intelligent

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

### AI Insights & Suggestions  
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

### Color Strategy
- **Primary**: Rich indigo (oklch(0.4 0.15 260)) - Professional and trustworthy
- **Accent**: Warm yellow (oklch(0.75 0.12 80)) - Draws attention to important elements
- **Secondary**: Muted blue-gray (oklch(0.25 0.02 260)) - Voice activity indicators
- **Background**: Deep navy (oklch(0.11 0.02 260)) - Reduces eye strain during long sessions
- **Surfaces**: Semi-transparent gray-blue panels with blur effects for depth

### Voice Activity Visual Feedback
- **Voice Activity Badge**: Secondary color with pulsing animation when voice is detected
- **Speaker Indicators**: Real-time visual feedback showing who is currently speaking
- **Interim Transcript**: Dashed border styling to show live, unconfirmed speech

### Typography & Layout
- **Font**: Inter - Clean, professional, highly legible
- **Hierarchy**: Clear distinction between speakers, timestamps, and content types
- **Layout**: Three-column grid maximizing information density while maintaining readability
- **Voice Indicators**: Microphone emoji and activity badges provide clear voice status

## Implementation Considerations

### Technical Architecture
- React-based SPA with real-time speech recognition
- Web Audio API integration for voice activity detection
- Enhanced speaker identification using multiple signals
- Integration with AI services for content analysis
- Persistent storage for session data and insights
- Responsive design for various screen sizes

### Voice Activity Detection
- Real-time audio level monitoring using Web Audio API
- Adaptive threshold detection for voice activity
- Speaker pattern analysis for improved identification
- Conversation flow tracking for context-aware speaker switching

### Accessibility
- High contrast ratios throughout the interface
- Keyboard navigation support
- Screen reader compatibility
- Clear visual indicators for all interactive states
- Audio level visualization for hearing-impaired users

### Performance
- Optimized for real-time processing
- Efficient memory management for long sessions
- Progressive loading of historical data
- Audio processing optimization to minimize CPU usage