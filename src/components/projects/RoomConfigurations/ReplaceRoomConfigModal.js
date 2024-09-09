import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ReplaceRoomConfigModal = ({ isOpen, toggle, onReplace }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Replace Room Configuration</ModalHeader>
      <ModalBody>
        A room configuration already exists. Are you sure you want to replace it
        with the new configuration?
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={onReplace}
          size="sm"
          style={{
            fontWeight: "bold",
            backgroundColor: "#fbcd0b",
            borderColor: "#fbcd0b",
          }}
        >
          Replace
        </Button>{" "}
        <Button color="secondary" onClick={toggle} size="sm">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReplaceRoomConfigModal;
