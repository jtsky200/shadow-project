"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ClickableTagProps {
  name: string
  color?: string
  isActive?: boolean
  onClick?: (name: string) => void
  isNew?: boolean
  className?: string
}

// Consistent orange color for all NEW tags
const NEW_TAG_COLOR = "#ff7b00"

export function ClickableTag({
  name,
  color = "#4f46e5",
  isActive = false,
  onClick,
  isNew = false,
  className,
}: ClickableTagProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showNewTag, setShowNewTag] = useState(isNew) // Default to isNew prop
  const initialCheckDone = useRef(false)
  
  // Check localStorage on component mount to see if this tag has been viewed
  useEffect(() => {
    // Only run this once per component instance
    if (isNew && !initialCheckDone.current) {
      initialCheckDone.current = true;
      
      // Only access localStorage on the client side
      if (typeof window !== 'undefined') {
        try {
          const viewedNewTags = JSON.parse(localStorage.getItem('viewedNewTags') || '[]')
          const tagIdentifier = `${name.toLowerCase()}-tag`
          // Only update state if different from current
          const shouldShow = !viewedNewTags.includes(tagIdentifier);
          if (showNewTag !== shouldShow) {
            setShowNewTag(shouldShow);
          }
        } catch (error) {
          console.error("Error reading from localStorage:", error)
          // Don't update state if there's an error
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, name]); // Remove showNewTag from dependencies to avoid infinite loop
  
  const handleClick = () => {
    // Save to localStorage that this NEW tag has been viewed
    if (isNew && showNewTag) {
      // Only access localStorage on the client side
      if (typeof window !== 'undefined') {
        try {
          const viewedNewTags = JSON.parse(localStorage.getItem('viewedNewTags') || '[]')
          const tagIdentifier = `${name.toLowerCase()}-tag`
          
          if (!viewedNewTags.includes(tagIdentifier)) {
            const updatedTags = [...viewedNewTags, tagIdentifier]
            localStorage.setItem('viewedNewTags', JSON.stringify(updatedTags))
            setShowNewTag(false)
          }
        } catch (error) {
          console.error("Error writing to localStorage:", error)
        }
      }
    }
    
    if (onClick) {
      onClick(name)
    }
  }

  // Use inline styles to ensure colors are properly applied
  // Override color with orange if it's a NEW tag
  const styles = {
    backgroundColor: isNew ? NEW_TAG_COLOR : color,
    color: 'white',
    borderColor: isNew ? NEW_TAG_COLOR : color,
  };
  
  // For tags that are explicitly named "New", don't show the extra NEW badge
  const isNewTag = name.toLowerCase() === "new";
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 cursor-pointer transition-all duration-200 select-none h-6 text-xs font-medium",
        isActive ? `ring-2 ring-offset-1` : "",
        isHovered ? "scale-105" : "",
        className
      )}
      style={styles}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {name}
      {/* Only show the NEW badge for non-"New" tags that are marked as new */}
      {isNew && showNewTag && !isNewTag && (
        <span className="ml-1 bg-white text-black text-[8px] rounded-full px-1 font-bold">
          NEW
        </span>
      )}
    </Badge>
  )
} 