
import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => {
    return (
        <div className="bg-green-800 text-white rounded-lg shadow-lg p-3 text-center transition-transform transform hover:scale-105">
            <div className="text-2xl font-bold text-yellow-300">
                {value}
            </div>
            <div className="text-xs sm:text-sm text-green-100 mt-1">
                {title}
            </div>
        </div>
    );
};

export default KpiCard;
