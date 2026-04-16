import Link from 'next/link';

interface LogoProps {
  variant?: 'header' | 'footer';
  className?: string;
}

export function Logo({ variant = 'header', className = '' }: LogoProps) {
  const isFooter = variant === 'footer';
  
  return (
    <Link href="/" className={`group flex items-center gap-3 ${className}`}>
      <div className="relative">
        <svg
          width={isFooter ? '44' : '48'}
          height={isFooter ? '44' : '48'}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
            <linearGradient id="logoGradientHover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="10"
            fill="url(#logoGradient)"
            filter="url(#glow)"
            className="transition-all duration-300 group-hover:fill-[url(#logoGradientHover)]"
          />
          
          <path
            d="M16 30V18L24 14L32 18V30L24 34L16 30Z"
            fill="white"
            opacity="0.9"
            className="animate-pulse-slow"
          />
          
          <path
            d="M24 14V34"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          
          <path
            d="M16 18L32 30"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          
          <circle
            cx="24"
            cy="24"
            r="3"
            fill="white"
            className="animate-ping-slow"
          />
        </svg>
        
        <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      </div>
      
      <div className="flex flex-col">
        <span className={`${isFooter ? 'text-xl' : 'text-lg lg:text-xl'} font-bold text-slate-900 group-hover:text-violet-700 transition-colors duration-300`}>
          e<span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent group-hover:from-violet-500 group-hover:via-purple-500 group-hover:to-fuchsia-500 transition-all duration-300">Visa</span>Traveler
        </span>
        <span className={`${isFooter ? 'text-xs' : 'text-[10px] lg:text-xs'} text-slate-500 hidden sm:block tracking-wide group-hover:text-violet-600 transition-colors duration-300`}>
          Global Visa Solutions
        </span>
      </div>
    </Link>
  );
}
