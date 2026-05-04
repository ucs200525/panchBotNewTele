import React from 'react';
import './pages/style.css';
import './pages/PanchakaMuhurth.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PachangamForm from './pages/PachangamForm';
import PanchakaMuhurth from './pages/PanchakaMuhurth';
import Combine from './pages/Combine';
import Navbar from './components/Navbar';
import AdminLogs from './pages/AdminLogs';

import PanchakaSwiss from './pages/PanchakaSwiss';
import CombineSwiss from './pages/CombineSwiss';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<PachangamForm />} />
        <Route path="/panchaka" element={<PanchakaMuhurth />} />
        <Route path="/panchaka-swiss" element={<PanchakaSwiss />} />
        <Route path="/combine" element={<Combine />} />
        <Route path="/combine-swiss" element={<CombineSwiss />} />

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
