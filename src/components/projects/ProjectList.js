import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import axios from "axios";
import ProjectCard from "./ProjectCard";
import PasswordModal from "./PasswordModal";
import default_image from "../../assets/images/projects/default_image.jpg";
import { API_development_environment } from '../../config';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error("No token found, please log in again.");
          return;
        }

        const response = await axios.get(`${API_development_environment}/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const handleCardClick = (project) => {
    setSelectedProject(project);
    toggleModal();
  };

  const handlePasswordSubmit = (password) => {
    console.log(`Password for ${selectedProject.name}: ${password}`);
    toggleModal();
  };

  return (
    <div>
      <h5 className="mb-3" style={{fontWeight: "bold"}}>Project List</h5>
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

export default Projects;