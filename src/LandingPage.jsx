import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//import AuthratorExe from "./downloads/Authrator-Portable-0.1.0.exe"
import axios from 'axios';

const LandingPage = () => {
  const [showCookieConsent, setShowCookieConsent] = useState(true);
  
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await axios.post('http://203.161.50.28:5001/api/stats/visit', {
          referrer: document.referrer || 'direct'
        });
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };
    
    trackVisit();
  }, []);
  
  const handleAcceptCookies = () => {
    setShowCookieConsent(false);
    localStorage.setItem('cookiesAccepted', 'true');
  };
  
  const handleRejectCookies = () => {
    setShowCookieConsent(false);
    localStorage.setItem('cookiesRejected', 'true');
  };
  
  const handleDownload = async () => {
    try {
      await axios.post('http://203.161.50.28:5001/api/stats/download', {
        referrer: document.referrer || 'direct'
      });
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  };
  
  useEffect(() => {
  
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    const cookiesRejected = localStorage.getItem('cookiesRejected');
    
    if (cookiesAccepted === 'true' || cookiesRejected === 'true') {
      setShowCookieConsent(false);
    }
  }, []);
  
  return (
    <div className="bg-gradient-to-b from-purple-900 to-purple-700 text-white min-h-screen flex flex-col">
      
      <header className="flex justify-between items-center px-6 py-4 bg-purple-800 shadow-md">
        <div className="text-xl font-bold">
          <span className="text-purple-300">Auth</span><span className="text-white">rator</span>
        </div>
        <div>
          <Link to="/admin" className="text-purple-300 hover:text-white transition-colors">
            Admin
          </Link>
        </div>
      </header>

      
      <section className="flex flex-col items-center justify-center flex-grow text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Welcome to Authrator</h1>
        <p className="text-lg mb-8">
          Simplify your JWT authentication process for APIs. Use our intuitive web client or download the desktop client for an enhanced experience. Try it now without signing up!
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
          <Link to="/dashboard" className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 text-center">
            Try Web Client
          </Link>
          {/* <a 
            href={AuthratorExe} 
            download="Authrator-Portable-0.1.0.exe" 
            target="_blank" 
            rel="noreferrer"
            onClick={handleDownload}
            className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-center cursor-pointer"
          >
            Download Desktop Client
          </a> */}
        </div>
      </section>

      
      <section className="py-16 bg-purple-800">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-12">Why Choose Authrator?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-purple-700 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Fast JWT Generation</h3>
              <p>Easily create and manage JWTs with our user-friendly interface.</p>
            </div>
            <div className="p-6 bg-purple-700 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">API Testing Made Simple</h3>
              <p>Test APIs with integrated JWT support, all from a single platform.</p>
            </div>
            <div className="p-6 bg-purple-700 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Secure & Reliable</h3>
              <p>Rest assured, your data and tokens are secure with our encryption standards.</p>
            </div>
          </div>
        </div>
      </section>


      <footer className="py-6 bg-purple-900 text-center">
        <p>&copy; {new Date().getFullYear()} Authrator. All rights reserved. | <a href="#" className="underline">Privacy Policy</a> | <a href="#" className="underline">Terms of Service</a></p>
      </footer>

      {showCookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-purple-800 text-white p-4 flex flex-col sm:flex-row justify-between items-center shadow-lg z-50">
          <p className="mb-4 sm:mb-0">We use cookies to improve your experience. By continuing, you accept our <a href="#" className="underline">Privacy Policy</a>.</p>
          <div className="space-x-4">
            <button 
              onClick={handleAcceptCookies}
              className="bg-purple-500 hover:bg-purple-400 text-white py-2 px-4 rounded-md"
            >
              Accept
            </button>
            <button 
              onClick={handleRejectCookies}
              className="bg-transparent border border-white text-white py-2 px-4 rounded-md"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage; 