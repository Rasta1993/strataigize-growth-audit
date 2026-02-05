
import React, { useState, useRef, useEffect } from 'react';
import { STRATAIGIZE_LOGO } from './constants';
import { AuditStep, Message } from './types';
import { sendMessage } from './services/gemini';

const App: React.FC = () => {
  const [step, setStep] = useState<AuditStep>(AuditStep.START);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const startAudit = () => {
    setStep(AuditStep.QUESTIONS);
    setErrorOccurred(false);
    const initialMessage = "Hey — welcome to the Strataigize Growth Audit.\n\nMost teams I talk to aren't spending too little on marketing. They're spending in the wrong places — wrong channels, wrong funnel stages, wrong creative. This takes about 3 minutes, and you'll walk away with a growth efficiency score and a clear picture of where your budget is leaking.\n\nLet's start: **What type of business are you?** (e.g., mobile app, e-commerce/DTC, SaaS, local service business, B2B, marketplace, etc.) and what do you sell?";
    setMessages([{ role: 'assistant', content: initialMessage }]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    const currentHistory = [...messages]; 

    setInputValue('');
    setErrorOccurred(false);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await sendMessage(currentHistory, userMsg); 
      
      setIsTyping(false);
      
      if (response.includes("API_KEY_ERROR") || response.includes("Error communicating")) {
        setErrorOccurred(true);
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      if (response.includes("GROWTH EFFICIENCY SCORE")) {
        setStep(AuditStep.RESULT);
      }
    } catch (err) {
      setIsTyping(false);
      setErrorOccurred(true);
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please check your connection and try again." }]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-transparent overflow-hidden">
      {step !== AuditStep.START && (
        <header className="fixed top-0 w-full flex justify-center items-center px-6 py-5 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center">
            {STRATAIGIZE_LOGO}
          </div>
        </header>
      )}

      <main className={`w-full max-w-3xl flex-1 flex flex-col ${step !== AuditStep.START ? 'mt-20' : ''}`}>
        {step === AuditStep.START && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in duration-700 max-w-2xl mx-auto px-4">
            <div className="space-y-3">
              <div className="text-[#E86125] text-xs font-bold tracking-[0.3em]">READY TO SCALE?</div>
              <div className="w-8 h-px bg-[#E86125] mx-auto"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              HOW TO GO FROM GUESSING WHICH ADS WORK TO <span className="text-[#E86125]">KNOWING</span> <span className="text-[#E86125]">WHICH DOLLARS</span> <span className="text-[#E86125]">CONVERT</span> WITH THIS FREE AD SPEND GRADER
            </h1>
            <button
              onClick={startAudit}
              className="px-10 py-4 bg-[#E86125] text-white font-bold text-sm tracking-wider uppercase rounded-md hover:bg-[#ff7a3d] transition-all duration-300 transform hover:scale-[1.03] shadow-[0_10px_30px_rgba(232,97,37,0.2)]"
            >
              YES! I WANT TO KNOW WHAT'S WORKING!
            </button>
          </div>
        )}

        {(step === AuditStep.QUESTIONS || step === AuditStep.RESULT) && (
          <div className="flex-1 glass-panel rounded-lg overflow-hidden flex flex-col shadow-2xl relative mx-auto w-full">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth"
            >
              {messages.map((msg, i) => {
                const isError = msg.content.includes("Error communicating") || msg.content.includes("API_KEY_ERROR");
                return (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
                  >
                    <div 
                      className={`max-w-[90%] rounded-lg px-5 py-4 text-sm md:text-base leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-[#E86125] text-white' 
                          : isError 
                            ? 'bg-red-900/50 border border-red-500/50 text-red-100'
                            : 'bg-black/30 text-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap prose prose-invert max-w-none prose-p:my-0">
                        {msg.content.split('\n').map((line, idx) => {
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={idx} className={idx > 0 ? 'mt-3' : ''}>
                              {parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                              })}
                            </p>
                          );
                        })}
                        
                        {msg.content.includes("Error communicating") && (
                          <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-[#E86125] hover:bg-[#ff7a3d] text-white text-xs font-bold rounded uppercase tracking-wider"
                          >
                            Refresh Application
                          </button>
                        )}

                        {msg.content.includes('[Get My Free Proposal from Strataigize]') && (
                          <div className="mt-6 pt-6 border-t border-white/10">
                            <a 
                              href="https://strataigize.com/proposal" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block w-full py-3 bg-[#E86125] hover:bg-[#ff7a3d] text-white text-center font-bold uppercase tracking-wider text-sm rounded-md transition-all"
                            >
                              Get My Free Proposal
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-black/30 rounded-lg px-5 py-4 flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {step === AuditStep.QUESTIONS && (
              <form 
                onSubmit={handleSend}
                className="p-4 border-t border-white/10"
              >
                <div className="relative flex items-center max-w-3xl mx-auto">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={errorOccurred ? "An API error occurred. Please refresh." : "Type your answer..."}
                    disabled={isTyping || errorOccurred}
                    className="w-full bg-black/30 border border-gray-700 rounded-md pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#E86125] text-white transition-all disabled:opacity-50 placeholder:text-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping || errorOccurred}
                    className="absolute right-2 p-2 bg-transparent rounded-md text-gray-400 disabled:text-gray-600 hover:text-[#E86125] transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      {step !== AuditStep.START && (
        <footer className="fixed bottom-4 text-gray-600 text-[10px] font-bold tracking-[0.2em] uppercase text-center w-full px-4">
          &copy; 2024 STRATAIGIZE. ALL RIGHTS RESERVED.
        </footer>
      )}
    </div>
  );
};

export default App;
