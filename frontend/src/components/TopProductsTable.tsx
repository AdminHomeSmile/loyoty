import React from 'react';
import { TopProduct } from '../types';
import './TopProductsTable.css';

interface TopProductsTableProps {
  products: TopProduct[];
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
  return (
    <div className="table-container">
      <table className="products-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Units Sold</th>
            <th>Revenue</th>
            <th>Unique Customers</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>
                <span className="category-badge">{product.category}</span>
              </td>
              <td>{product.units_sold}</td>
              <td>${product.revenue.toFixed(2)}</td>
              <td>{product.unique_customers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopProductsTable;
