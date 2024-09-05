import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // 导入眼睛图标
import Alert from "@mui/material/Alert"; // 导入 Alert 组件
import "./LoginPage.css";
import kastaLogo from "../../assets/images/logos/kasta_logo.png";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 控制显示/隐藏密码
  const [alert, setAlert] = useState({
    severity: "",
    message: "",
    open: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    setUsername("");
    setPassword("");
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/users/login", {
        username,
        password,
      });

      if (response.data && response.data.success) {
        const token = response.data.data.token;

        // 将 token 和用户名存储在 localStorage 中
        localStorage.setItem("authToken", token);
        localStorage.setItem("username", username); // 存储用户名
        console.log("Received token:", token);

        // 设置成功提示
        setAlert({
          severity: "success",
          message: "Login successful! Redirecting...",
          open: true,
        });

        // 跳转到管理员项目页面并关闭提示框
        setTimeout(() => {
          setAlert({ open: false });
          navigate("/admin/projects");
        }, 1000);
      } else {
        // 设置错误提示
        setAlert({
          severity: "error",
          message: response.data.errorMsg || "Login failed. Please try again.",
          open: true,
        });

        // 3秒后关闭提示框
        setTimeout(() => {
          setAlert({ open: false });
        }, 3000);
      }
    } catch (error) {
      console.error("Error during login:", error);

      // 设置请求失败提示
      setAlert({
        severity: "error",
        message: "There was an error logging in. Please try again.",
        open: true,
      });

      // 3秒后关闭提示框
      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // 切换显示/隐藏状态
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
                      <img
                        src={kastaLogo}
                        className="logo-margin-bottom"
                        style={{ width: "150px" }}
                        alt="logo"
                      />
                      <h4 className="mt-1 mb-5 pb-1 custom-title">
                        Project Management Platform
                      </h4>
                    </div>

                    {/* Alert 弹窗提示 */}
                    {alert.open && (
                      <Alert
                        severity={alert.severity}
                        style={{
                          position: "fixed",
                          top: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 9999,
                        }}
                      >
                        {alert.message}
                      </Alert>
                    )}

                    <div className="form-container">
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-outline mb-4">
                          <input
                            type="text"
                            id="username"
                            className="form-control"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"
                          />
                        </div>

                        <div className="form-outline mb-4 position-relative">
                          <input
                            type={showPassword ? "text" : "password"} // 切换密码输入框的类型
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
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              cursor: "pointer",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={showPassword ? faEyeSlash : faEye} // 根据状态切换图标
                              style={{ color: "#525455" }} // 设置图标颜色为灰色
                            />
                          </span>
                        </div>

                        <div className="text-center pt-1 mb-5 pb-1 move-down">
                          <button
                            className="btn btn-block fa-lg mb-3 login-button"
                            style={{ backgroundColor: "#fbcd0b" }}
                            type="submit"
                            onClick={handleLogin}
                          >
                            Log in
                          </button>
                          <a className="text-muted" href="#!">
                            Forgot password?
                          </a>
                        </div>

                        <div className="d-flex align-items-center justify-content-center pb-4 move-down">
                          <p className="mb-0 me-2">Don't have an account?</p>
                          <a className="text-muted" href="#!">
                            Create new
                          </a>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 d-flex align-items-center gradient-custom-2">
                  <div className="text-gradient">
                    <h4 className="mb-4">Living Enhanced</h4>
                    <p className="small mb-0">
                      KASTA offers smart control solutions with products
                      designed in Australia. Our seamless integration and
                      modular form ensure connectivity and scalability,
                      enhancing lifestyles with tailored applications
                    </p>
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