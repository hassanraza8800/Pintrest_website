"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-8 flex-1">
                    <Link href="/" className="flex items-center space-x-2 shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">V</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:block whitespace-nowrap">Virelle beauty& bags</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900"
                            onChange={(e) => {
                                const searchEvent = new CustomEvent('productSearch', { detail: e.target.value });
                                window.dispatchEvent(searchEvent);
                            }}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* Mobile Search & Nav */}
                <div className="flex items-center space-x-4">
                    <button
                        className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-gray-600 hover:text-primary font-medium transition-colors">Home</Link>
                        <Link href="/products" className="text-gray-600 hover:text-primary font-medium transition-colors text-nowrap">All Products</Link>
                    </nav>
                </div>
            </div>

            {/* Mobile Nav & Search */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900"
                            onChange={(e) => {
                                const searchEvent = new CustomEvent('productSearch', { detail: e.target.value });
                                window.dispatchEvent(searchEvent);
                            }}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <Link href="/" className="block text-gray-600 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/products" className="block text-gray-600 hover:text-primary font-medium" onClick={() => setIsMenuOpen(false)}>All Products</Link>
                </div>
            )}
        </header>
    );
}
