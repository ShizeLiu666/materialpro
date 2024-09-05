import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Collapse,
  Nav,
  NavbarBrand,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import kasta_logo from "../assets/images/logos/kasta_logo.png";
import user1 from "../assets/images/users/normal_user.jpg";
import '../assets/scss/loader/Header.css';
import { useExcelConverter } from '../components/fileConverter/ExcelConverterContext'; // 正确导入 useExcelConverter

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState(""); // 用于存储用户名
  const navigate = useNavigate();
  const { resetState } = useExcelConverter(); // 从 useExcelConverter 解构 resetState

  // 在组件加载时从 localStorage 中获取用户名
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const Handletoggle = () => setIsOpen(!isOpen);
  const showMobilemenu = () => document.getElementById("sidebarArea").classList.toggle("showSidebar");
  const toggleModal = () => setModalOpen(!modalOpen);

  const handleLogout = () => {
    console.log("Logout button clicked");
    localStorage.clear(); // 清空 localStorage
    resetState(); // 调用 resetState 重置状态
    navigate("/login"); // 重定向到登录页面
  };

  return (
    <Navbar dark expand="md" className="fix-header header-background">
      <div className="d-flex align-items-center">
        <NavbarBrand href="/admin/projects">
          <img src={kasta_logo} alt="logo" className="logo" />
        </NavbarBrand>
        <Button
          color="primary"
          className="d-lg-none"
          onClick={() => showMobilemenu()}
        >
          <i className="bi bi-list"></i>
        </Button>
      </div>
      <div className="hstack gap-2">
        <Button
          color="primary"
          size="sm"
          className="d-sm-block d-md-none"
          onClick={Handletoggle}
        >
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
      </div>
      <Collapse navbar isOpen={isOpen}>
        <Nav className="me-auto" navbar>
          {/* 你可以在这里添加更多导航项目 */}
        </Nav>
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="transparent" className="d-flex align-items-center">
            {/* 使用 state 中的 username 动态显示用户名 */}
            <span className="me-2" style={{ color: 'black', fontSize: '20px' }}>
              {username ? `Hi, ${username}` : "Hi, User"}
            </span>
            <img
              src={user1}
              alt="profile"
              className="rounded-circle"
              width="40"
            />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Info</DropdownItem>
            <DropdownItem>My Account</DropdownItem>
            <DropdownItem>Edit Profile</DropdownItem>
            <DropdownItem divider />
            <DropdownItem onClick={toggleModal}>Logout</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Collapse>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={modalOpen} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>Confirm Logout</ModalHeader>
        <ModalBody>
          Are you sure you want to log out?
        </ModalBody>
        <ModalFooter>
          <Button 
            onClick={handleLogout}
            size="sm"
            style={{ backgroundColor: "#fbcd0b", borderColor: "#fbcd0b", fontWeight: "bold" }
          }
          >
            Yes, Logout
          </Button>{' '}
          <Button color="secondary" onClick={toggleModal} size="sm">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Navbar>
  );
};

export default Header;