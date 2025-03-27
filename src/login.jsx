import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
import logo from "./imgpsh.png";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formRef = useRef(null);
  const logoRef = useRef(null);
  const errorRef = useRef(null);
  const backgroundRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const particles = backgroundRef.current.querySelectorAll('.particle');
    gsap.fromTo(
      particles,
      { opacity: 0, scale: 0.5 },
      { 
        opacity: [0, 0.6, 0], 
        scale: 1, 
        duration: 2, 
        stagger: { each: 0.2, repeat: -1 },
        ease: 'power1.inOut'
      }
    );
    tl.fromTo(
      logoRef.current, 
      { opacity: 0, scale: 0.5, y: -50 }, 
      { opacity: 1, scale: 1, y: 0, duration: 0.8 }
    );
    tl.fromTo(
      formRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.4'
    );
  }, []);

  const handlesignup = () =>{

    navigate("/signup")
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://203.161.50.28:5001/api/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        
        gsap.to(formRef.current, {
          opacity: 0,
          y: 50,
          duration: 0.5,
          onComplete: () => navigate('/dashboard')
        });
      }
    } catch (err) {
      gsap.fromTo(
        errorRef.current,
        { x: -10, rotation: -2 },
        { 
          x: 10, 
          rotation: 2, 
          duration: 0.1, 
          repeat: 5, 
          yoyo: true,
          onComplete: () => setError('Invalid credentials')
        }
      );
    }
  };

  return (
    <div 
      ref={backgroundRef} 
      className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-black via-purple-950 to-black 
      relative overflow-hidden"
    >
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="particle absolute bg-purple-500/30 rounded-full" 
          style={{
            width: `${Math.random() * 10 + 2}px`,
            height: `${Math.random() * 10 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <div className="bg-white/10 backdrop-blur-lg border border-purple-500/30 p-8 rounded-2xl shadow-2xl w-[400px] relative z-10 overflow-hidden">
        <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px]"></div>
        
        <div 
          ref={logoRef} 
          className="flex justify-center mb-8"
        >
          <img 
            src={logo} 
            alt="Authrator Logo" 
            className="w-24 h-24 object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>

        <form 
          ref={formRef} 
          onSubmit={handleSubmit} 
          className="relative z-10"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Authrator</h2>
          
          {error && (
            <p 
              ref={errorRef} 
              className="text-red-400 mb-4 text-center bg-red-500/10 p-2 rounded"
            >
              {error}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-purple-200 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 text-white 
                rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 
                transition duration-300 placeholder-purple-300"
              placeholder="Enter your email"
              required 
            />
          </div>

          <div className="mb-6">
            <label className="block text-purple-200 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 text-white 
                rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 
                transition duration-300 placeholder-purple-300"
              placeholder="Enter your password"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-purple-600 text-white py-3 rounded-xl 
              hover:bg-purple-700 transition duration-300 
              transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Login
          </button>

          <p className="text-center mt-4 text-purple-200">
            Don't have an account? 
            <a 
              onClick={handlesignup}
              className="text-purple-400 ml-1 hover:text-purple-300 
                transition duration-300"
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;