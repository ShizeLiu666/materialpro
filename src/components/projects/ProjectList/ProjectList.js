import React, { useEffect, useState } from "react";
import { Row, Col, Breadcrumb, BreadcrumbItem} from "reactstrap";
import axios from "axios";
import ProjectCard from "./ProjectCard";
import PasswordModal from "./PasswordModal";
import RoomTypeList from "../RoomTypeList/RoomTypeList";
import RoomConfigList from "../RoomConfigurations/RoomConfigList";
import default_image from "../../../assets/images/projects/default_image.jpg";
import Alert from "@mui/material/Alert";
// import CreateProjectModal from "./CreateProjectModal"; // Import the new CreateProjectModal

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
  // const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false); // Track the Create Project Modal

  useEffect(() => {
    const fetchProjectList = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No token found, please log in again.");
          return;
        }

        const response = await axios.get("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const projects = response.data.data.map((project) => ({
            projectId: project.projectId,
            name: project.name,
            password: project.password,
            iconUrl: project.iconUrl,
            address: project.address,
            role: project.role,
          }));
          setProjects(projects);
        } else {
          console.error("Error fetching projects:", response.data.errorMsg);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjectList();
  }, []);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  // const toggleCreateProjectModal = () => {
  //   setCreateProjectModalOpen(!createProjectModalOpen); // Toggle Create Project Modal
  // };

  const handleCardClick = (project) => {
    setSelectedProject(project);
    toggleModal();
  };

  const handlePasswordSubmit = async (password) => {
    try {
      if (password === selectedProject.password) {
        setAlert({
          severity: "success",
          message: `Password for ${selectedProject.name} is correct!`,
          open: true,
        });
        setTimeout(() => {
          setAlert({ open: false });
          toggleModal();
          setBreadcrumbPath(["Project List", "Room Types"]);
          setShowRoomTypes(true);
        }, 1000);
      } else {
        setAlert({
          severity: "error",
          message: `Incorrect password for ${selectedProject.name}.`,
          open: true,
        });
      }
    } catch (error) {
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
  };

  const handleBreadcrumbClick = () => {
    setBreadcrumbPath(["Project List"]);
    setShowRoomTypes(false);
  };

  const handleNavigate = (newPath, roomTypeId, roomTypeName) => {
    setBreadcrumbPath(newPath);
    setSelectedRoomType({ id: roomTypeId, name: roomTypeName });
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

      {/* Add a button to open Create Project Modal */}
      {/* <Button
        style={{
          backgroundColor: "#fbcd0b",
          color: "#fff",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
        onClick={toggleCreateProjectModal}
      >
        Create New Project
      </Button> */}

      {!showRoomTypes && (
        <Row>
          {projects.map((project, index) => (
            <Col sm="6" lg="6" xl="4" key={index}>
              <div onClick={() => handleCardClick(project)}>
                <ProjectCard
                  image={project.iconUrl ? project.iconUrl : default_image}
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
          projectId={selectedProject.projectId}
          projectName={selectedProject.name}
          onNavigate={handleNavigate}
        />
      )}

      {breadcrumbPath.length === 3 && selectedRoomType && (
        <RoomConfigList
          projectRoomId={selectedRoomType.id}
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

      {/* Add Create Project Modal */}
      {/* <CreateProjectModal
        isOpen={createProjectModalOpen}
        toggle={toggleCreateProjectModal}
        // Handle project creation here
      /> */}
    </div>
  );
};

export default ProjectList;