
import React from 'react';
import type { RawDataItem } from '../types';

interface TrainingModalProps {
    farmer: RawDataItem;
    onClose: () => void;
    t: Record<string, string>;
    language: 'vi' | 'en';
}

const TrainingModal: React.FC<TrainingModalProps> = ({ farmer, onClose, t, language }) => {
    const trainingHistory = farmer.TrainingHistory || [];

    const headers = language === 'vi' 
        ? ['Năm', 'Chủ đề', 'Đơn vị']
        : ['Year', 'Topic', 'Organizer'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-green-700 text-white p-4 rounded-t-lg">
                    <h2 className="text-xl font-bold">{t.trainingModalTitle} {farmer.Full_Name}</h2>
                </div>
                <div className="p-6 overflow-y-auto">
                    {trainingHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-left">{headers[0]}</th>
                                        <th className="p-2 text-left">{headers[1]}</th>
                                        <th className="p-2 text-left">{headers[2]}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trainingHistory.map((record, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2">{record.Training_Year || ''}</td>
                                            <td className="p-2">{record.Training_Topic || ''}</td>
                                            <td className="p-2">{record['Who organize'] || ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>{t.noTrainingData}</p>
                    )}
                </div>
                <div className="p-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        {t.modalCloseButton}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrainingModal;
