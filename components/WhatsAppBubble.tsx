import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface WhatsAppBubbleProps {
    phoneNumber?: string;
    defaultMessage?: string;
}

const WhatsAppBubble: React.FC<WhatsAppBubbleProps> = ({
    phoneNumber = '919426684047',
    defaultMessage = 'Hello! I am interested in learning more about Ayurvritta treatments.'
}) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const handleClick = () => {
        const encodedMessage = encodeURIComponent(defaultMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            {/* Tooltip */}
            <div
                className={`fixed bottom-36 left-4 md:bottom-24 md:left-6 z-[60] bg-white rounded-xl shadow-2xl p-4 max-w-[280px] transition-all duration-300 ${isTooltipVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
            >
                <button
                    onClick={() => setIsTooltipVisible(false)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Close tooltip"
                    title="Close"
                >
                    <X size={14} className="text-gray-600" />
                </button>
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">Chat with us on WhatsApp</p>
                        <p className="text-xs text-gray-500">Click to start a conversation with our team</p>
                    </div>
                </div>
                <button
                    onClick={handleClick}
                    className="w-full mt-3 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <MessageCircle size={16} />
                    Start Chat
                </button>
            </div>

            {/* Floating WhatsApp Button */}
            <button
                onClick={() => setIsTooltipVisible(!isTooltipVisible)}
                onMouseEnter={() => setIsTooltipVisible(true)}
                className="fixed bottom-20 !bottom-20 left-4 md:bottom-6 md:left-6 z-[60] group"
                style={{ bottom: '5rem' }}
                aria-label="Chat on WhatsApp"
                title="Chat on WhatsApp"
            >
                {/* Pulse Animation Ring */}
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30"></span>

                {/* Button */}
                <span className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] rounded-full shadow-2xl transition-all duration-300 hover:scale-110">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </span>

                {/* Hover Label */}
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Chat on WhatsApp
                </span>
            </button>
        </>
    );
};

export default WhatsAppBubble;
