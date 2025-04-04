
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-thoughtflow-400 to-thoughtflow-600 flex items-center justify-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 4L3 11L10 14L13 21L20 4Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-thoughtflow-500 to-thoughtflow-700 bg-clip-text text-transparent">
        ThoughtFlow
      </span>
    </div>
  );
};

export default Logo;
