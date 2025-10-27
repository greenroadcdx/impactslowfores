
import { useState, useEffect, useCallback, useMemo } from 'react';
import { API_URL } from '../constants';
import type { RawDataItem, Species, AdminDataItem, Kpi } from '../types';

// fix: Declare XLSX as a global constant to inform TypeScript that it exists, resolving 'Cannot find name' errors. This is for the SheetJS library loaded via a script tag.
declare const XLSX: any;

const INITIAL_FILTERS = {
    Year: '',
    project: '',
    Village_ID: '',
    Farmer_ID: '',
    support: '',
    species: '',
};

export const useDashboardData = () => {
    const [loading, setLoading] = useState(true);
    const [allData, setAllData] = useState<RawDataItem[]>([]);
    const [speciesData, setSpeciesData] = useState<Species[]>([]);
    const [adminData, setAdminData] = useState<AdminDataItem[]>([]);
    const [language, setLanguage] = useState<'vi' | 'en'>('vi');
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
            const data = await response.json();
            if (data.error) throw new Error(`API Error: ${data.error}`);

            setAllData(data.combinedData || []);
            setSpeciesData(data.speciesList || []);
            setAdminData(data.adminData || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            alert(`Could not load data: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = useCallback((filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    }, []);

    const handleLanguageToggle = useCallback(() => {
        setLanguage(prev => (prev === 'vi' ? 'en' : 'vi'));
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);
    
    const handleRefresh = useCallback(() => {
        handleResetFilters();
        fetchData();
    }, [fetchData, handleResetFilters]);

    const filteredData = useMemo(() => {
        return allData.filter(item => {
            if (filters.project === 'SLOW' && !(item.Farmer_ID || '').startsWith('SL')) return false;
            if (filters.project === 'WWF' && !(item.Farmer_ID || '').startsWith('WF')) return false;
            if (filters.Year && String(item.Year) !== filters.Year) return false;
            if (filters.Village_ID && item.Village_ID !== filters.Village_ID) return false;
            if (filters.Farmer_ID && item.Farmer_ID !== filters.Farmer_ID) return false;
            if (filters.support && item['Farm registered for support from'] !== filters.support) return false;
            if (filters.species && !(item.Shade_Trees_Species_Names && item.Shade_Trees_Species_Names.includes(filters.species))) return false;
            return true;
        });
    }, [allData, filters]);

    const kpis = useMemo<Kpi>(() => {
        const activeFarmerIds = new Set(
            allData
                .filter(item => item.Status === 'Act')
                .map(item => item.Farmer_ID)
                .filter(Boolean)
        );

        const activePlots = [...new Map(
            allData
                .filter(item => item.Plot_Id && activeFarmerIds.has(item.Farmer_ID))
                .map(item => [item.Plot_Id, item])
        ).values()];

        const activeYearlyData = allData.filter(item => item.Record_Id && activeFarmerIds.has(item.Farmer_ID));

        const totalArea = activePlots.reduce((sum, plot) => sum + (Number(plot['Area (ha)']) || 0), 0);
        const totalPlantedTrees = activeYearlyData.reduce((sum, item) => sum + (Number(item.Number_Shade_Trees_Planted) || 0), 0);
        
        const speciesSet = new Set<string>();
        activeYearlyData.forEach(item => {
            const speciesStr = item.Shade_Trees_Species_Names || item.Shade_Trees_Species;
            if (speciesStr) {
                String(speciesStr).split(/[,;]/g).map(s => s.trim()).filter(s => s).forEach(s => speciesSet.add(s));
            }
        });

        const totalSoilTests = allData.filter(farmer => farmer.Status === 'Act' && (farmer.Activity || '').trim().toLowerCase() === 'done').length;
        const totalVillages = new Set(filteredData.map(i => i.Village_Name).filter(Boolean)).size;

        return {
            totalFarmers: activeFarmerIds.size,
            totalPlots: activePlots.length,
            totalArea: totalArea.toFixed(2),
            totalPlantedTrees,
            totalSpecies: speciesSet.size,
            totalVillages: totalVillages,
            totalSoilTests,
        };
    }, [allData, filteredData]);
    
    const handleExportExcel = useCallback(() => {
        if (typeof XLSX === 'undefined') {
            alert('Excel library not loaded.');
            return;
        }
        
        const farmersData = [...new Map(filteredData.map(i => [i.Farmer_ID, i])).values()];
        const plotsData = [...new Map(filteredData.filter(i => i.Plot_Id).map(i => [i.Plot_Id, i])).values()];
        const yearlyData = [...new Map(filteredData.filter(i => i.Record_Id).map(i => [i.Record_Id, i])).values()];
        
        const wb = XLSX.utils.book_new();
        const wsFarmers = XLSX.utils.json_to_sheet(farmersData);
        const wsPlots = XLSX.utils.json_to_sheet(plotsData);
        const wsYearly = XLSX.utils.json_to_sheet(yearlyData);
        const wsSpecies = XLSX.utils.json_to_sheet(speciesData);

        XLSX.utils.book_append_sheet(wb, wsFarmers, "Farmers");
        XLSX.utils.book_append_sheet(wb, wsPlots, "Plots");
        XLSX.utils.book_append_sheet(wb, wsYearly, "Yearly Data");
        XLSX.utils.book_append_sheet(wb, wsSpecies, "Species");

        XLSX.writeFile(wb, "PFFP_Dashboard_Report.xlsx");
    }, [filteredData, speciesData]);

    const filterOptions = useMemo(() => {
        const unique = <T, K extends keyof T>(data: T[], key: K) => [...new Map(data.map(item => [item[key], item])).values()];
        
        const allSpecies = new Set<string>();
        allData.forEach(item => {
            if (item.Shade_Trees_Species_Names) {
                item.Shade_Trees_Species_Names.split(/[,;]/g).forEach(s => s.trim() && allSpecies.add(s.trim()));
            }
        });

        return {
            Year: unique(allData.filter(i => i.Year), 'Year').map(i => ({ value: String(i.Year), label: String(i.Year) })).sort((a,b) => b.label.localeCompare(a.label)),
            Village_ID: adminData.filter(i => i.Adm_ID?.startsWith('VIL')).map(i => ({ value: i.Adm_ID, label: language === 'vi' ? i['Label VN'] : i['Label EN']})),
            Farmer_ID: unique(allData.filter(i => i.Farmer_ID), 'Farmer_ID').map(i => ({ value: i.Farmer_ID!, label: `${i.Full_Name} (${i.Farmer_ID})` })),
            support: unique(allData.filter(i => i['Farm registered for support from']), 'Farm registered for support from').map(i => ({ value: i['Farm registered for support from']!, label: i['Farm registered for support from']! })),
            species: [...allSpecies].sort().map(s => ({ value: s, label: s })),
        };
    }, [allData, adminData, language]);

    return {
        loading,
        kpis,
        filteredData,
        speciesData,
        filterOptions,
        filters,
        language,
        handleFilterChange,
        handleLanguageToggle,
        handleResetFilters,
        handleRefresh,
        handleExportExcel
    };
};
