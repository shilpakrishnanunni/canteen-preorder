import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import LimitModal from './components/LimitModal.jsx';
import MenuPage from './pages/MenuPage.jsx';
import TrackPage from './pages/TrackPage.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return <AppRoutes />
    // <>
    //   <Header />
    //   <Routes>
    //     <Route path="/" element={<MenuPage />} />
    //     <Route path="/track/:token" element={<TrackPage />} />
    //     <Route path="*" element={<Navigate to="/" replace />} />
    //   </Routes>
    //   <LimitModal />
    // </>
  // );
}
