
import React from 'react';
import type { RawDataItem, Species } from '../types';

interface TableCardProps {
    title: string;
    headers: string[];
    data: any[];
    fields: string[];
    t: Record<string, string>;
    onActionClick?: (item: any) => void;
    isSpeciesTable?: boolean;
}

const TableCard: React.FC<TableCardProps> = ({ title, headers, data, fields, t, onActionClick, isSpeciesTable = false }) => {
    const getFieldValue = (item: any, field: string) => {
        const langField = field.replace(/(_VI|_EN)$/, '');
        return item[field] ?? item[langField] ?? '';
    };

    return (
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <div className="bg-green-600 text-white p-3 font-bold">{title}</div>
            <div className="overflow-x-auto max-h-80">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-100 sticky top-0">
                        <tr>
                            {headers.map(h => <th key={h} className="px-4 py-3">{t[h] || h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {data.map((item, index) => (
                            <tr key={item.Farmer_ID || item.Plot_Id || item.Record_Id || item.Species_ID || index} className="border-b hover:bg-green-50">
                                <td className="px-4 py-2">{index + 1}</td>
                                {onActionClick && (
                                    <td className="px-4 py-2">
                                        <button onClick={() => onActionClick(item)} className="text-blue-600 hover:text-blue-800">
                                            👁️
                                        </button>
                                    </td>
                                )}
                                {fields.map(field => (
                                    <td key={field} className="px-4 py-2 whitespace-nowrap">
                                        {isSpeciesTable && field === 'Species_images' ? (
                                            <img src={item[field]} alt={item.Species_name} className="h-12 w-12 object-cover rounded" />
                                        ) : (
                                            getFieldValue(item, field)
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableCard;
