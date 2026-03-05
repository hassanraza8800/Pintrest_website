import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div>
                        <h3 className="font-bold text-lg mb-4">Virelle beauty& bags</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto md:mx-0">
                            Your destination for premium beauty finds and stylish bags, curated for your unique style.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/" className="hover:text-primary">Home</Link></li>
                            <li><Link href="/products" className="hover:text-primary">Products</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                            <li><span className="italic">Disclosure: As an Amazon Associate I earn from qualifying purchases.</span></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-50 text-center text-gray-400 text-xs">
                    © {new Date().getFullYear()} Virelle beauty& bags. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
