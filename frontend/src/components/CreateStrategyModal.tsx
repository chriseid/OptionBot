import React from 'react';
import { Modal, Form, Select, InputNumber, Button, Divider, Row, Col, message } from 'antd';
import { CreateStrategyFormData } from '../types';

const { Option: SelectOption } = Select;

interface CreateStrategyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateStrategyFormData) => void;
}

const CreateStrategyModal: React.FC<CreateStrategyModalProps> = ({
  visible,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  
  const strategy = Form.useWatch('strategy', form);

  const handleSubmit = async () => {
    console.log('Form submit triggered');
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);

      const formData: CreateStrategyFormData = {
        symbol: values.symbol,
        strategy: values.strategy,
        expiration: values.expiration,
        legs: {
          longPut: values.longPut,
          shortPut: values.shortPut,
          shortCall: values.shortCall,
          longCall: values.longCall,
        },
        quantity: values.quantity,
      };
      
      console.log('Submitting form data:', formData);
      onSubmit(formData);
      form.resetFields();
    } catch (errorInfo) {
      console.log('Validation failed:', errorInfo);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Create New Strategy"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="symbol"
              label="Symbol"
              rules={[{ required: true, message: 'Please select a symbol' }]}
            >
              <Select placeholder="Select Symbol">
                <SelectOption value="SPY">SPY</SelectOption>
                <SelectOption value="QQQ">QQQ</SelectOption>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="strategy"
              label="Option Strategy"
              rules={[{ required: true, message: 'Please select a strategy' }]}
            >
              <Select placeholder="Select Strategy">
                <SelectOption value="Iron Condor">Iron Condor</SelectOption>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="expiration"
              label="Expiration"
              rules={[{ required: true, message: 'Please select expiration' }]}
            >
              <Select placeholder="Select Expiration">
                <SelectOption value="0DTE">0DTE</SelectOption>
                <SelectOption value="Next Day">Next Day</SelectOption>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {strategy === 'Iron Condor' && (
          <>
            <Divider orientation="left">Iron Condor Legs (Delta Values)</Divider>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="longPut"
                  label="Long Put Delta"
                  rules={[{ required: true, message: 'Please enter Long Put delta' }]}
                  help="Negative delta (e.g., -0.10 to -0.20)"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    step={0.01}
                    min={-1}
                    max={0}
                    placeholder="e.g., -0.15"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="shortPut"
                  label="Short Put Delta"
                  rules={[{ required: true, message: 'Please enter Short Put delta' }]}
                  help="Negative delta, higher than Long Put (e.g., -0.20 to -0.30)"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    step={0.01}
                    min={-1}
                    max={0}
                    placeholder="e.g., -0.25"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="shortCall"
                  label="Short Call Delta"
                  rules={[{ required: true, message: 'Please enter Short Call delta' }]}
                  help="Positive delta (e.g., 0.20 to 0.30)"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    step={0.01}
                    min={0}
                    max={1}
                    placeholder="e.g., 0.25"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="longCall"
                  label="Long Call Delta"
                  rules={[{ required: true, message: 'Please enter Long Call delta' }]}
                  help="Positive delta, higher than Short Call (e.g., 0.30 to 0.40)"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    step={0.01}
                    min={0}
                    max={1}
                    placeholder="e.g., 0.35"
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Divider orientation="left">Order Details</Divider>
        <Form.Item
          name="quantity"
          label="Contracts Quantity"
          rules={[{ required: true, message: 'Please enter quantity' }]}
        >
          <InputNumber
            min={1}
            style={{ width: '100%' }}
            placeholder="Enter number of contracts"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" size="large" htmlType="submit" style={{ minWidth: 200 }}>
            Create Strategy
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateStrategyModal;
