import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const DeleteConfigModal = ({ isOpen, toggle, onDelete }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Confirm Delete</ModalHeader>
      <ModalBody>
        Are you sure you want to delete the current room configuration?
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={onDelete}
          size="sm"
          style={{ fontWeight: "bold" }}
        >
          Delete
        </Button>{' '}
        <Button color="secondary" onClick={toggle} size="sm">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfigModal;