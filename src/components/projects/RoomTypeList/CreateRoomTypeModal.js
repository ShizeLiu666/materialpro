import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';

const CreateRoomTypeModal = ({ isOpen, toggle, onCreate }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(''); // 用于存储错误消息

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onCreate(name); // 尝试创建房型
      setName(''); // 清空输入框
      setError(''); // 清空错误消息
      toggle(); // 成功后关闭模态框
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('Room type already exists.'); // 设置错误消息
      } else {
        setError('An unexpected error occurred.'); // 处理其他错误
      }
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(''); // 3秒后清除错误消息
      }, 3000);

      // 在组件卸载或error变更时清除定时器
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Create New Room Type</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          {error && <Alert color="danger">{error}</Alert>} {/* 显示错误消息 */}
          <FormGroup>
            <Label for="name">Room Type Name:</Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormGroup>
          <Button color="primary" size="sm" type="submit" style={{ backgroundColor: "#fbcd0b", borderColor: "#fbcd0b", fontWeight: "bold" }}>
            Create
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default CreateRoomTypeModal;