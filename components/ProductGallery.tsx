"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
    images: string[];
    title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const displayImages = images.length > 0 ? images : ["/placeholder.jpg"];

    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* Thumbnails - Hidden on mobile, shown on the left on desktop */}
            <div className="hidden md:flex md:flex-col gap-3 order-2 md:order-1">
                {displayImages.map((src, index) => (
                    <button
                        key={index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => setActiveIndex(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            activeIndex === index ? "border-primary shadow-md" : "border-transparent hover:border-gray-200"
                        }`}
                    >
                        <Image
                            src={src}
                            alt={`${title} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                            referrerPolicy="no-referrer"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-1 aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gray-50 shadow-xl shadow-gray-200/50 group order-1 md:order-2">
                <Image
                    src={displayImages[activeIndex]}
                    alt={title}
                    fill
                    className="object-contain p-2 sm:p-4 md:p-8 transition-all duration-500"
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    unoptimized
                    referrerPolicy="no-referrer"
                />

                {/* Mobile Navigation Arrows */}
                {displayImages.length > 1 && (
                    <>
                        <button
                            onClick={() => setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg md:hidden transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg md:hidden transition-all"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {/* Mobile Thumbnails - Horizontal scroll below image */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide order-3">
                {displayImages.map((src, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`relative min-w-[64px] h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                            activeIndex === index ? "border-primary" : "border-transparent"
                        }`}
                    >
                        <Image
                            src={src}
                            alt={`${title} thumb ${index}`}
                            fill
                            className="object-cover"
                            unoptimized
                            referrerPolicy="no-referrer"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
