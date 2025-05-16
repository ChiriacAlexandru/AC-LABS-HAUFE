import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3000/login', formData);
      
      localStorage.setItem('token', response.data.token);
      setMessage('Login successful! Redirecting...');
      
      // Check if onLogin exists before calling it
      if (typeof onLogin === 'function') {
        onLogin();
      }
      
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-80 flex flex-col"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Conectare
        </h2>
        
        {message && (
          <p className={`mb-4 text-center ${
            message.includes('success') ? 'text-green-500' : 'text-red-500'
          }`}>
            {message}
          </p>
        )}
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="password"
          name="password"
          placeholder="Parolă"
          value={formData.password}
          onChange={handleChange}
          required
          className="mb-6 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Autentificare în curs...' : 'Autentificare'}
        </button>
      </form>
    </div>
  );
}

export default Login;