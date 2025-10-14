import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-12">
            <div className="max-w-7xl mx-auto lg:ml-fluid-2xl px-fluid-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Social Networks Section */}
                    <div className="text-center md:text-left">
                        <h3 className="text-fluid-h3 font-semibold text-gray-800 mb-4">
                            Réseaux sociaux
                        </h3>
                        <div className="flex justify-center md:justify-start gap-6">
                            <a
                                href="#"
                                className="text-[#1E40AF] hover:text-blue-700 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook size={32} strokeWidth={1.5} />
                            </a>
                            <a
                                href="#"
                                className="text-[#1E40AF] hover:text-blue-700 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram size={32} strokeWidth={1.5} />
                            </a>
                            <a
                                href="#"
                                className="text-[#1E40AF] hover:text-blue-700 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter size={32} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    {/* Who Are We Section */}
                    <div className="text-center md:text-left">
                        <h3 className="text-fluid-h3 font-semibold text-gray-800 mb-4">
                            Qui sommes-nous ?
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 text-fluid-small hover:text-[#1E40AF] transition-colors"
                                >
                                    À propos
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 text-fluid-small hover:text-[#FFFFFF] transition-colors"
                                >
                                    Notre équipes
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service Section */}
                    <div className="text-center md:text-left">
                        <h3 className="text-fluid-h3 font-semibold text-gray-800 mb-4">
                            Service clients
                        </h3>
                        <a
                            href="#"
                            className="inline-flex items-center gap-2"
                        >
                            <h3 className="text-fluid-small text-[#1E40AF] hover:text-blue-700 transition-colors font-medium"> Accéder à la page Service Client</h3>
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Bottom Copyright Section */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Tous droits réservés
                    </p>
                </div>
            </div>
        </footer>
    );
}