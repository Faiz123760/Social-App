import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Feed from './components/Feed';
import CreatePost from './components/CreatePost';
import Navbar from './components/Navbar';
import './App.css';

function AppContent() {
  const { isAuthenticated, _user } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? <Login /> : <Navigate to="/feed" />
          } />
          <Route path="/signup" element={
            !isAuthenticated ? <Signup /> : <Navigate to="/feed" />
          } />
          <Route path="/feed" element={
            isAuthenticated ? <Feed /> : <Navigate to="/login" />
          } />
          <Route path="/create" element={
            isAuthenticated ? <CreatePost /> : <Navigate to="/login" />
          } />
          <Route path="/" element={<Navigate to="/feed" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;