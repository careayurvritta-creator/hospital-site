import React, { useState } from 'react';
import { Share2, Mail, Link as LinkIcon, Check, Facebook, Twitter, Smartphone } from 'lucide-react';

interface ShareResultsProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

const ShareResults: React.FC<ShareResultsProps> = ({ 
  title, 
  text, 
  url = typeof window !== 'undefined' ? window.location.href : '',
  className = ""
}) => {
  const [copied, setCopied] = useState(false);
  const fullText = `${text}\n\nCheck your health at: ${url}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: Smartphone, // Using Smartphone as generic mobile/app icon proxy or could use specific SVGs
      href: `https://wa.me/?text=${encodeURIComponent(fullText)}`,
      color: 'hover:text-green-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-400'
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullText)}`,
      color: 'hover:text-ayur-gold'
    }
  ];

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Native Share Button (Main) */}
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-6 py-3 bg-ayur-cream text-ayur-green font-bold rounded-full border border-ayur-subtle hover:bg-ayur-green hover:text-white transition-all shadow-sm"
        >
          <Share2 size={18} />
          Share Result
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="p-3 bg-white text-ayur-gray rounded-full border border-ayur-subtle hover:border-ayur-gold transition-colors relative group"
          aria-label="Copy to clipboard"
        >
          {copied ? <Check size={18} className="text-green-600" /> : <LinkIcon size={18} />}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {copied ? 'Copied!' : 'Copy Text'}
          </span>
        </button>
      </div>

      {/* Fallback / Desktop Quick Links */}
      <div className="flex gap-4 text-gray-400">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors ${link.color}`}
            title={`Share on ${link.name}`}
          >
            <link.icon size={20} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default ShareResults;
