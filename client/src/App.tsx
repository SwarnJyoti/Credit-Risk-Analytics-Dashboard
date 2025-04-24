
import React from 'react';
import { Layout } from 'antd';
import Dashboard from './components/Dashboard';


const { Header, Content } = Layout;

const App: React.FC = () => (
  <Layout>
    <Header style={{ color: 'white', fontSize: 20 }}>Credit Risk Analytics Dashboard</Header>
    <Content style={{ padding: '24px' }}>
      <Dashboard />
    </Content>
  </Layout>
);

export default App;








