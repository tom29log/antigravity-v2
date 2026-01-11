import { BrowserRouter as Router } from 'react-router-dom';
import { EstimationProvider } from './contexts/EstimationContext';
import AnimatedRoutes from './components/AnimatedRoutes';

function App() {
    return (
        <EstimationProvider>
            <Router>
                <AnimatedRoutes />
            </Router>
        </EstimationProvider>
    );
}

export default App;
