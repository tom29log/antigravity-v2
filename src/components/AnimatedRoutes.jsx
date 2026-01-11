import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import StartPage from '../pages/StartPage';
import ServiceTypePage from '../pages/ServiceTypePage';
import DetailsPage from '../pages/DetailsPage';
import StylePage from '../pages/StylePage';
import MaterialPage from '../pages/MaterialPage';
import SummaryPage from '../pages/SummaryPage';
import InquiryPage from '../pages/InquiryPage';
import StoryPage from '../pages/StoryPage';
import PortfolioPage from '../pages/PortfolioPage';


const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }} // Subtlest zoom in from 99%
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}    // Fade out and slight zoom out
            transition={{
                duration: 0.3,              // Slightly longer for smoothness
                ease: [0.22, 1, 0.36, 1]    // Cubic bezier for "premium" feel (easeOutQuint-ish)
            }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
        >
            {children}
        </motion.div>
    );
};

export default function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><StartPage /></PageTransition>} />
                <Route path="/type" element={<PageTransition><ServiceTypePage /></PageTransition>} />
                <Route path="/details" element={<PageTransition><DetailsPage /></PageTransition>} />
                <Route path="/style" element={<PageTransition><StylePage /></PageTransition>} />
                <Route path="/materials" element={<PageTransition><MaterialPage /></PageTransition>} />
                <Route path="/summary" element={<PageTransition><SummaryPage /></PageTransition>} />
                <Route path="/inquiry" element={<PageTransition><InquiryPage /></PageTransition>} />
                <Route path="/story" element={<PageTransition><StoryPage /></PageTransition>} />
                <Route path="/portfolio" element={<PageTransition><PortfolioPage /></PageTransition>} />

            </Routes>
        </AnimatePresence>
    );
}
