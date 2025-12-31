import { createContext, useContext, useState } from 'react';

const EstimationContext = createContext();

export const useEstimation = () => useContext(EstimationContext);

export const EstimationProvider = ({ children }) => {
    const [serviceType, setServiceType] = useState(null); // 'commercial' | 'residential'
    const [details, setDetails] = useState({});
    const [style, setStyle] = useState(null);
    const [styleImageIndex, setStyleImageIndex] = useState(null); // Selected reference image index
    const [materials, setMaterials] = useState({
        floor: 'maru', // default
        wall: 'wallpaper_paper',
        ceiling: 'finished',
        bath: false,
        kitchen: 'modern'
    });
    const [estimate, setEstimate] = useState({ standard: 0, premium: 0 }); // Dual estimate
    const [selectedPlan, setSelectedPlan] = useState(null); // 'standard' | 'premium'

    const value = {
        serviceType,
        setServiceType,
        details,
        setDetails,
        style,
        setStyle,
        styleImageIndex,
        setStyleImageIndex,
        materials,
        setMaterials,
        estimate,
        setEstimate,
        selectedPlan,
        setSelectedPlan
    };


    return (
        <EstimationContext.Provider value={value}>
            {children}
        </EstimationContext.Provider>
    );
};
