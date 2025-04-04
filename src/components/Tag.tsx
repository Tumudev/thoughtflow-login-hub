
import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagProps {
  id: string;
  name: string;
  color?: string;
  onRemove?: (id: string) => void;
  onClick?: (id: string) => void;
  size?: "sm" | "md";
}

const Tag = ({ id, name, color = "#6E59A5", onRemove, onClick, size = "md" }: TagProps) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(id);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <Badge
      onClick={onClick ? handleClick : undefined}
      className={`
        ${size === "sm" ? "px-2 py-0 text-xs" : "px-2.5 py-0.5 text-sm"} 
        rounded-full cursor-${onClick ? "pointer" : "default"} font-medium
      `}
      style={{ backgroundColor: color, color: "#fff" }}
    >
      {name}
      {onRemove && (
        <X
          size={size === "sm" ? 14 : 16}
          className="ml-1 hover:text-white/80 cursor-pointer"
          onClick={handleRemove}
        />
      )}
    </Badge>
  );
};

export default Tag;
