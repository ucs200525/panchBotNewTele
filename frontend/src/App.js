import React, { useEffect } from 'react';
import './pages/style.css';
import './pages/PanchakaMuhurth.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import PachangamForm from './pages/PachangamForm';
import PanchakaMuhurth from './pages/PanchakaMuhurth';
import Combine from './pages/Combine';
import Navbar from './components/Navbar';
import AdminLogs from './pages/AdminLogs';

import PanchakaSwiss from './pages/PanchakaSwiss';
import CombineSwiss from './pages/CombineSwiss';
import PanchangDetails from './pages/PanchangDetails';
import { trackPageView, getUserId } from './utils/analytics';

// Page tracker component that fires on every route change
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  // Initialize user ID on first load
  useEffect(() => {
    getUserId();
  }, []);

  return (
    <BrowserRouter>
      <PageTracker />
      <Navbar />
      <Routes>
        <Route path="/" element={<PachangamForm />} />
        {/* <Route path="/panchaka" element={<PanchakaMuhurth />} /> */}
        <Route path="/panchaka-swiss" element={<PanchakaSwiss />} />
        {/* <Route path="/combine" element={<Combine />} /> */}
        <Route path="/combine-swiss" element={<CombineSwiss />} />
        <Route path="/panchang-details" element={<PanchangDetails />} />

        {/* <Route path="/DownloadImage" element={<DownloadImage />} />
        <Route path="/drik-table-image" element={<DrikTableImage />} />
        <Route path="/bhargav-table-image" element={<BhargavTableImage />} /> */}
        <Route path="/admin" element={<AdminLogs />} />
        {/* Add more routes here if needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
