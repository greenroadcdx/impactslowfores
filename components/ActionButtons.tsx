
import React from 'react';

interface ActionButtonsProps {
    onReset: () => void;
    onRefresh: () => void;
    onExport: () => void;
    t: Record<string, string>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onReset, onRefresh, onExport, t }) => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-4">
            <button onClick={onReset} className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition-colors text-sm sm:text-base">{t.resetButton}</button>
            <button onClick={onRefresh} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors text-sm sm:text-base">{t.refreshButton}</button>
            <button onClick={onExport} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors text-sm sm:text-base">{t.exportExcelBtn}</button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition-colors text-sm sm:text-base">{t.printButton}</button>
            <button onClick={() => window.close()} className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors text-sm sm:text-base">{t.exitButton}</button>
        </div>
    );
};

export default ActionButtons;
