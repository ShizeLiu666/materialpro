import React, { useState } from "react";
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
  const navigate = useNavigate();
  const { resetState } = useExcelConverter(); // 从 useExcelConverter 解构 resetState

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
            <span className="me-2" style={{ color: 'black', fontSize: '20px' }}>Hi, UserName!</span>
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