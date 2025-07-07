
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Calendar, AlertTriangle, Users, Pause, Play } from 'lucide-react';

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
  const [displayedAlerts, setDisplayedAlerts] = useState<DisplayAlert[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const getAlertGlow = (type: string) => {
    switch (type) {
      case 'email':
        return 'shadow-2xl shadow-alert-email/50 border-alert-email/20';
      case 'servicenow':
        return 'shadow-2xl shadow-alert-servicenow/50 border-alert-servicenow/20';
      case 'incident':
        return 'shadow-2xl shadow-alert-incident/50 border-alert-incident/20';
      case 'meeting':
        return 'shadow-2xl shadow-alert-meeting/50 border-alert-meeting/20';
      default:
        return 'shadow-2xl shadow-gray-500/50 border-gray-500/20';
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
        // Mark typing as complete
        setDisplayedAlerts(prev => 
          prev.map((item, index) => 
            index === 0 
              ? { ...item, isTyping: false }
              : item
          )
        );
        setTimeout(onComplete, 800); // Pause before next alert
      }
    };

    setTimeout(typeNextWord, 300); // Initial delay
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
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
        </div>
      </div>

      {/* Alert Chat Container */}
      <Card className="h-96 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black border-2 border-gray-700">
        <div className="p-4 border-b bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
          <h2 className="font-semibold text-white flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Mission Control</span>
            {isPlaying && (
              <Badge variant="secondary" className="animate-pulse-glow bg-green-600 text-white">
                ● LIVE
              </Badge>
            )}
          </h2>
        </div>
        
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-black"
        >
          {displayedAlerts.length === 0 && !isPlaying && (
            <div className="text-center text-gray-400 mt-20">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600 animate-pulse" />
              <p className="text-lg">Initializing alert system...</p>
            </div>
          )}
          
          {displayedAlerts.map((alert, index) => (
            <div
              key={`${alert.id}-${index}`}
              className={`flex items-start space-x-3 transform transition-all duration-500 ${
                index === 0 ? 'animate-slide-in scale-105' : 'scale-100'
              }`}
              style={{
                transform: `translateY(${index * 2}px)`,
                opacity: 1 - (index * 0.1)
              }}
            >
              <div className={`p-3 rounded-full ${getAlertColor(alert.type)} flex-shrink-0 animate-pulse`}>
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1">
                <Card className={`p-4 border-2 ${getAlertGlow(alert.type)} bg-gray-800/90 backdrop-blur-sm`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-lg">
                      {alert.displayedTitle}
                      {alert.isTyping && index === 0 && (
                        <span className="inline-block w-2 h-5 bg-white ml-1 animate-pulse" />
                      )}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                        className="animate-fade-in"
                      >
                        {alert.priority.toUpperCase()}
                      </Badge>
                      {alert.time && (
                        <Badge variant="outline" className="text-white border-white/30">
                          {alert.time}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {alert.displayedMessage}
                    {alert.isTyping && index === 0 && alert.displayedTitle === alert.title && (
                      <span className="inline-block w-2 h-4 bg-gray-300 ml-1 animate-pulse" />
                    )}
                  </p>
                </Card>
              </div>
            </div>
          ))}
          
          {!isPlaying && displayedAlerts.length > 0 && (
            <div className="text-center mt-8 p-4">
              <div className="inline-flex items-center space-x-2 text-green-400 font-bold text-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Mission Briefing Complete!
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

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
