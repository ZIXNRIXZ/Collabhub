import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Upload, Terminal, CheckCircle, XCircle, Clock, MessageSquare, Send, Mic, MicOff, Users, Loader2, Code, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';
import { socketManager } from '@/lib/socket';

export function CodeCollaboration() {
  const { toast } = useToast();
  const [activeEditor, setActiveEditor] = useState<'main' | 'sandbox'>('main');
  const [showChat, setShowChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [compilationResult, setCompilationResult] = useState<any>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'cpp'>('javascript');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Code state
  const [mainCode, setMainCode] = useState(`// CollabHub Main Editor
import React, { useState, useEffect } from 'react';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Initialize real-time collaboration
    console.log('Initializing CollabHub...');
    setIsConnected(true);
  }, []);

  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-background">
        <Dashboard connected={isConnected} />
      </div>
    </WebSocketProvider>
  );
}`);

  const [sandboxCode, setSandboxCode] = useState(`// Personal Sandbox - Experiment Here
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55`);

  // TRPC queries and mutations
  const { data: sessions = [], refetch: refetchSessions } = trpc.collab.getSessions.useQuery();
  const createSessionMutation = trpc.collab.createSession.useMutation({
    onSuccess: (session) => {
      refetchSessions();
      setCurrentSession(session);
      setShowSessionDialog(false);
      setNewSessionName('');
      toast({
        title: 'Session created',
        description: 'New collaboration session has been created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create session.',
        variant: 'destructive',
      });
    },
  });

  const updateCodeMutation = trpc.collab.updateSessionCode.useMutation({
    onSuccess: () => {
      toast({
        title: 'Code saved',
        description: 'Code has been saved to the session.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save code.',
        variant: 'destructive',
      });
    },
  });

  const compileCodeMutation = trpc.collab.compileCode.useMutation({
    onSuccess: (result) => {
      setCompilationResult(result);
      setIsCompiling(false);
      toast({
        title: 'Code compiled',
        description: 'Code has been compiled successfully.',
      });
    },
    onError: (error) => {
      setIsCompiling(false);
      toast({
        title: 'Compilation failed',
        description: error.message || 'Failed to compile code.',
        variant: 'destructive',
      });
    },
  });

  const [chatMessages] = useState([
    { id: 1, user: 'Alex Chen', message: 'Anyone know why the API call is failing?', time: '2:34 PM', type: 'text' },
    { id: 2, user: 'Sarah Kim', message: 'Let me check the network tab', time: '2:35 PM', type: 'text' },
    { id: 3, user: 'You', message: 'I think it might be a CORS issue', time: '2:36 PM', type: 'text' },
    { id: 4, user: 'Mike Johnson', message: '🎤 Voice message', time: '2:37 PM', type: 'voice', duration: '0:15' }
  ]);

  const handleRunCode = () => {
    const codeToRun = activeEditor === 'main' ? mainCode : sandboxCode;
    setIsCompiling(true);
    
    compileCodeMutation.mutate({
      code: codeToRun,
      language: selectedLanguage,
    });
  };

  const handleSaveCode = () => {
    if (currentSession) {
      const codeToSave = activeEditor === 'main' ? mainCode : sandboxCode;
      updateCodeMutation.mutate({
        sessionId: currentSession.id,
        code: codeToSave,
      });
    } else {
      toast({
        title: 'No active session',
        description: 'Please create or join a session first.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateSession = () => {
    if (!newSessionName.trim()) {
      toast({
        title: 'Error',
        description: 'Session name is required.',
        variant: 'destructive',
      });
      return;
    }

    createSessionMutation.mutate({
      name: newSessionName,
      code: mainCode,
    });
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Add message to chat logic here
      setChatMessage('');
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Recording started",
        description: "Speak your question about the code",
      });
    } else {
      toast({
        title: "Voice message sent",
        description: "Your voice question has been sent to the team",
      });
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    // Connect to WebSocket
    const socket = socketManager.connect();
    
    socket.on('connect', () => {
      setIsConnected(true);
      if (currentSession) {
        socketManager.joinSession(currentSession.id);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for code updates from other users
    socketManager.onCodeUpdate((code) => {
      setMainCode(code);
    });

    return () => {
      socketManager.disconnect();
    };
  }, [currentSession]);

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Code Collaboration</h2>
          <p className="text-muted-foreground">Real-time collaborative coding with live compilation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button onClick={() => setShowSessionDialog(true)}>
            <Users className="w-4 h-4 mr-2" />
            {currentSession ? currentSession.name : 'Join Session'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Main Editor */}
        <Card className="p-4 h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <h3 className="font-semibold">Main Editor</h3>
              <Badge variant="secondary">React/TypeScript</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedLanguage} onValueChange={(value: 'javascript' | 'python' | 'cpp') => setSelectedLanguage(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRunCode} disabled={isCompiling}>
                {isCompiling ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" />
                )}
                Run Code
              </Button>
              <Button variant="outline" onClick={handleSaveCode}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          
          <Textarea
            value={mainCode}
            onChange={(e) => setMainCode(e.target.value)}
            className="h-64 font-mono text-sm resize-none"
            placeholder="Start coding here..."
          />
        </Card>

        {/* Sandbox Editor */}
        <Card className="p-4 h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <h3 className="font-semibold">Sandbox</h3>
              <Badge variant="outline">Experimental</Badge>
            </div>
            <Button variant="outline" onClick={() => setSandboxCode(mainCode)}>
              <Upload className="w-4 h-4 mr-2" />
              Sync from Main
            </Button>
          </div>
          
          <Textarea
            value={sandboxCode}
            onChange={(e) => setSandboxCode(e.target.value)}
            className="h-64 font-mono text-sm resize-none"
            placeholder="Experiment with code here..."
          />
        </Card>
      </div>

      {/* Compilation Results */}
      {compilationResult && (
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Terminal className="w-5 h-5" />
            <h3 className="font-semibold">Compilation Results</h3>
            <Badge variant={compilationResult.success ? "default" : "destructive"}>
              {compilationResult.success ? "Success" : "Failed"}
            </Badge>
          </div>
          
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="mb-2">
              <span className="text-yellow-400">$</span> {selectedLanguage} execution
            </div>
            <div className="whitespace-pre-wrap">{compilationResult.output}</div>
            {compilationResult.executionTime && (
              <div className="text-gray-400 mt-2">
                Execution time: {compilationResult.executionTime.toFixed(2)}ms
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 w-80 h-96 bg-background border rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Team Chat</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">{message.user[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{message.user}</span>
                      <span className="text-xs text-muted-foreground">{message.time}</span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button variant="ghost" size="sm" onClick={handleVoiceToggle}>
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button size="sm" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-4 left-4 rounded-full w-12 h-12"
        onClick={() => setShowChat(!showChat)}
      >
        <MessageSquare className="w-5 h-5" />
      </Button>

      {/* Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collaboration Session</DialogTitle>
            <DialogDescription>
              Share your code with others in real-time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionName">Session Name</Label>
              <Input
                id="sessionName"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Enter session name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSessionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSession}
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                Create Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}