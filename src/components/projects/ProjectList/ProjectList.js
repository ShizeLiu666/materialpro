import React, { useEffect, useState } from "react";
import { Row, Col, Breadcrumb, BreadcrumbItem } from "reactstrap";
import axios from "axios";
import ProjectCard from "./ProjectCard";
import PasswordModal from "./PasswordModal";
import RoomTypeList from "../RoomTypeList/RoomTypeList";
import RoomConfigList from "../RoomConfigurations/RoomConfigList"; // 导入 RoomConfigList
import default_image from "../../../assets/images/projects/default_image.jpg";
import { API_development_environment } from "../../../config";
import Alert from "@mui/material/Alert";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
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
        }, 1000);
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

      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    }
  };

  const handleBreadcrumbClick = () => {
    setBreadcrumbPath(["Project List"]);
    setShowRoomTypes(false); // 回到项目列表
  };

  const handleNavigate = (newPath, roomTypeId, roomTypeName) => {
    setBreadcrumbPath(newPath);
    setSelectedRoomType({ id: roomTypeId, name: roomTypeName });
    // console.log("Breadcrumb Path Updated:", newPath);
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
            {breadcrumbPath.length > 2 ? (
              <BreadcrumbItem>
                <button
                  onClick={() =>
                    handleNavigate(["Project List", "Room Types"], null, null)
                  }
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
                  {breadcrumbPath[1]}
                </button>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem active>{breadcrumbPath[1]}</BreadcrumbItem>
            )}
            {breadcrumbPath.length > 2 && (
              <BreadcrumbItem active>{breadcrumbPath[2]}</BreadcrumbItem>
            )}
          </Breadcrumb>
        </Col>
      </Row>

      {!showRoomTypes && (
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
      )}

      {showRoomTypes && selectedProject && breadcrumbPath.length === 2 && (
        <RoomTypeList
          projectId={selectedProject._id}
          projectName={selectedProject.name}
          onNavigate={handleNavigate}
        />
      )}

      {breadcrumbPath.length === 3 && selectedRoomType && (
        <RoomConfigList
          roomTypeId={selectedRoomType.id}
          roomTypeName={selectedRoomType.name}
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
