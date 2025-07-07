
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Calendar, AlertTriangle, Users, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface Alert {
  id: string;
  type: 'email' | 'servicenow' | 'incident' | 'meeting';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  time?: string;
}

interface DisplayAlert extends Alert {
  displayedTitle: string;
  displayedMessage: string;
  isTyping: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'email',
    title: 'Urgent Email',
    message: '3 high priority emails need reply from Sarah, John, and Management team',
    priority: 'high'
  },
  {
    id: '2',
    type: 'servicenow',
    title: 'ServiceNow Priority Tasks',
    message: '2 high priority tickets: Database performance issue and API integration bug',
    priority: 'high'
  },
  {
    id: '3',
    type: 'incident',
    title: 'Severity 4 Incident',
    message: 'Website slow loading reported by 5 users, needs investigation',
    priority: 'medium'
  },
  {
    id: '4',
    type: 'incident',
    title: 'Incident Channel',
    message: 'Active incident: Payment gateway timeout affecting checkout process',
    priority: 'high'
  },
  {
    id: '5',
    type: 'meeting',
    title: 'Next Meeting',
    message: 'Daily standup in 30 minutes with Development team at 10:00 AM',
    priority: 'medium',
    time: '10:00 AM'
  }
];

const AlertBot: React.FC = () => {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [displayedAlerts, setDisplayedAlerts] = useState<DisplayAlert[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Play tick sound function
  const playTickSound = () => {
    if (!isVoiceEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  // Text-to-speech function
  const speakText = (text: string) => {
    if (isVoiceEnabled && speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'servicenow':
        return <AlertTriangle className="w-5 h-5" />;
      case 'incident':
        return <Bell className="w-5 h-5" />;
      case 'meeting':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-alert-email text-white shadow-lg shadow-alert-email/30';
      case 'servicenow':
        return 'bg-alert-servicenow text-white shadow-lg shadow-alert-servicenow/30';
      case 'incident':
        return 'bg-alert-incident text-white shadow-lg shadow-alert-incident/30';
      case 'meeting':
        return 'bg-alert-meeting text-white shadow-lg shadow-alert-meeting/30';
      default:
        return 'bg-gray-500 text-white shadow-lg';
    }
  };

  const getAlertBubbleColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-500';
      case 'servicenow':
        return 'bg-orange-500';
      case 'incident':
        return 'bg-red-500';
      case 'meeting':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const typewriterEffect = (alert: Alert, onComplete: () => void) => {
    const titleWords = alert.title.split(' ');
    const messageWords = alert.message.split(' ');
    const allWords = [...titleWords, ...messageWords];

    let wordIndex = 0;
    let currentTitle = '';
    let currentMessage = '';

    const displayAlert: DisplayAlert = {
      ...alert,
      displayedTitle: '',
      displayedMessage: '',
      isTyping: true
    };

    // Add alert to top of list immediately
    setDisplayedAlerts(prev => [displayAlert, ...prev]);

    const typeNextWord = () => {
      if (wordIndex < allWords.length) {
        const word = allWords[wordIndex];
        
        // Play tick sound when voice is muted
        playTickSound();
        
        if (wordIndex < titleWords.length) {
          currentTitle += (currentTitle ? ' ' : '') + word;
        } else {
          currentMessage += (currentMessage ? ' ' : '') + word;
        }

        // Update the alert in the list
        setDisplayedAlerts(prev => 
          prev.map((item, index) => 
            index === 0 
              ? {
                  ...item,
                  displayedTitle: currentTitle,
                  displayedMessage: currentMessage
                }
              : item
          )
        );

        wordIndex++;
        setTimeout(typeNextWord, 150); // Adjust speed here
      } else {
        // Mark typing as complete and speak the full text
        setDisplayedAlerts(prev => 
          prev.map((item, index) => 
            index === 0 
              ? { ...item, isTyping: false }
              : item
          )
        );
        
        // Speak the complete alert text
        speakText(`${alert.title}. ${alert.message}`);
        
        setTimeout(onComplete, 800); // Pause before next alert
      }
    };

    setTimeout(typeNextWord, 300); // Initial delay
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  useEffect(() => {
    if (isPlaying && currentAlertIndex < mockAlerts.length) {
      const alert = mockAlerts[currentAlertIndex];
      
      typewriterEffect(alert, () => {
        if (currentAlertIndex < mockAlerts.length - 1) {
          setCurrentAlertIndex(currentAlertIndex + 1);
        } else {
          setIsPlaying(false);
        }
      });
    }
  }, [currentAlertIndex, isPlaying]);

  // Auto-scroll to top when new alert is added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, [displayedAlerts.length]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg animate-pulse-glow">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cinematic Alert Bot
          </h1>
        </div>
        <p className="text-gray-600">Your live task monitoring system</p>
        
        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button 
            variant="outline" 
            onClick={togglePlayPause}
            className="flex items-center space-x-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={toggleVoice}
            className={`flex items-center space-x-2 ${isVoiceEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-green-600" /> : <VolumeX className="w-4 h-4 text-red-600" />}
            <span className={isVoiceEnabled ? 'text-green-600' : 'text-red-600'}>
              {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
            </span>
          </Button>
        </div>
      </div>

      {/* WhatsApp-like Chat Container */}
      <div className="h-96 overflow-hidden bg-gradient-to-b from-green-50 to-green-100 border border-green-200 rounded-lg relative">
        {/* WhatsApp-like pattern background */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="whatsapp-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#128C7E" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#whatsapp-pattern)" />
          </svg>
        </div>
        
        <div className="p-4 border-b bg-green-600 text-white relative z-10">
          <h2 className="font-semibold flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Mission Control</span>
            {isPlaying && (
              <Badge variant="secondary" className="animate-pulse bg-green-500 text-white border-0">
                ● LIVE
              </Badge>
            )}
          </h2>
        </div>
        
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-4 space-y-4 relative z-10"
        >
          {displayedAlerts.length === 0 && !isPlaying && (
            <div className="text-center text-gray-500 mt-20">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-lg">Initializing alert system...</p>
            </div>
          )}
          
          {displayedAlerts.map((alert, index) => (
            <div
              key={`${alert.id}-${index}`}
              className={`flex justify-end mb-3 transform transition-all duration-500 ${
                index === 0 ? 'animate-slide-in scale-100' : 'scale-95'
              }`}
              style={{
                opacity: 1 - (index * 0.1)
              }}
            >
              <div className="max-w-xs lg:max-w-md">
                <div className={`${getAlertBubbleColor(alert.type)} text-white p-3 rounded-lg rounded-br-none shadow-lg relative`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      {getAlertIcon(alert.type)}
                    </div>
                    <h3 className="font-bold text-sm">
                      {alert.displayedTitle}
                      {alert.isTyping && index === 0 && (
                        <span className="inline-block w-1 h-3 bg-white ml-1 animate-pulse" />
                      )}
                    </h3>
                  </div>
                  
                  <p className="text-sm mb-2 leading-relaxed">
                    {alert.displayedMessage}
                    {alert.isTyping && index === 0 && alert.displayedTitle === alert.title && (
                      <span className="inline-block w-1 h-3 bg-white ml-1 animate-pulse" />
                    )}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs opacity-80">
                    <Badge 
                      variant="secondary"
                      className={`text-xs px-2 py-1 ${
                        alert.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {alert.priority.toUpperCase()}
                    </Badge>
                    <span className="text-xs">
                      {alert.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {/* WhatsApp-like tail */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-inherit transform rotate-45"></div>
                </div>
              </div>
            </div>
          ))}
          
          {!isPlaying && displayedAlerts.length > 0 && (
            <div className="text-center mt-8 p-4">
              <div className="inline-flex items-center space-x-2 text-green-600 font-bold text-lg">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                <span>Mission Briefing Complete!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Mail className="w-6 h-6 mx-auto mb-2 text-alert-email" />
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Emails</div>
        </Card>
        
        <Card className="p-4 text-center">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-alert-servicenow" />
          <div className="text-2xl font-bold text-gray-900">2</div>
          <div className="text-sm text-gray-600">ServiceNow</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Bell className="w-6 h-6 mx-auto mb-2 text-alert-incident" />
          <div className="text-2xl font-bold text-gray-900">2</div>
          <div className="text-sm text-gray-600">Incidents</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-alert-meeting" />
          <div className="text-2xl font-bold text-gray-900">1</div>
          <div className="text-sm text-gray-600">Meeting</div>
        </Card>
      </div>
    </div>
  );
};

export default AlertBot;
