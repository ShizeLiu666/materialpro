import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import axios from "axios";
import Blog from "../../components/projects/Blog";
import PasswordModal from "../../components/projects/PasswordModal";
import default_image from "../../assets/images/projects/default_image.jpg";

const API_development_environment = 'http://localhost:8000';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [token, setToken] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.post(`${API_development_environment}/api/auth/get_token`);
        setToken(response.data.token);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
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

    if (token) {
      fetchProjects();
    }
  }, [token]);

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
      <h5 className="mb-3">Project List</h5>
      <Row>
        {projects.map((project, index) => (
          <Col sm="6" lg="6" xl="4" key={index}>
            <div onClick={() => handleCardClick(project)}>
              <Blog
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