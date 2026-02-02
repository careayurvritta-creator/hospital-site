/**
 * Date and Time Picker for Booking
 * Allows selection of date and time slots with availability logic
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
    onSelect: (date: Date, time: string) => void;
    selectedDate?: Date;
    selectedTime?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ onSelect, selectedDate, selectedTime }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Generate dates for current month view
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        // Adjust for Monday start if needed (here using Sunday start)
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const isDateDisabled = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isDateSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear()
        );
    };

    // Time slots generation
    const TIME_SLOTS = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
        "11:00 AM", "11:30 AM", "04:00 PM", "04:30 PM",
        "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
        "07:00 PM", "07:30 PM"
    ];

    return (
        <div className="bg-white rounded-xl border border-ayur-subtle overflow-hidden">
            {/* Date Selection */}
            <div className="p-4 border-b border-ayur-subtle">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-ayur-green font-bold">
                        <Calendar size={18} />
                        <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-ayur-cream rounded-full">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-ayur-cream rounded-full">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-xs text-ayur-gray/60 font-medium">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const disabled = isDateDisabled(day);
                        const selected = isDateSelected(day);

                        return (
                            <button
                                key={day}
                                disabled={disabled}
                                onClick={() => {
                                    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                    onSelect(newDate, selectedTime || '');
                                }}
                                className={`
                  h-8 w-8 rounded-full text-sm flex items-center justify-center transition-all
                  ${selected ? 'bg-ayur-green text-white font-bold shadow-md' : ''}
                  ${!selected && !disabled ? 'hover:bg-ayur-cream text-ayur-green' : ''}
                  ${disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                `}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Selection */}
            <div className="p-4 bg-gray-50/50">
                <div className="flex items-center gap-2 text-ayur-green font-bold mb-3">
                    <Clock size={16} />
                    <span className="text-sm">Available Slots</span>
                </div>

                {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map(slot => (
                            <button
                                key={slot}
                                onClick={() => onSelect(selectedDate, slot)}
                                className={`
                  px-2 py-1.5 rounded-lg text-xs font-medium border transition-all
                  ${selectedTime === slot
                                        ? 'bg-ayur-accent text-white border-ayur-accent shadow-sm'
                                        : 'bg-white border-ayur-subtle text-ayur-gray hover:border-ayur-accent hover:text-ayur-accent'}
                `}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-center text-gray-400 py-4">Please select a date first</p>
                )}
            </div>
        </div>
    );
};

export default DateTimePicker;
