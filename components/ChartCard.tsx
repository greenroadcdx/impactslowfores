
import React from 'react';

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-600 text-white p-3 font-bold text-center">
                {title}
            </div>
            <div className="p-2 h-[330px]">
                {children}
            </div>
        </div>
    );
};

export default ChartCard;
