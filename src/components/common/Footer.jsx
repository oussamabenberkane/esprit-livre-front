import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
    const { t } = useTranslation();

    const handleLinkClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-white border-t border-gray-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Social Networks Section */}
                    <div className="text-center">
                        <h3 className="text-fluid-h3 font-semibold text-gray-800 mb-4">
                            {t('footer.socialNetworks')}
                        </h3>
                        <div className="flex justify-center gap-6">
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
                    <div className="text-center">
                        <h3 className="text-fluid-h3 font-semibold text-gray-800 mb-4">
                            {t('footer.whoAreWe.title')}
                        </h3>
                        <Link
                            to="/team"
                            onClick={handleLinkClick}
                            className="inline-flex items-center gap-2 justify-center"
                        >
                            <h3 className="text-fluid-small text-[#1E40AF] hover:text-blue-700 transition-colors font-medium">{t('footer.whoAreWe.team')}</h3>
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
                        </Link>
                    </div>

                    {/* Customer Service Section */}
                    <div className="text-center">
                        <h3 className="text-fluid-h3 font-semibold text-gray-800 mb-4">
                            {t('footer.customerService.title')}
                        </h3>
                        <Link
                            to="/service-client"
                            onClick={handleLinkClick}
                            className="inline-flex items-center gap-2 justify-center"
                        >
                            <h3 className="text-fluid-small text-[#1E40AF] hover:text-blue-700 transition-colors font-medium">{t('footer.customerService.link')}</h3>
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
                        </Link>
                    </div>
                </div>

                {/* Bottom Copyright Section */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                    <p className="text-gray-500 text-sm">
                        {t('footer.copyright', { year: new Date().getFullYear() })}
                    </p>
                </div>
            </div>
        </footer>
    );
}