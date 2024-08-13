import React, { useEffect, useState } from "react";
import { Row, Col, Breadcrumb, BreadcrumbItem } from "reactstrap";
import axios from "axios";
import ProjectCard from "./ProjectCard";
import PasswordModal from "./PasswordModal";
import RoomTypeList from "../RoomTypeList/RoomTypeList";
import default_image from "../../../assets/images/projects/default_image.jpg";
import { API_development_environment } from "../../../config";
import Alert from "@mui/material/Alert";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [alert, setAlert] = useState({
    severity: "",
    message: "",
    open: false,
  });
  const [breadcrumbPath, setBreadcrumbPath] = useState(["Project List"]);
  const [showRoomTypes, setShowRoomTypes] = useState(false);

  useEffect(() => {
    const fetchProjectList = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No token found, please log in again.");
          return;
        }

        const response = await axios.get(
          `${API_development_environment}/api/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjectList();
  }, []);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const handleCardClick = (project) => {
    setSelectedProject(project);
    toggleModal();
  };

  const handlePasswordSubmit = async (password) => {
    try {
      const response = await axios.post(
        `${API_development_environment}/api/projects/verify_password`,
        {
          id: selectedProject._id,
          password: password,
        }
      );

      if (response.status === 200) {
        setAlert({
          severity: "success",
          message: `Password for ${selectedProject.name} is correct!`,
          open: true,
        });
        setTimeout(() => {
          setAlert({ open: false });
          toggleModal();
          setBreadcrumbPath(["Project List", "Room Types"]); // 更新Breadcrumbs路径
          setShowRoomTypes(true); // 展示Room Types界面
        }, 500);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setAlert({
          severity: "error",
          message: `Incorrect password for ${selectedProject.name}.`,
          open: true,
        });
      } else if (error.response && error.response.status === 404) {
        setAlert({
          severity: "error",
          message: `Project ${selectedProject.name} not found.`,
          open: true,
        });
      } else {
        setAlert({
          severity: "error",
          message: "An error occurred. Please try again later.",
          open: true,
        });
        console.error("Error verifying password:", error);
      }

      // 3秒后隐藏 `Alert`，但不关闭 `PasswordModal`
      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    }
  };

  const handleBreadcrumbClick = () => {
    setBreadcrumbPath(["Project List"]);
    setShowRoomTypes(false); // 回到项目列表
  };

  return (
    <div>
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

      {/* Breadcrumbs */}
      <Row>
        <Col>
          <Breadcrumb>
            <BreadcrumbItem>
              {breadcrumbPath.length > 1 ? (
                <button
                  onClick={handleBreadcrumbClick}
                  style={{
                    background: "none",
                    border: "none",
                    color: "blue",
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                  }}
                >
                  Project List
                </button>
              ) : (
                "Project List"
              )}
            </BreadcrumbItem>
            {breadcrumbPath.length > 1 && (
              <BreadcrumbItem active>Room Types</BreadcrumbItem>
            )}
          </Breadcrumb>
        </Col>
      </Row>

      {/* 如果 showRoomTypes 为 false 显示项目列表 */}
      {!showRoomTypes && (
        <>
          <Row>
            {projects.map((project, index) => (
              <Col sm="6" lg="6" xl="4" key={index}>
                <div onClick={() => handleCardClick(project)}>
                  <ProjectCard
                    image={default_image}
                    title={project.name}
                    subtitle={project.address}
                    color="primary"
                  />
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* 如果 showRoomTypes 为 true 显示 RoomTypeList 组件 */}
      {showRoomTypes && selectedProject && (
        <RoomTypeList
          projectId={selectedProject._id}
          projectName={selectedProject.name} // 传递 projectName
        />
      )}

      {selectedProject && (
        <PasswordModal
          isOpen={modalOpen}
          toggle={toggleModal}
          projectName={selectedProject.name}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
};

export default ProjectList;
