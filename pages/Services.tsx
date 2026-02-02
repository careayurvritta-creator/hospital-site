import React from 'react';
import { SERVICES } from '../constants';
import { NavLink } from '../components/Layout';
import { ArrowRight, Bed, UserCheck } from 'lucide-react';

const Services: React.FC = () => {
   const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

   return (
      <div className="bg-ayur-cream min-h-screen pb-24 md:pb-20">

         {/* Header - Reduced padding on mobile */}
         <div className="bg-ayur-green py-16 md:py-32 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
            <div className="max-w-4xl mx-auto px-4 relative z-10">
               <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 md:mb-6">Treatments & Therapies</h1>
               <p className="text-base md:text-xl text-ayur-cream/80 max-w-2xl mx-auto">
                  Holistic healing protocols tailored to your unique Prakriti.
               </p>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-20 relative z-20">

            {/* Mobile: Horizontal scroll cards */}
            <div className="md:hidden scroll-snap-x pb-4">
               {SERVICES.map((service) => (
                  <div key={service.id} className="w-[85vw] flex-shrink-0 bg-white rounded-2xl shadow-lg border border-ayur-subtle overflow-hidden">
                     <div className="h-40 bg-ayur-green/10 relative overflow-hidden">
                        <img
                           src={service.image}
                           alt={service.title}
                           className="w-full h-full object-cover"
                           loading="lazy"
                           onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                        />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full p-2 text-ayur-green shadow-md">
                           <service.icon size={18} />
                        </div>
                     </div>
                     <div className="p-4">
                        <h3 className="font-serif text-lg font-bold text-ayur-green mb-2">{service.title}</h3>
                        <p className="text-ayur-gray text-sm leading-relaxed mb-4 line-clamp-2">{service.description}</p>
                        <NavLink
                           to={`/services/${service.id}`}
                           className="w-full inline-flex justify-center items-center bg-ayur-green text-white font-bold py-3 rounded-xl min-h-[48px] active:scale-95 transition-transform"
                        >
                           View Details <ArrowRight size={16} className="ml-2" />
                        </NavLink>
                     </div>
                  </div>
               ))}
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
               {SERVICES.map((service) => (
                  <div key={service.id} className="bg-white rounded-2xl shadow-lg border border-ayur-subtle overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                     <div className="h-56 bg-ayur-green/10 relative overflow-hidden">
                        <img
                           src={service.image}
                           alt={service.title}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                           loading="lazy"
                           onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                        />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-full p-3 text-ayur-green shadow-md">
                           <service.icon size={22} />
                        </div>
                     </div>

                     <div className="p-8 flex-grow flex flex-col">
                        <div className="mb-4 flex flex-wrap gap-2">
                           {service.tags.map(tag => (
                              <span key={tag} className="inline-block bg-ayur-cream text-ayur-green text-xs font-bold px-3 py-1 rounded-full border border-ayur-subtle">
                                 {tag}
                              </span>
                           ))}
                        </div>

                        <h3 className="font-serif text-2xl font-bold text-ayur-green mb-3 group-hover:text-ayur-gold transition-colors">{service.title}</h3>
                        <p className="text-ayur-gray text-sm leading-relaxed mb-6 flex-grow line-clamp-3">{service.description}</p>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                           {service.subServices && (
                              <p className="text-xs text-ayur-gold font-bold mb-4 uppercase tracking-widest">
                                 Includes {service.subServices.length} Therapies
                              </p>
                           )}
                           <NavLink
                              to={`/services/${service.id}`}
                              className="w-full inline-flex justify-center items-center bg-transparent border-2 border-ayur-green text-ayur-green hover:bg-ayur-green hover:text-white font-bold py-3 rounded-lg transition-all min-h-[48px]"
                           >
                              View Treatments & Pricing <ArrowRight size={16} className="ml-2" />
                           </NavLink>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* General Charges Section */}
            <div className="mt-16 md:mt-20">
               <div className="text-center mb-8 md:mb-10">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-ayur-green">General Hospital Charges</h2>
                  <p className="text-ayur-gray mt-2 text-sm md:text-base">Standard rates for accommodation and consultation.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                  {/* Room Charges */}
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-ayur-subtle shadow-sm flex items-start gap-4">
                     <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0">
                        <Bed size={24} />
                     </div>
                     <div className="flex-1">
                        <h3 className="font-bold text-ayur-green text-base md:text-lg mb-4">Room & Visit Charges</h3>
                        <ul className="space-y-3">
                           <li className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                              <span className="text-gray-600">General Ward</span>
                              <span className="font-bold text-ayur-green">₹1000 / Day</span>
                           </li>
                           <li className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Doctor Visit</span>
                              <span className="font-bold text-ayur-green">₹500 / Day</span>
                           </li>
                        </ul>
                     </div>
                  </div>

                  {/* Consultation Charges */}
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-ayur-subtle shadow-sm flex items-start gap-4">
                     <div className="bg-green-50 p-3 rounded-xl text-green-600 shrink-0">
                        <UserCheck size={24} />
                     </div>
                     <div className="flex-1">
                        <h3 className="font-bold text-ayur-green text-base md:text-lg mb-4">Consultation Charges</h3>
                        <ul className="space-y-3">
                           <li className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                              <span className="text-gray-600">New Case</span>
                              <span className="font-bold text-ayur-green">₹500</span>
                           </li>
                           <li className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Follow-up</span>
                              <span className="font-bold text-ayur-green">₹300</span>
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};

export default Services;