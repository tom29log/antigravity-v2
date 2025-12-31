import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EstimationProvider } from './contexts/EstimationContext';
import StartPage from './pages/StartPage';
import ServiceTypePage from './pages/ServiceTypePage';
import DetailsPage from './pages/DetailsPage';
import StylePage from './pages/StylePage';
import MaterialPage from './pages/MaterialPage';
import SummaryPage from './pages/SummaryPage';
import InquiryPage from './pages/InquiryPage';
import StoryPage from './pages/StoryPage';
import PortfolioPage from './pages/PortfolioPage';

function App() {
    return (
        <EstimationProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<StartPage />} />
                    <Route path="/type" element={<ServiceTypePage />} />
                    <Route path="/details" element={<DetailsPage />} />
                    <Route path="/style" element={<StylePage />} />
                    <Route path="/materials" element={<MaterialPage />} />
                    <Route path="/summary" element={<SummaryPage />} />
                    <Route path="/inquiry" element={<InquiryPage />} />
                    <Route path="/story" element={<StoryPage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                </Routes>
            </Router>
        </EstimationProvider>
    );
}

export default App;
