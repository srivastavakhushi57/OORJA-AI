import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataCenter } from './types';
import { getAllDataCenters, saveDataCenter } from './lib/storage';
import { Language } from './lib/i18n';
import { Navbar } from './components/Navigation/Navbar';
import { Footer } from './components/Navigation/Footer';
import { HomePage } from './pages/HomePage';
import { ExploreMapPage } from './pages/ExploreMapPage';
import { DataCenterDetailPage } from './pages/DataCenterDetailPage';
import { ComparePage } from './pages/ComparePage';
import { MethodologyPage } from './pages/MethodologyPage';
import { AboutPage } from './pages/AboutPage';
import { AddEditDataCenterModal } from './components/DataCenter/AddEditDataCenterModal';

export function App() {
  const [dataCenters, setDataCenters] = useState<DataCenter[]>(() => getAllDataCenters());
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('oorja_theme') === 'dark' ||
        (!('oorja_theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  // Add / Edit Modal Global State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialData, setAddModalInitialData] = useState<Partial<DataCenter> | undefined>(undefined);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('oorja_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('oorja_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleLanguage = () => setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));

  const handleOpenAddModal = (initialData?: Partial<DataCenter>) => {
    setAddModalInitialData(initialData);
    setIsAddModalOpen(true);
  };

  const handleSaveDataCenter = (savedDc: DataCenter) => {
    setDataCenters((prev) => {
      const idx = prev.findIndex((d) => d.id === savedDc.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedDc;
        return updated;
      }
      return [savedDc, ...prev];
    });
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <Navbar
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          language={language}
          onToggleLanguage={toggleLanguage}
          onOpenAddModal={() => handleOpenAddModal()}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  dataCenters={dataCenters}
                  onOpenAddModal={handleOpenAddModal}
                />
              }
            />
            <Route
              path="/explore"
              element={<ExploreMapPage dataCenters={dataCenters} />}
            />
            <Route
              path="/datacenter/:id"
              element={
                <DataCenterDetailPage
                  dataCenters={dataCenters}
                  onUpdateDataCenter={handleSaveDataCenter}
                />
              }
            />
            <Route
              path="/compare"
              element={<ComparePage dataCenters={dataCenters} />}
            />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Global Add Data Center Modal */}
        <AddEditDataCenterModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setAddModalInitialData(undefined);
          }}
          initialData={addModalInitialData}
          mode="add"
          onSaved={handleSaveDataCenter}
        />
      </div>
    </Router>
  );
}

export default App;
