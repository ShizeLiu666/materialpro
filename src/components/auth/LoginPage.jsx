import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import kastaLogo from '../../assets/images/logos/kasta_logo.png';
import { API_development_environment } from '../../config';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);

  const handleLogin = async () => {
    try {
      // send login request to the server
      const response = await axios.post(`${API_development_environment}/api/auth/get_token`);
      if (response.data.token) {
        // store the token in local storage
        localStorage.setItem('authToken', response.data.token);
        alert(localStorage.getItem('authToken'));
        // navigate to admin dashboard
        navigate('/admin/projects');
      } else {
        alert('Failed to retrieve token');
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      alert('There was an error logging in. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="h-100 gradient-form">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-xl-10">
            <div className="card rounded-3 text-black">
              <div className="row g-0">
                <div className="col-lg-6">
                  <div className="card-body p-md-5 mx-md-4">
                    <div className="text-center">
                      <img src={kastaLogo} className="logo-margin-bottom" style={{ width: '150px' }} alt="logo" />
                      <h4 className="mt-1 mb-5 pb-1 custom-title">Kasta Management Platform</h4>
                    </div>

                    <div className="form-container">
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-outline mb-4">
                          <input
                            type="email"
                            id="username"
                            className="form-control"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"
                            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                            title="Please enter a valid email address."
                          />
                        </div>

                        <div className="form-outline mb-4 position-relative">
                          <input
                            type={showPassword ? 'text' : 'password'} // 动态设置input类型
                            id="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                          />
                          <span
                            className="password-toggle-icon"
                            onClick={togglePasswordVisibility}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              cursor: 'pointer'
                            }}
                          >
                            {showPassword ? '🔓' : '🔒'} {/* 简单的眼睛图标，可以替换为更复杂的图标 */}
                          </span>
                        </div>

                        <div className="text-center pt-1 mb-5 pb-1 move-down">
                          <button
                            className="btn btn-block fa-lg mb-3 login-button"
                            style={{ backgroundColor: '#fbcd0b' }}
                            type="submit"
                            onClick={handleLogin}
                          >
                            Log in
                          </button>
                          <a className="text-muted" href="#!">Forgot password?</a>
                        </div>

                        <div className="d-flex align-items-center justify-content-center pb-4 move-down">
                          <p className="mb-0 me-2">Don't have an account?</p>
                          <a className="text-muted" href="#!">Create new</a>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 d-flex align-items-center gradient-custom-2">
                  <div className="text-gradient">
                    <h4 className="mb-4">Living Enhanced</h4>
                    <p className="small mb-0">KASTA offers smart control solutions with products designed in Australia. Our seamless integration and modular form ensure connectivity and scalability, enhancing lifestyles with tailored applications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;