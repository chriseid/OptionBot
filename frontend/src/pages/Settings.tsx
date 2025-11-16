import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [apiUrl, setApiUrl] = useState(
    process.env.REACT_APP_API_URL || 'http://localhost:8000'
  );

  const handleSave = () => {
    // TODO: Save settings to localStorage or backend
    console.log('Saving settings...', { apiUrl });
    message.success('Settings saved successfully');
  };

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 600 }}>Settings</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Configure your application settings
      </p>

      <Card>
        <Form layout="vertical" form={form}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>API Configuration</h2>
          
          <Form.Item
            label="API Base URL"
            name="apiUrl"
            initialValue={apiUrl}
            rules={[{ required: true, message: 'Please enter API URL' }]}
          >
            <Input
              placeholder="http://localhost:8000"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
          </Form.Item>
          
          <p style={{ color: '#999', fontSize: 12, marginTop: -16, marginBottom: 16 }}>
            Base URL for the backend API
          </p>

          <Form.Item>
            <Button type="primary" onClick={handleSave}>
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
