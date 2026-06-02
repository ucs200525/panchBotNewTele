import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BharagavaPanchagam from './pages/BharagavaPanchagam';
import PanchakaMuhurth from './pages/PanchakaMuhurth';
import SwissPanchaka from './pages/SwissPanchaka';
import Combine from './pages/Combine';
import Navbar from './components/Navbar';
import ProfilePrompt from './components/ProfilePrompt';
import PlanetaryPage from './pages/PlanetaryPage';
import ChartsPage from './pages/ChartsPage';
import DashaPage from './pages/DashaPage';
import AstronomicalPage from './pages/AstronomicalPage';
import LagnaPage from './pages/LagnaPage';
import HoraPage from './pages/HoraPage';
import SadeSatiPage from './pages/SadeSatiPage';
import DailyPanchang from './pages/DailyPanchang';
import SwissPanchang from './pages/SwissPanchang';
import GoodTimingsPage from './pages/GoodTimingsPage';
import ChoghadiyaInfo from './pages/ChoghadiyaInfo';
import PersonalizedAdvisor from './pages/PersonalizedAdvisor';
import AstroChat from './pages/AstroChat';
import Auth from './pages/Auth';
import BirthProfilesPage from './pages/BirthProfilesPage';
import { BirthProfileProvider } from './context/BirthProfileContext';
import Footer from './components/Footer';

function App() {
  return (
    <BirthProfileProvider>
      <BrowserRouter>
        <Navbar />
        <ProfilePrompt />
        <div className="app-container">

          <Routes>
            <Route path="/" element={<BharagavaPanchagam />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/profiles" element={<BirthProfilesPage />} />
            <Route path="/panchaka" element={<PanchakaMuhurth />} />

            <Route path="/panchaka-swiss" element={<SwissPanchaka />} />
            <Route path="/panchang" element={<DailyPanchang />} />
            {/* <Route path="/panchang-swiss" element={<SwissPanchang />} /> */}
            <Route path="/good-timings" element={<GoodTimingsPage />} />
            <Route path="/planetary" element={<PlanetaryPage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/dasha" element={<DashaPage />} />
            <Route path="/sadesati" element={<SadeSatiPage />} />
            {/* <Route path="/astronomical" element={<AstronomicalPage />} /> */}
            <Route path="/lagna" element={<LagnaPage />} />
            <Route path="/hora" element={<HoraPage />} />
            <Route path="/combine" element={<Combine />} />
            <Route path="/choghadiya-info" element={<ChoghadiyaInfo />} />
            <Route path="/advisor" element={<PersonalizedAdvisor />} />
            <Route path="/chat" element={<AstroChat />} />
            {/* Add more routes here if needed */}
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </BirthProfileProvider>
  );
}

export default App;
