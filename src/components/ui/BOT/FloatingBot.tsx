import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'bot';
    text: string;
}

export default function FloatingBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 140 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hasMoved, setHasMoved] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: '¡Hola! Soy el asistente de Nico. Preguntame lo que quieras sobre sus proyectos 🚀' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setHasMoved(false);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setHasMoved(true);
            const newX = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragStart.x));
            const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragStart.y));
            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    const handleToggle = () => {
        // Solo abre si NO fue un drag
        if (!hasMoved) setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg: Message = { role: 'user', text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Acá conectarías a tu API/LLM. Por ahora respuesta simulada:
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { role: 'bot', text: 'Estoy procesando tu pregunta... (conectá tu API acá)' }
            ]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <>
            {/* Botón flotante / Burbuja */}
            <div
                onMouseDown={handleMouseDown}
                onClick={handleToggle}
                style={{ left: position.x, top: position.y }}
                className={`fixed z-50 w-20 h-20 rounded-full cursor-grab active:cursor-grabbing
                    bg-gradient-to-br from-[#38385C] to-[#070736]
                    border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.6)]
                    flex items-center justify-center
                    hover:scale-110 transition-transform duration-300
                    ${isDragging ? 'scale-110' : ''}
                    ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                {/* Pulso animado */}
                <span className="absolute inset-0 rounded-full bg-[#E04882]/30 animate-ping" />
                {/* Icono robot */}
                <span className="text-3xl relative z-10">🤖</span>
            </div>

            {/* Panel de chat */}
            {isOpen && (
                <div
                    style={{
                        left: Math.min(position.x, window.innerWidth - 400),
                        top: Math.min(position.y, window.innerHeight - 520)
                    }}
                    className="fixed z-50 w-[380px] h-[500px] flex flex-col
                        bg-gradient-to-br from-[#1a1a2e]/95 to-[#070736]/95 backdrop-blur-xl
                        border border-white/20 rounded-3xl
                        shadow-[0_20px_60px_rgba(0,0,0,0.8)]
                        animate-[slideIn_0.3s_ease-out]"
                >
                    {/* Header */}
                    <div
                        onMouseDown={handleMouseDown}
                        className="flex items-center justify-between p-4 border-b border-white/10
                            cursor-grab active:cursor-grabbing"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E04882] to-[#38385C]
                                flex items-center justify-center text-xl shadow-lg ring-2 ring-white/20">
                                🤖
                            </div>
                            <div>
                                <h3 className="text-[#CBCBCB] font-handwritten text-xl tracking-wider">
                                    Nico's Bot
                                </h3>
                                <span className="flex items-center gap-1 text-xs text-green-400">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Online
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                                text-[#CBCBCB] flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm
                                        ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-[#E04882] to-[#a8336a] text-white rounded-br-sm'
                                            : 'bg-white/10 text-[#CBCBCB] rounded-bl-sm border border-white/10'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#CBCBCB] animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 rounded-full bg-[#CBCBCB] animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 rounded-full bg-[#CBCBCB] animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Sugerencias rápidas */}
                    {messages.length === 1 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2">
                            {['¿Qué proyectos tiene?', '¿Stack tecnológico?', '¿Cómo lo contacto?'].map((q) => (
                                <button
                                    key={q}
                                    onClick={() => setInput(q)}
                                    className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10
                                        text-[#CBCBCB] hover:bg-white/15 transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Preguntame algo..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2
                                text-[#CBCBCB] placeholder-[#CBCBCB]/40 text-sm
                                focus:outline-none focus:border-[#E04882]/50 transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E04882] to-[#a8336a]
                                text-white flex items-center justify-center
                                hover:scale-110 transition-transform disabled:opacity-40 disabled:hover:scale-100"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* Keyframes */}
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    );
}