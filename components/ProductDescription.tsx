"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductDescriptionProps {
    description: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            // If content height is greater than 200px, show the button
            if (contentRef.current.scrollHeight > 250) {
                setShowButton(true);
            }
        }
    }, [description]);

    return (
        <div className="space-y-4">
            <div 
                ref={contentRef}
                className={`prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-sm overflow-hidden transition-all duration-500 ease-in-out ${
                    !isExpanded ? "max-h-[250px] relative" : "max-h-[2000px]"
                }`}
            >
                {description}
                
                {!isExpanded && showButton && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
            </div>

            {showButton && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center space-x-2 text-primary hover:text-orange-600 font-bold text-sm transition-colors group"
                >
                    <span>{isExpanded ? "Show Less" : "Show More"}</span>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    ) : (
                        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    )}
                </button>
            )}
        </div>
    );
}
