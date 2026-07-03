import React, { useState, useEffect } from 'react';
import PhoneWrapper from './components/PhoneWrapper';
import Toast from './components/Toast';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import TrackerScreen from './screens/TrackerScreen';
import CoachScreen from './screens/CoachScreen';
import ScannerScreen from './screens/ScannerScreen';
import ExercisesScreen from './screens/ExercisesScreen';
import CameraScreen from './screens/CameraScreen';
import RewardsScreen from './screens/RewardsScreen';
import ProfileScreen from './screens/ProfileScreen';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [currentScreen, setCurrentScreen] = useState(() => {
    return localStorage.getItem('token') ? 'dashboard' : 'welcome';
  });
  const [activeExercise, setActiveExercise] = useState('Bench Press');
  const [weightUnit, setWeightUnit] = useState(() => localStorage.getItem('weightUnit') || 'KG');
  const [toast, setToast] = useState(null);

  const handleToggleWeightUnit = () => {
    const newUnit = weightUnit === 'KG' ? 'LBS' : 'KG';
    setWeightUnit(newUnit);
    localStorage.setItem('weightUnit', newUnit);
  };

  // Sync token changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken('');
    setCurrentScreen('welcome');
  };

  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={setCurrentScreen} />;
      case 'auth':
        return (
          <AuthScreen
            onNavigate={setCurrentScreen}
            showToast={showToast}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigate={setCurrentScreen}
            showToast={showToast}
            authHeaders={authHeaders}
            onLogout={handleLogout}
            weightUnit={weightUnit}
            onToggleWeightUnit={handleToggleWeightUnit}
          />
        );
      case 'scanner':
        return (
          <ScannerScreen
            onNavigate={setCurrentScreen}
            showToast={showToast}
            authHeaders={authHeaders}
          />
        );
      case 'tracker':
        return (
          <TrackerScreen
            onNavigate={setCurrentScreen}
            showToast={showToast}
            authHeaders={authHeaders}
          />
        );
      case 'coach':
        return (
          <CoachScreen
            onNavigate={setCurrentScreen}
            showToast={showToast}
            authHeaders={authHeaders}
          />
        );
      case 'rewards':
        return (
          <RewardsScreen
            onNavigate={setCurrentScreen}
            showToast={showToast}
            authHeaders={authHeaders}
          />
        );
      case 'exercises':
        return (
          <ExercisesScreen
            onNavigate={setCurrentScreen}
            onStartWorkout={(exName) => {
              setActiveExercise(exName);
              setCurrentScreen('camera');
            }}
          />
        );
      case 'camera':
        return (
          <CameraScreen
            onNavigate={setCurrentScreen}
            showToast={showToast}
            authHeaders={authHeaders}
            exerciseName={activeExercise}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onNavigate={setCurrentScreen}
            showToast={showToast}
            authHeaders={authHeaders}
            onLogout={handleLogout}
            weightUnit={weightUnit}
            onToggleWeightUnit={handleToggleWeightUnit}
          />
        );
      default:
        return <WelcomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <>
      <PhoneWrapper currentScreen={currentScreen} onNavigate={setCurrentScreen}>
        {renderScreen()}
      </PhoneWrapper>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
