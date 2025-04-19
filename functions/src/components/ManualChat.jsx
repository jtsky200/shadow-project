import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Trash, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Unique session ID for memory-based chat
const SESSION_ID = 'cadillac-manual-chat';

export default function ManualChat() {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { role: 'assistant', content: 'Hello! I can help you with questions about your vehicle manual. What would you like to know?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [useMemory, setUseMemory] = useState(true); // New state to toggle between memory and streaming modes

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setChatLog(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (useMemory) {
      // Use memory-based chat
      try {
        const res = await fetch('/api/ask-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: input,
            sessionId: SESSION_ID,
          }),
        });

        const data = await res.json();
        const aiMsg = { role: 'assistant', content: data.answer };
        setChatLog(prev => [...prev, aiMsg]);
      } catch (err) {
        setChatLog(prev => [...prev, { role: 'assistant', content: '❌ Error getting response.' }]);
      }
      
      setLoading(false);
    } else {
      // Use streaming response
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch('/api/ask-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: input }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Stream failed');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantReply = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantReply += chunk;

          setChatLog(prev => {
            const withoutTemp = prev.filter(m => m.role !== 'typing');
            return [...withoutTemp, { role: 'typing', content: assistantReply }];
          });
        }

        setChatLog(prev => {
          const withoutTyping = prev.filter(m => m.role !== 'typing');
          return [...withoutTyping, { role: 'assistant', content: assistantReply }];
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setChatLog(prev => [...prev, { role: 'assistant', content: '❌ Error during response.' }]);
        }
      }

      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setChatLog([
      { role: 'assistant', content: 'Hello! I can help you with questions about your vehicle manual. What would you like to know?' }
    ]);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setChatLog(prev => {
        const withoutTyping = prev.filter(m => m.role !== 'typing');
        return [...withoutTyping, { role: 'assistant', content: '⚠️ Response generation was stopped.' }];
      });
      setLoading(false);
    }
  };

  const toggleChatMode = () => {
    setUseMemory(!useMemory);
  };

  return (
    <Card className="w-full h-[calc(100vh-10rem)]">
      <CardHeader className="border-b bg-muted/50">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <Bot className="mr-2 h-5 w-5" />
            Manual Chat Assistant
            <span className="ml-3 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {useMemory ? 'Memory Mode' : 'Stream Mode'}
            </span>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleChatMode}
              title={useMemory ? "Switch to streaming mode" : "Switch to memory mode"}
            >
              {useMemory ? "Use Streaming" : "Use Memory"}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearChat}
              title="Clear chat"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)] p-4">
          {chatLog.map((message, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-3 mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role !== 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`px-4 py-2 rounded-lg max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : message.role === 'typing'
                    ? 'bg-muted/50 border'
                    : 'bg-muted border'
                }`}
              >
                {message.role === 'typing' ? (
                  <div className="prose dark:prose-invert break-words">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                    <div className="inline-block ml-1 w-2 h-4 bg-primary/80 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert break-words">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/80 text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-3">
        <div className="flex gap-2 w-full">
          <Textarea
            placeholder="Ask a question about your manual..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
          <div className="flex flex-col gap-2">
            {loading ? (
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={stopGeneration}
                title="Stop generating"
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || loading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 