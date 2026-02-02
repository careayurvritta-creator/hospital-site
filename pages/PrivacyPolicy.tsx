/**
 * Privacy Policy Page
 * GDPR and DPDP Act 2023 compliant privacy policy
 */

import React from 'react';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="py-12 bg-ayur-cream min-h-screen">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-ayur-green-light rounded-full mb-4">
                            <Shield className="w-8 h-8 text-ayur-green" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-ayur-green mb-2">
                            Privacy Policy
                        </h1>
                        <p className="text-ayur-gray">Last updated: January 6, 2026</p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none text-ayur-gray">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">1. Introduction</h2>
                            <p>
                                Ayurvritta Ayurveda Hospital & Panchakarma Center ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                            </p>
                            <p>
                                We comply with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India and applicable international privacy regulations.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">2. Information We Collect</h2>
                            <h3 className="text-lg font-semibold text-ayur-green mb-2">Personal Information</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Name, email address, phone number</li>
                                <li>Medical history and health information (when you book a consultation)</li>
                                <li>Appointment and treatment records</li>
                                <li>Payment information (processed securely)</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-ayur-green mb-2 mt-4">Automatically Collected Information</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Device information (browser type, OS)</li>
                                <li>IP address and location (city-level)</li>
                                <li>Pages visited and time spent</li>
                                <li>Referral source</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">3. How We Use Your Information</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To provide and manage your appointments and treatments</li>
                                <li>To communicate with you about your health care</li>
                                <li>To send appointment reminders and follow-ups</li>
                                <li>To improve our website and services</li>
                                <li>To comply with legal obligations</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">4. Data Sharing</h2>
                            <p>We do not sell your personal information. We may share your data with:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Healthcare providers for referrals or collaborative care</li>
                                <li>Insurance companies (with your consent) for cashless claims</li>
                                <li>Analytics providers (anonymized data only)</li>
                                <li>Legal authorities when required by law</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">5. Your Rights</h2>
                            <p>Under the DPDP Act 2023, you have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Withdraw consent at any time</li>
                                <li>Data portability</li>
                                <li>Lodge a complaint with the Data Protection Board</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">6. Cookies</h2>
                            <p>
                                We use essential cookies to ensure the website functions properly. Analytics cookies are used only with your consent to understand how visitors use our site. You can manage cookie preferences through our cookie banner.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">7. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal data, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">8. Data Retention</h2>
                            <p>
                                We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Medical records are retained as per applicable healthcare regulations.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">9. Contact Us</h2>
                            <p>For privacy-related queries or to exercise your rights:</p>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-ayur-green" />
                                    <span>care.ayurvritta@gmail.com</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-ayur-green" />
                                    <span>+91 94266 84047</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-ayur-green" />
                                    <span>FF 104–113, Lotus Enora Complex, Vadodara - 390021</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
