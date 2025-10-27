
import React, { useState, useMemo, useCallback } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { translations } from './constants';
import { Kpi, RawDataItem } from './types';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import FilterBar from './components/FilterBar';
import ActionButtons from './components/ActionButtons';
import ChartCard from './components/ChartCard';
import TableCard from './components/TableCard';
import TrainingModal from './components/TrainingModal';
// fix: Removed DoughnutChart from import as it is not an exported member of recharts. A doughnut chart can be created using PieChart with innerRadius.
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CHART_COLORS = ['#388E3C', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#F57C00'];

const App: React.FC = () => {
    const {
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
    } = useDashboardData();

    const [selectedFarmer, setSelectedFarmer] = useState<RawDataItem | null>(null);

    const t = useMemo(() => translations[language], [language]);

    const chartData = useMemo(() => {
        const uniqueFarmers = [...new Map(filteredData.map(item => [item.Farmer_ID, item])).values()];
        const uniquePlots = [...new Map(filteredData.map(item => [item.Plot_Id, item])).values()];
        const yearlyData = filteredData.filter(i => i.Record_Id);

        const ethnicityKey = language === 'vi' ? 'Ethnicity_VI' : 'Ethnicity_EN';
        const ethnicityCount = uniqueFarmers.reduce((acc, i) => {
            const ethnicity = i[ethnicityKey] || i.Ethnicity || 'N/A';
            acc[ethnicity] = (acc[ethnicity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const areaByVillage = uniquePlots.reduce((acc, i) => {
            const villageName = (language === 'vi' ? i.Village_Name_VI : i.Village_Name_EN) || i.Village_Name;
            if (villageName) {
                acc[villageName] = (acc[villageName] || 0) + (Number(i['Area (ha)']) || 0);
            }
            return acc;
        }, {} as Record<string, number>);

        const treesBySpeciesYearly = yearlyData.reduce((acc, item) => {
            if (item.Shade_Trees_Species_Names && Number(item.Number_Shade_Trees_Planted) > 0) {
                const speciesList = item.Shade_Trees_Species_Names.split(/[,;]/g).map(s => s.trim()).filter(Boolean);
                const treesPerSpecies = (Number(item.Number_Shade_Trees_Planted) || 0) / (speciesList.length || 1);
                speciesList.forEach(name => acc[name] = (acc[name] || 0) + treesPerSpecies);
            }
            return acc;
        }, {} as Record<string, number>);

        return {
            ethnicity: Object.entries(ethnicityCount).map(([name, value]) => ({ name, value })),
            areaByVillage: Object.entries(areaByVillage).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })),
            treesBySpecies: Object.entries(treesBySpeciesYearly).map(([name, value]) => ({ name, value: Math.round(value) })),
        };
    }, [filteredData, language]);

    const handleViewTraining = useCallback((farmer: RawDataItem) => {
        setSelectedFarmer(farmer);
    }, []);

    const kpiConfig: { key: keyof Kpi; label: keyof typeof t }[] = [
        { key: 'totalFarmers', label: 'totalFarmersLabel' },
        { key: 'totalPlots', label: 'totalPlotsLabel' },
        { key: 'totalArea', label: 'totalAreaLabel' },
        { key: 'totalPlantedTrees', label: 'totalPlantedTreesLabel' },
        { key: 'totalSpecies', label: 'totalSpeciesLabel' },
        { key: 'totalVillages', label: 'totalVillagesLabel' },
        { key: 'totalSoilTests', label: 'totalSoilTestsLabel' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                    <div className="flex items-center space-x-3">
                        <div className="spinner-border text-green-600 w-8 h-8 border-4 rounded-full animate-spin border-t-transparent"></div>
                        <span className="text-lg text-green-700 font-semibold">{t.loadingData || 'Đang tải dữ liệu...'}</span>
                    </div>
                </div>
            )}
            <Header projectTitle={t.projectTitle} language={language} onLanguageToggle={handleLanguageToggle} />
            <main className="container mx-auto p-2 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4 mb-4">
                    {kpiConfig.map(({ key, label }) => (
                        <KpiCard key={key} title={t[label]} value={kpis[key]} />
                    ))}
                </div>

                <FilterBar
                    title={t.filterTitle}
                    filters={filters}
                    options={filterOptions}
                    onFilterChange={handleFilterChange}
                    language={language}
                    translations={t}
                />

                <ActionButtons onReset={handleResetFilters} onRefresh={handleRefresh} onExport={handleExportExcel} t={t} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                   <ChartCard title={t.areaByVillageChartTitle}>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={chartData.areaByVillage} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#388E3C" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title={t.ethnicityRatioChartTitle}>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                {/* fix: Added nullish coalescing operator to handle cases where percent might be null or undefined, preventing a type error. */}
                                <Pie data={chartData.ethnicity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {chartData.ethnicity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title={t.speciesTreeChartTitle}>
                        <ResponsiveContainer width="100%" height={320}>
                             <PieChart>
                                <Pie data={chartData.treesBySpecies} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} label>
                                    {chartData.treesBySpecies.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{fontSize: "12px", overflowY: "auto", maxHeight: 300 }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
                 
                <TableCard
                    title={t.farmersTableTitle}
                    headers={['th_TT', 'th_Actions', 'th_Farmer_ID', 'th_Full_Name', 'th_Gender', 'th_Ethnicity', 'th_Village_Name']}
                    data={[...new Map(filteredData.map(i => [i.Farmer_ID, i])).values()]}
                    fields={['Farmer_ID', 'Full_Name', `Gender${language === 'vi' ? '_VI' : '_EN'}` , `Ethnicity${language === 'vi' ? '_VI' : '_EN'}`, `Village_Name${language === 'vi' ? '_VI' : '_EN'}`]}
                    t={t}
                    onActionClick={handleViewTraining}
                />
                
                <TableCard
                    title={t.plotsTableTitle}
                    headers={['th_TT', 'th_Plot_Id', 'th_Plot_Name', 'th_Farmer_ID', 'th_Area (ha)']}
                    data={[...new Map(filteredData.filter(i => i.Plot_Id).map(i => [i.Plot_Id, i])).values()]}
                    fields={['Plot_Id', 'Plot_Name', 'Farmer_ID', 'Area (ha)']}
                    t={t}
                />

                <TableCard
                    title={t.yearlyTableTitle}
                    headers={['th_TT', 'th_Farmer_ID', 'th_Year', 'th_Annual_Volume_Cherry', 'th_Number_Shade_Trees_Planted', 'th_Shade_Trees_Species', 'th_Shade_Trees_Died', 'th_Soil_Test_Support']}
                    data={[...new Map(filteredData.filter(i => i.Record_Id).map(i => [i.Record_Id, i])).values()]}
                    fields={['Farmer_ID', 'Year', 'Annual_Volume_Cherry', 'Number_Shade_Trees_Planted', 'Shade_Trees_Species_Names', 'Shade_Trees_Died', 'Soil_Test_Support']}
                    t={t}
                />

                <TableCard
                    title={t.speciesTableTitle}
                    headers={['th_TT', 'th_Species_ID', 'th_Species_Name', 'th_Species_Type', 'th_Species_Images']}
                    data={speciesData}
                    fields={['Species_ID', 'Species_name', 'Species type', 'Species_images']}
                    t={t}
                    isSpeciesTable={true}
                />
            </main>

            {selectedFarmer && (
                <TrainingModal
                    farmer={selectedFarmer}
                    onClose={() => setSelectedFarmer(null)}
                    t={t}
                    language={language}
                />
            )}
        </div>
    );
};

export default App;
