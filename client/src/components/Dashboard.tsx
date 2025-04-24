
import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Select, Input, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import axios from 'axios';
import RiskAssessment from './RiskAssessment';
import type { ColumnsType } from 'antd/es/table';

export interface Customer {
  customerId: string;
  name: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  creditScore: number;
  outstandingLoans: number;
  loanRepaymentHistory: number[];
  accountBalance: number;
  status: string;
  riskScore?: number;
}

interface RiskScoreData {
  name: string;
  score: number;
  color: string;
}

const statusOptions = ['Review', 'Approved', 'Rejected'];

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    axios.get('http://localhost:5000/customers')
      .then(res => {
        const customersWithScore = res.data.map((customer: Customer) => {
          const score = RiskAssessment.calculateRiskScore(customer);
          return { ...customer, riskScore: score };
        });
        setCustomers(customersWithScore);
        setFilteredCustomers(customersWithScore);
      })
      .catch(err => console.error(err));
  }, []);

  const applyFilters = (status: string, search: string, list: Customer[]) => {
    let filtered = [...list];
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    if (search) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredCustomers(filtered);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters(value, searchTerm, customers);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(statusFilter, term, customers);
  };

  const StatusDropdown: React.FC<{
    customer: Customer;
    onStatusChange: (id: string, status: string) => void;
  }> = ({ customer, onStatusChange }) => {
    const handleChange = async (newStatus: string) => {
      try {
        await axios.post(`http://localhost:5000/customers/${customer.customerId}/status`, {
          status: newStatus,
        });

        onStatusChange(customer.customerId, newStatus);

        const riskScore = customer.riskScore || 0;
        if (riskScore > 70) {
          await axios.post('http://localhost:5000/alerts', {
            customerId: customer.customerId,
            message: `High risk alert triggered for ${customer.name} (score: ${riskScore})`,
          });
        }

        message.success(`Status updated to ${newStatus}`);
      } catch (error) {
        message.error('Failed to update status');
      }
    };

    return (
      <Select
        value={customer.status}
        onChange={handleChange}
        style={{ width: 140 }}
      >
        {statusOptions.map(status => (
          <Select.Option key={status} value={status}>
            {status}
          </Select.Option>
        ))}
      </Select>
    );
  };

  const columns: ColumnsType<Customer> = [
    { title: 'Customer ID', dataIndex: 'customerId', key: 'customerId' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Income', dataIndex: 'monthlyIncome', key: 'monthlyIncome' },
    { title: 'Expenses', dataIndex: 'monthlyExpenses', key: 'monthlyExpenses' },
    { title: 'Credit Score', dataIndex: 'creditScore', key: 'creditScore' },
    RiskAssessment.getRiskColumn(),
    { title: 'Outstanding Loans', dataIndex: 'outstandingLoans', key: 'outstandingLoans' },
    { title: 'Account Balance', dataIndex: 'accountBalance', key: 'accountBalance' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, customer) => (
        <StatusDropdown
          customer={customer}
          onStatusChange={(id, newStatus) => {
            setCustomers(prev => {
              const updated = prev.map(c =>
                c.customerId === id ? { ...c, status: newStatus } : c
              );
              applyFilters(statusFilter, searchTerm, updated);
              return updated;
            });
          }}
        />
      ),
    },
  ];

  const totalIncome = filteredCustomers.reduce((sum, c) => sum + c.monthlyIncome, 0);
  const totalExpenses = filteredCustomers.reduce((sum, c) => sum + c.monthlyExpenses, 0);
  const totalOutstandingLoans = filteredCustomers.reduce((sum, c) => sum + c.outstandingLoans, 0);
  const totalAccountBalance = filteredCustomers.reduce((sum, c) => sum + c.accountBalance, 0);

  const chartData = filteredCustomers.map(customer => ({
    name: customer.name,
    Income: customer.monthlyIncome,
    Expenses: customer.monthlyExpenses,
  }));

  const riskScores: RiskScoreData[] = filteredCustomers.map(customer => ({
    name: customer.name,
    score: customer.riskScore || 0,
    color: RiskAssessment.getRiskColor(customer.riskScore || 0),
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Monthly Income" value={formatCurrency(totalIncome)} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Monthly Expenses" value={formatCurrency(totalExpenses)} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Customer Count" value={filteredCustomers.length} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Outstanding Loans" value={formatCurrency(totalOutstandingLoans)} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Account Balance" value={formatCurrency(totalAccountBalance)} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <Select.Option value="">All</Select.Option>
                {statusOptions.map(status => (
                  <Select.Option key={status} value={status}>{status}</Select.Option>
                ))}
              </Select>
              <Input
                placeholder="Search by name"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="Income vs Expenses">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Income" stroke="#8884d8" />
                <Line type="monotone" dataKey="Expenses" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Risk Score Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score">
                  {riskScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Customer Table">
            <Table
              rowKey="customerId"
              dataSource={filteredCustomers}
              columns={columns}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;














