
export interface TrainingRecord {
    Training_Year?: number;
    Training_Topic?: string;
    'Who organize'?: string;
}

export interface RawDataItem {
    Farmer_ID?: string;
    Full_Name?: string;
    Gender?: string;
    Gender_VI?: string;
    Gender_EN?: string;
    Ethnicity?: string;
    Ethnicity_VI?: string;
    Ethnicity_EN?: string;
    Village_ID?: string;
    Village_Name?: string;
    Village_Name_VI?: string;
    Village_Name_EN?: string;
    Plot_Id?: string;
    Plot_Name?: string;
    'Area (ha)'?: number | string;
    Year?: number | string;
    Record_Id?: string;
    'Farm registered for support from'?: string;
    Shade_Trees_Species_Names?: string;
    Shade_Trees_Species?: string;
    Number_Shade_Trees_Planted?: number | string;
    Shade_Trees_Died?: number | string;
    Soil_Test_Support?: string;
    Annual_Volume_Cherry?: number | string;
    TrainingHistory?: TrainingRecord[];
    Status?: string;
    Activity?: string;
}

export interface Species {
    Species_ID: string;
    Species_name: string;
    'Species type': string;
    Species_images: string;
}

export interface AdminDataItem {
    Adm_ID: string;
    'Label VN': string;
    'Label EN': string;
}

export interface Kpi {
    totalFarmers: number;
    totalPlots: number;
    totalArea: string;
    totalPlantedTrees: number;
    totalSpecies: number;
    totalVillages: number;
    totalSoilTests: number;
}
