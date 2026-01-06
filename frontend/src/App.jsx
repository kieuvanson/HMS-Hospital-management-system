import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from './components/Auth/indexAuth';
import DoctorLayout from './components/Doctor/DoctorLayout';
import DoctorDashboard from './pages/doctor/Dashboard';
import NewPatientRecord from './pages/doctor/NewPatientRecord';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/auth/*" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="patients/new" element={<NewPatientRecord />} />
            {/* Thêm các route khác cho bác sĩ ở đây */}
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;