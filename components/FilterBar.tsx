
import React from 'react';

interface Option {
    value: string;
    label: string;
}

interface FilterBarProps {
    title: string;
    filters: Record<string, string>;
    options: Record<string, Option[]>;
    onFilterChange: (name: string, value: string) => void;
    language: 'vi' | 'en';
    translations: Record<string, string>;
}

const FilterSelect: React.FC<{
    id: string;
    label: string;
    value: string;
    options: Option[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    allOptionLabel: string;
}> = ({ id, label, value, options, onChange, allOptionLabel }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        >
            <option value="">{allOptionLabel}</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);


const FilterBar: React.FC<FilterBarProps> = ({ title, filters, options, onFilterChange, translations }) => {

    const filterConfig = [
        { id: 'Year', label: translations.yearLabel },
        { id: 'project', label: translations.projectLabel, isProject: true },
        { id: 'Village_ID', label: translations.villageLabel },
        { id: 'Farmer_ID', label: translations.farmerLabel },
        { id: 'support', label: translations.supportLabel },
        { id: 'species', label: translations.speciesLabel },
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {filterConfig.map(f => {
                    if (f.isProject) {
                        return <div key={f.id}>
                                <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                                <select id="project-filter" name="project" value={filters.project} onChange={(e) => onFilterChange('project', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm">
                                    <option value="">{translations.allOption}</option>
                                    <option value="SLOW">{translations.projectOptionSlow}</option>
                                    <option value="WWF">{translations.projectOptionWwf}</option>
                                </select>
                            </div>
                    }
                    return <FilterSelect
                        key={f.id}
                        id={`${f.id}-filter`}
                        label={f.label}
                        value={filters[f.id]}
                        options={options[f.id] || []}
                        onChange={(e) => onFilterChange(f.id, e.target.value)}
                        allOptionLabel={translations.allOption}
                    />
                })}
            </div>
        </div>
    );
};

export default FilterBar;
