/**
 * Terms of Service Page
 */

import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';

const Terms: React.FC = () => {
    return (
        <div className="py-12 bg-ayur-cream min-h-screen">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-ayur-green-light rounded-full mb-4">
                            <FileText className="w-8 h-8 text-ayur-green" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-ayur-green mb-2">
                            Terms of Service
                        </h1>
                        <p className="text-ayur-gray">Last updated: January 6, 2026</p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none text-ayur-gray">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using the Ayurvritta Ayurveda Hospital website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">2. Services</h2>
                            <p>
                                Ayurvritta provides Ayurvedic healthcare services including consultations, Panchakarma treatments, wellness programs, and related healthcare services. Our services are provided by qualified BAMS practitioners under the supervision of Dr. Jinendradutt Sharma.
                            </p>
                        </section>

                        {/* Medical Disclaimer */}
                        <section className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h2 className="text-xl font-bold text-yellow-800 mb-2">Medical Disclaimer</h2>
                                    <p className="text-yellow-800">
                                        The information on this website is for educational purposes only and is not intended as medical advice. Always consult a qualified healthcare practitioner before starting any treatment. Individual results may vary. Ayurveda treatments complement but do not replace modern medical care for serious conditions.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">3. Appointments & Cancellations</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Appointments must be booked in advance</li>
                                <li>Cancellations should be made at least 24 hours before the scheduled time</li>
                                <li>Late cancellations may be subject to cancellation fees</li>
                                <li>We reserve the right to reschedule appointments due to unforeseen circumstances</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">4. Payment Terms</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Payment is due at the time of service unless covered by insurance</li>
                                <li>We accept cash, UPI, credit/debit cards</li>
                                <li>Insurance claims are processed as per insurance partner terms</li>
                                <li>Package payments follow specific terms as outlined at booking</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">5. Refund Policy</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Unused package sessions may be refunded with a 10% deduction</li>
                                <li>Completed treatments are non-refundable</li>
                                <li>Refund requests must be made within 30 days</li>
                                <li>Refunds are processed within 7-10 business days</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">6. Patient Responsibilities</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide accurate medical history and information</li>
                                <li>Disclose all medications and supplements</li>
                                <li>Follow pre- and post-treatment instructions</li>
                                <li>Inform us of any allergies or adverse reactions</li>
                                <li>Arrive on time for appointments</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">7. Limitation of Liability</h2>
                            <p>
                                Ayurvritta and its practitioners shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our liability is limited to the amount paid for the specific service in question.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">8. Intellectual Property</h2>
                            <p>
                                All content on this website, including text, images, logos, and tools, is the property of Ayurvritta Ayurveda Hospital and is protected by copyright laws. Unauthorized use is prohibited.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">9. Governing Law</h2>
                            <p>
                                These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Vadodara, Gujarat.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-ayur-green mb-4">10. Contact</h2>
                            <p>
                                For questions about these terms, contact us at:<br />
                                Email: care.ayurvritta@gmail.com<br />
                                Phone: +91 94266 84047
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
