import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Microphone, Scroll, Sparkle, Books, Flag, Square, Clock, MicrophoneSlash } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'

interface TranscriptItem {
  id: string
  speaker: 'Advisor' | 'Client'
  text: string
  timestamp: Date
}

interface InsightItem {
  id: string
  type: 'suggestion' | 'alert' | 'safeguarding'
  text: string
  timestamp: Date
}

interface KnowledgeItem {
  id: string
  title: string
  source: string
  snippet: string
  timestamp: Date
}

// Extend the global Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new(): SpeechRecognition
}

function App() {
  const [sessionStarted, setSessionStarted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [transcriptItems, setTranscriptItems] = useKV<TranscriptItem[]>('transcript-items', [])
  const [insights, setInsights] = useKV<InsightItem[]>('insights', [])
  const [knowledgeItems, setKnowledgeItems] = useKV<KnowledgeItem[]>('knowledge-items', [])
  const [currentSpeaker, setCurrentSpeaker] = useState<'Advisor' | 'Client' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  
  const transcriptRef = useRef<HTMLDivElement>(null)
  const insightsRef = useRef<HTMLDivElement>(null)
  const knowledgeRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const mockTranscriptData = [
    { speaker: 'Advisor' as const, text: "Thank you for coming in. Please, take a seat. How can I help you today?" },
    { speaker: 'Client' as const, text: "I'm just so worried about my mum. She received an eviction notice and I'm so frustrated with all the paperwork, I don't know where to start." },
    { speaker: 'Advisor' as const, text: "I understand this must be very distressing. We can go through it step-by-step. Can you tell me a bit more about the housing situation?" },
    { speaker: 'Client' as const, text: "She's been in her flat for 20 years. The landlord is selling up. She has very little savings and her benefits barely cover the rent as it is." },
    { speaker: 'Advisor' as const, text: "Okay. Let's look at the benefits first. Is she receiving Attendance Allowance?" },
    { speaker: 'Client' as const, text: "I don't think so. What's that? Honestly, I'm worried she doesn't have much to eat by the end of the week." },
    { speaker: 'Advisor' as const, text: "Right, we absolutely need to address that immediately. Let's check her eligibility for a few things." },
  ]

  const mockInsights = [
    { type: 'alert' as const, text: "Sentiment: Distressed, Frustrated. Client is at high risk of being overwhelmed. Prioritise building trust and reassurance." },
    { type: 'suggestion' as const, text: "Prompt: Ask if the parent has had a recent needs assessment from social services. This can unlock further support." },
    { type: 'safeguarding' as const, text: "Safeguarding Alert: Mention of 'doesn't have much to eat' requires immediate action. Refer to Food Poverty Pathway in 'the Bible'." },
    { type: 'suggestion' as const, text: "Suggest a follow-up appointment for a full benefits check to maximise income." }
  ]

  const mockKnowledge = [
    { title: "Factsheet: Responding to a Section 21 Eviction Notice", source: "The Bible", snippet: "Check for validity of the notice: correct dates, prescribed information provided, and deposit protection scheme details..." },
    { title: "Guide: Attendance Allowance Eligibility", source: "The Bible", snippet: "Eligibility is not means-tested and depends on the level of care needed due to illness or disability..." },
    { title: "Learned Knowledge: Gloucester Council Housing Support", source: "Learned Knowledge", snippet: "Recent cases show that the council's discretionary housing payment has been successful for short-term rent shortfalls for clients in similar situations." }
  ]

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-GB'
      
      recognition.onstart = () => {
        setIsListening(true)
      }
      
      recognition.onend = () => {
        setIsListening(false)
        if (isRecording) {
          // Restart recognition if session is still active
          setTimeout(() => {
            recognition.start()
          }, 100)
        }
      }
      
      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setInterimTranscript(interimTranscript)
        
        if (finalTranscript.trim()) {
          processTranscript(finalTranscript.trim())
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      recognitionRef.current = recognition
    }
  }, [])

  const processTranscript = async (transcript: string) => {
    if (!transcript.trim()) return
    
    setIsProcessing(true)
    setInterimTranscript('')
    
    try {
      // Determine speaker using simple heuristics (in real app, this would be more sophisticated)
      const speaker = determineSpeaker(transcript)
      
      const newItem: TranscriptItem = {
        id: `transcript-${Date.now()}`,
        speaker,
        text: transcript,
        timestamp: new Date()
      }
      
      setTranscriptItems(prev => [...(prev || []), newItem])
      
      // Generate AI insights based on the transcript
      await generateInsights(transcript, speaker)
      
      // Generate knowledge suggestions
      await generateKnowledge(transcript)
      
    } catch (error) {
      console.error('Error processing transcript:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const determineSpeaker = (transcript: string): 'Advisor' | 'Client' => {
    // Simple heuristics - in real app this would use speaker identification
    const advisorKeywords = ['help', 'support', 'check', 'eligibility', 'benefits', 'allowance', 'services']
    const clientKeywords = ['worried', 'mum', 'mother', 'frustrated', 'don\'t know', 'scared']
    
    const lowerTranscript = transcript.toLowerCase()
    const advisorScore = advisorKeywords.filter(word => lowerTranscript.includes(word)).length
    const clientScore = clientKeywords.filter(word => lowerTranscript.includes(word)).length
    
    return clientScore > advisorScore ? 'Client' : 'Advisor'
  }

  const generateInsights = async (transcript: string, speaker: 'Advisor' | 'Client') => {
    try {
      const prompt = (window as any).spark.llmPrompt`
        Analyze this transcript from an Age UK advice session and provide insights.
        
        Speaker: ${speaker}
        Text: "${transcript}"
        
        Provide insights in one of these categories:
        - "alert": Emotional state or risk indicators
        - "suggestion": Advice for the advisor
        - "safeguarding": Immediate concerns requiring action
        
        Respond with a single insight as JSON: {"type": "alert|suggestion|safeguarding", "text": "your insight"}
      `
      
      const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
      const insight = JSON.parse(response)
      
      if (insight.type && insight.text) {
        addInsight(insight)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    }
  }

  const generateKnowledge = async (transcript: string) => {
    try {
      const prompt = (window as any).spark.llmPrompt`
        Based on this transcript from an Age UK advice session, suggest relevant knowledge resources.
        
        Text: "${transcript}"
        
        If relevant, provide a knowledge item as JSON:
        {"title": "Resource Title", "source": "The Bible|Learned Knowledge", "snippet": "Brief helpful excerpt"}
        
        Only respond if there's a clear match to housing, benefits, care, or Age UK services. Otherwise respond with null.
      `
      
      const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
      const knowledge = JSON.parse(response)
      
      if (knowledge && knowledge.title) {
        addKnowledgeItem(knowledge)
      }
    } catch (error) {
      console.error('Error generating knowledge:', error)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (isRecording) {
        setSessionTime(prev => prev + 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isRecording])

  useEffect(() => {
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000)

    return () => clearInterval(timeTimer)
  }, [])

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcriptItems, interimTranscript])

  // Auto-scroll insights to bottom
  useEffect(() => {
    if (insightsRef.current) {
      insightsRef.current.scrollTop = insightsRef.current.scrollHeight
    }
  }, [insights])

  // Auto-scroll knowledge to bottom
  useEffect(() => {
    if (knowledgeRef.current) {
      knowledgeRef.current.scrollTop = knowledgeRef.current.scrollHeight
    }
  }, [knowledgeItems])

  const addInsight = (insightData: { type: 'suggestion' | 'alert' | 'safeguarding', text: string }) => {
    const newInsight: InsightItem = {
      id: `insight-${Date.now()}`,
      type: insightData.type,
      text: insightData.text,
      timestamp: new Date()
    }
    setInsights(prev => [...(prev || []), newInsight])
  }

  const addKnowledgeItem = (knowledgeData: { title: string, source: string, snippet: string }) => {
    const newKnowledge: KnowledgeItem = {
      id: `knowledge-${Date.now()}`,
      title: knowledgeData.title,
      source: knowledgeData.source,
      snippet: knowledgeData.snippet,
      timestamp: new Date()
    }
    setKnowledgeItems(prev => [...(prev || []), newKnowledge])
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'alert': return 'border-l-accent'
      case 'safeguarding': return 'border-l-destructive'
      default: return 'border-l-primary'
    }
  }

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-accent/20'
      case 'safeguarding': return 'bg-destructive/20'
      default: return 'bg-primary/20'
    }
  }

  const startSession = () => {
    setSessionStarted(true)
    setIsRecording(true)
    
    // Start speech recognition if available
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        // Fallback to demo mode
        startDemoMode()
      }
    } else {
      // Fallback to demo mode if speech recognition not available
      startDemoMode()
    }
  }

  const startDemoMode = () => {
    // Start the mockup conversation as fallback
    let transcriptIndex = 0
    
    const addMockTranscript = () => {
      if (transcriptIndex < mockTranscriptData.length && isRecording) {
        const item = mockTranscriptData[transcriptIndex]
        const newItem: TranscriptItem = {
          id: `transcript-${Date.now()}`,
          speaker: item.speaker,
          text: item.text,
          timestamp: new Date()
        }
        
        setTranscriptItems(prev => [...(prev || []), newItem])

        // Trigger insights based on content
        if (item.text.includes("frustrated")) {
          addInsight(mockInsights[0])
        }
        if (item.text.includes("eviction notice")) {
          addKnowledgeItem(mockKnowledge[0])
          addInsight(mockInsights[1])
        }
        if (item.text.includes("Attendance Allowance")) {
          addKnowledgeItem(mockKnowledge[1])
          addKnowledgeItem(mockKnowledge[2])
        }
        if (item.text.includes("much to eat")) {
          addInsight(mockInsights[2])
          setTimeout(() => addInsight(mockInsights[3]), 2000)
        }

        transcriptIndex++
      }
    }

    // Start demo conversation
    setTimeout(addMockTranscript, 1000)
    const interval = setInterval(addMockTranscript, 6000)
    
    // Clean up interval when session ends
    const cleanup = () => {
      clearInterval(interval)
    }
    
    return cleanup
  }

  const endSession = () => {
    setIsRecording(false)
    setSessionStarted(false)
    setIsListening(false)
    setInterimTranscript('')
    setCurrentSpeaker(null)
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    setTranscriptItems([])
    setInsights([])
    setKnowledgeItems([])
    setSessionTime(0)
  }

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    } else {
      setIsRecording(true)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (error) {
          console.error('Error starting speech recognition:', error)
        }
      }
    }
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      {!sessionStarted ? (
        // Start Screen
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-lg text-center"
          >
            <div className="p-4 bg-primary rounded-full w-fit mx-auto mb-6">
              <Microphone size={32} className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Age UK <span className="text-primary font-medium">| Ally</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-2">AI Meeting Assistant</p>
            <p className="text-sm text-muted-foreground mb-8">Age UK Advice Centre, Lydney</p>
            
            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-center gap-3">
                <Scroll size={20} className="text-primary" />
                <span className="text-foreground">Live transcript generation</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkle size={20} className="text-accent" />
                <span className="text-foreground">AI insights & suggestions</span>
              </div>
              <div className="flex items-center gap-3">
                <Books size={20} className="text-secondary-foreground" />
                <span className="text-foreground">Knowledge base integration</span>
              </div>
              <div className="flex items-center gap-3">
                <Flag size={20} className="text-accent" />
                <span className="text-foreground">Safeguarding alerts</span>
              </div>
            </div>

            <Button 
              onClick={startSession}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
            >
              <Microphone size={20} className="mr-2" />
              Start Session
            </Button>
            
            <p className="text-xs text-muted-foreground mt-4">
              This will begin recording and AI analysis of the meeting.<br/>
              <span className="text-accent">
                {recognitionRef.current ? 
                  "✓ Speech recognition is available - speak naturally during the session" : 
                  "⚠️ Speech recognition not available - demo mode will show sample conversation"
                }
              </span>
            </p>
          </motion.div>
        </div>
      ) : (
        // Main Application
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-2rem)]">
        
        {/* Header */}
        <header className="lg:col-span-12 glass-panel p-4 flex justify-between items-center rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Microphone size={24} className="text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Age UK <span className="text-primary font-medium">| Ally</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Age UK Advice Centre, Lydney</p>
              <p className="text-foreground font-medium">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isListening && (
                <Badge variant="outline" className="bg-accent/20 border-accent text-accent px-3 py-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse mr-2" />
                  Listening
                </Badge>
              )}
              {isProcessing && (
                <Badge variant="outline" className="bg-primary/20 border-primary text-primary px-3 py-1">
                  <Sparkle size={14} className="mr-1 animate-spin" />
                  Processing
                </Badge>
              )}
              {isRecording && (
                <Badge variant="outline" className="bg-destructive/20 border-destructive text-destructive px-3 py-1.5">
                  <div className="w-3 h-3 bg-destructive rounded-full glowing-dot mr-2" />
                  <span className="font-semibold mr-2">REC</span>
                  <span className="font-mono">{formatTime(sessionTime)}</span>
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Main Content - Transcript */}
        <main className="lg:col-span-6 flex flex-col h-full">
          <Card className="glass-panel border-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Scroll size={20} />
                Live Meeting Transcript
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-[calc(100vh-16rem)] pr-2" ref={transcriptRef}>
                <div className="space-y-4">
                  <AnimatePresence>
                    {(transcriptItems || []).map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-3 rounded-lg max-w-[85%] ${
                          item.speaker === 'Advisor' 
                            ? 'bg-primary/30 ml-auto text-right' 
                            : 'bg-secondary/50'
                        }`}
                      >
                        <p className={`font-bold text-sm ${
                          item.speaker === 'Advisor' ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`}>
                          {item.speaker}
                        </p>
                        <p className="text-foreground">{item.text}</p>
                      </motion.div>
                    ))}
                    {/* Show interim transcript */}
                    {interimTranscript && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg max-w-[85%] bg-muted/30 border-2 border-dashed border-muted-foreground/30"
                      >
                        <p className="font-bold text-sm text-muted-foreground">
                          {currentSpeaker || 'Speaking...'}
                        </p>
                        <p className="text-muted-foreground italic">{interimTranscript}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </main>

        {/* Right Sidebar */}
        <aside className="lg:col-span-6 flex flex-col gap-6 h-full">
          
          {/* AI Insights */}
          <Card className="glass-panel border-border flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkle size={20} />
                AI Insights & Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(50vh-8rem)] pr-2" ref={insightsRef}>
                <div className="space-y-3">
                  <AnimatePresence>
                    {(insights || []).map((insight) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`border-l-4 ${getInsightBorderColor(insight.type)} ${getInsightBgColor(insight.type)} p-3 rounded-r-lg ai-insight`}
                      >
                        <p className="text-sm text-foreground">{insight.text}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Knowledge & Actions */}
          <Card className="glass-panel border-border flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Books size={20} />
                Knowledge & Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(50vh-8rem)] pr-2" ref={knowledgeRef}>
                <div className="space-y-3">
                  <AnimatePresence>
                    {(knowledgeItems || []).map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-secondary/60 p-3 rounded-lg hover:bg-secondary/80 cursor-pointer transition-colors"
                      >
                        <p className="font-semibold text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 italic">Source: {item.source}</p>
                        <p className="text-sm text-muted-foreground mt-2">{item.snippet}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        {/* Footer */}
        <footer className="lg:col-span-12 glass-panel p-4 flex justify-between items-center rounded-lg">
          <div>
            <p className="text-sm font-medium">
              <span className="text-muted-foreground">Session with:</span>{' '}
              <span className="text-foreground">Daughter (re: Elderly Parent)</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Topic:</span>{' '}
              <span className="text-foreground">Housing & Benefits Enquiry</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "default"}
              className="bg-accent/20 text-accent hover:bg-accent/30 border-accent"
            >
              {isRecording ? (
                <>
                  <MicrophoneSlash size={16} className="mr-2" />
                  Pause Recording
                </>
              ) : (
                <>
                  <Microphone size={16} className="mr-2" />
                  Resume Recording
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="bg-accent/20 text-accent hover:bg-accent/30 border-accent"
            >
              <Flag size={16} className="mr-2" />
              Mark Key Moment
            </Button>
            <Button 
              onClick={endSession}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Square size={16} className="mr-2" />
              End Session
            </Button>
          </div>
        </footer>

        </div>
      )}
    </div>
  )
}

export default App