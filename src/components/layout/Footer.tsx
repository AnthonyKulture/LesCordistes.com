import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Mail, Phone } from 'lucide-react';
import { SEO_PHONE, SEO_PHONE_DISPLAY, SEO_EMAIL } from '@/constants/seoConfig';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-white">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <img
                                src="/lescordistes.com-white-logo.png"
                                alt="LesCordistes Logo Blanc"
                                className="h-12 w-auto object-contain"
                            />
                        </div>
                        <p className="text-slate-400 text-sm">
                            La plateforme qui connecte les professionnels du travail en hauteur avec leurs clients.
                        </p>
                        <div className="mt-4 space-y-2">
                            <a href={`tel:${SEO_PHONE}`} className="flex items-center gap-2 text-slate-300 hover:text-brand-blue-light text-sm transition-colors">
                                <Phone size={15} />
                                <span>{SEO_PHONE_DISPLAY}</span>
                            </a>
                            <a href={`mailto:${SEO_EMAIL}`} className="flex items-center gap-2 text-slate-300 hover:text-brand-blue-light text-sm transition-colors">
                                <Mail size={15} />
                                <span>{SEO_EMAIL}</span>
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Pour les Clients</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li>
                                <Link href="/post-job" className="hover:text-brand-blue transition-colors">
                                    Publier un projet
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs" className="hover:text-brand-blue transition-colors">
                                    Découvrir les cordistes
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Pour les Cordistes</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li>
                                <Link href="/jobs" className="hover:text-brand-blue transition-colors">
                                    Trouver des missions
                                </Link>
                            </li>
                            <li>
                                <Link href="/credits" className="hover:text-brand-blue transition-colors">
                                    Acheter des crédits
                                </Link>
                            </li>
                            <li>
                                <Link href="/inscription-cordiste" className="hover:text-brand-blue transition-colors">
                                    S'inscrire
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Suivez-nous</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-brand-blue transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-brand-blue transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-brand-blue transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href={`mailto:${SEO_EMAIL}`} className="text-slate-400 hover:text-brand-blue transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
                    <p className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                        <span>&copy; {new Date().getFullYear()} LesCordistes.com - Tous droits réservés</span>
                        <Link href="/cgu" className="hover:text-brand-blue transition-colors">CGU</Link>
                        <Link href="/cgv" className="hover:text-brand-blue transition-colors">CGV</Link>
                        <Link href="/confidentialite" className="hover:text-brand-blue transition-colors">Confidentialité</Link>
                        <Link href="/mentions-legales" className="hover:text-brand-blue transition-colors">Mentions Légales</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
};
