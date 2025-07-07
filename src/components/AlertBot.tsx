
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Calendar, AlertTriangle, Users, Volume2, VolumeX } from 'lucide-react';

interface Alert {
  id: string;
  type: 'email' | 'servicenow' | 'incident' | 'meeting';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  time?: string;
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
  const [currentAlertIndex, setCurrentAlertIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
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
        return 'bg-alert-email text-white';
      case 'servicenow':
        return 'bg-alert-servicenow text-white';
      case 'incident':
        return 'bg-alert-incident text-white';
      case 'meeting':
        return 'bg-alert-meeting text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const speakText = (text: string) => {
    if (!isSpeechEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  };

  const startAlerts = () => {
    setIsPlaying(true);
    setCurrentAlertIndex(0);
  };

  const stopAlerts = () => {
    setIsPlaying(false);
    setCurrentAlertIndex(-1);
    speechSynthesis.cancel();
  };

  useEffect(() => {
    if (isPlaying && currentAlertIndex >= 0 && currentAlertIndex < mockAlerts.length) {
      const alert = mockAlerts[currentAlertIndex];
      const fullMessage = `${alert.title}. ${alert.message}`;
      
      // Speak the alert
      speakText(fullMessage);
      
      // Auto-scroll to the latest alert
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);

      // Move to next alert after 4 seconds
      const timer = setTimeout(() => {
        if (currentAlertIndex < mockAlerts.length - 1) {
          setCurrentAlertIndex(currentAlertIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [currentAlertIndex, isPlaying, isSpeechEnabled]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Alert Bot</h1>
        </div>
        <p className="text-gray-600">Your personalized task alert system for today</p>
        
        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button 
            onClick={startAlerts} 
            disabled={isPlaying}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPlaying ? 'Playing Alerts...' : 'Start Daily Alerts'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={stopAlerts}
            disabled={!isPlaying}
          >
            Stop Alerts
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
            className="flex items-center space-x-2"
          >
            {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{isSpeechEnabled ? 'Sound On' : 'Sound Off'}</span>
          </Button>
        </div>
      </div>

      {/* Alert Chat Container */}
      <Card className="h-96 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Alert Assistant</span>
            {isPlaying && (
              <Badge variant="secondary" className="animate-pulse-glow">
                Speaking...
              </Badge>
            )}
          </h2>
        </div>
        
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
        >
          {currentAlertIndex === -1 && !isPlaying && (
            <div className="text-center text-gray-500 mt-20">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Click "Start Daily Alerts" to begin your briefing</p>
            </div>
          )}
          
          {mockAlerts.slice(0, currentAlertIndex + 1).map((alert, index) => (
            <div
              key={alert.id}
              className={`flex items-start space-x-3 animate-fade-in ${
                index === currentAlertIndex ? 'animate-slide-in' : ''
              }`}
            >
              <div className={`p-2 rounded-full ${getAlertColor(alert.type)} flex-shrink-0`}>
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1">
                <Card className="p-4 shadow-sm border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                      >
                        {alert.priority}
                      </Badge>
                      {alert.time && (
                        <Badge variant="outline">{alert.time}</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{alert.message}</p>
                </Card>
              </div>
            </div>
          ))}
          
          {isPlaying && currentAlertIndex >= mockAlerts.length - 1 && (
            <div className="text-center mt-8 p-4">
              <div className="inline-flex items-center space-x-2 text-green-600 font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Daily briefing complete! Have a productive day!</span>
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
