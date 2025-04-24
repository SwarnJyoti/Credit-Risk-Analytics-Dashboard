
import React from 'react';
import { Select, message } from 'antd';
import axios from 'axios';
import type { ColumnsType } from 'antd/es/table';
import { Customer } from './Dashboard';

const statusOptions = ['Review', 'Approved', 'Rejected'];

interface StatusDropdownProps {
  customer: Customer;
  onStatusChange: (id: string, status: string) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ customer, onStatusChange }) => {
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

export const getUpdateColumn = (
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>
): ColumnsType<Customer>[number] => ({
  title: 'Status',
  dataIndex: 'status',
  key: 'status',
  render: (_, customer) => (
    <StatusDropdown
      customer={customer}
      onStatusChange={(id, status) => {
        setCustomers(prev =>
          prev.map(c =>
            c.customerId === id ? { ...c, status } : c
          )
        );
      }}
    />
  ),
});







