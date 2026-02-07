// import React from 'react';
// import './pages/style.css';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import PachangamForm from './pages/PachangamForm';
// import PanchakaMuhurth from './pages/PanchakaMuhurth';
// import Combine from './pages/Combine';
// import Navbar from './components/Navbar';

// function App() {
//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//       <Route path="/" element={<PachangamForm />} />
//       <Route path="/panchaka" element={<PanchakaMuhurth />} />
//       <Route path="/combine" element={<Combine />} />
//         {/* Add more routes here if needed */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import './pages/style.css';
import './pages/PanchakaMuhurth.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PachangamForm from './pages/PachangamForm';
import PanchakaMuhurth from './pages/PanchakaMuhurth';
import Combine from './pages/Combine';
import Navbar from './components/Navbar';
import AdminLogs from './pages/AdminLogs';
import PlanetaryPage from './pages/PlanetaryPage';
import ChartsPage from './pages/ChartsPage';
import DashaPage from './pages/DashaPage';
import AstronomicalPage from './pages/AstronomicalPage';
import LagnaPage from './pages/LagnaPage';
import HoraPage from './pages/HoraPage';
import SadeSatiPage from './pages/SadeSatiPage';
import DailyPanchang from './pages/DailyPanchang';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<PachangamForm />} />
          <Route path="/panchaka" element={<PanchakaMuhurth />} />
          <Route path="/panchang" element={<DailyPanchang />} />
          <Route path="/planetary" element={<PlanetaryPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/dasha" element={<DashaPage />} />
          <Route path="/sadesati" element={<SadeSatiPage />} />
          {/* <Route path="/astronomical" element={<AstronomicalPage />} /> */}
          <Route path="/lagna" element={<LagnaPage />} />
          <Route path="/hora" element={<HoraPage />} />
          <Route path="/combine" element={<Combine />} />
          <Route path="/admin" element={<AdminLogs />} />
          {/* Add more routes here if needed */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
