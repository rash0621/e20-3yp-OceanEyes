"use client";
import { useEffect, useState } from "react";
import style from "./AdminInventoryCustomers.module.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Dialog, DialogContent } from "@mui/material";
import { domainName } from "../components/DomainName";
import RequireAuth from "../components/RequireAuth";

interface Customer {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  organization: string;
  address?: string;
  isRegistered: boolean;
  numberOfDevicePurchased: number;
}
const initialCustomer: Customer = {
  id: "",
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  username: "",
  organization: "",
  address: "",
  isRegistered: false,
  numberOfDevicePurchased: 1,
};
function AdminInventoryCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editRow, setEditRow] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Customer>(initialCustomer);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await axios.get(`${domainName}admin-customer-registry/getAll`);
      console.log("Fetched customers:", result.data);
      setCustomers(result.data);
    } catch (error:any) {      
    console.error("Error loading customers:", error?.response?.data || error.message);
    alert("Failed to load customers: " + (error?.response?.data || error.message));
    }
  };

  const onEditClick = (customer: Customer) => {
    setCustomerForm(customer);
    setShowDialog(true);
    setEditRow(true);
    setSelectedCustomer(customer);
  };

  const onDeleteClick = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${domainName}admin-customer-registry/delete/${id}`);
      loadData();
      alert("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer!");
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
  };

  const onUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmUpdate = window.confirm("Are you sure you want to update this customer?");
    if (!confirmUpdate) return;
    try {
      await axios.put(`${domainName}admin-customer-registry/edit/${customerForm.id}`, customerForm);
      loadData();
      setEditRow(false);
      setShowDialog(false);
      alert("Customer updated successfully!");
    } catch (error) {
      console.error("Error editing customer:", error);
      alert("Failed to update customer!");
    }
  };

  const discardButtonClicked = () => {
    setShowDialog(false);
    setEditRow(false);
    setCustomerForm(initialCustomer);
    setSelectedCustomer(null);
  };

  return (    
    <>
    <RequireAuth>
      <div className={style.container}>
      <div className={style.inventoryCustomerTitle}>
        <h5>Customer Inventory</h5>
        <p>
          All the customers registered by the company.
        </p>
      </div>
        <div className={style.tableContainer}>
          <table className={style.table}>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Organization</th>
                <th>Address</th>
                <th>Registered</th>
                <th>Devices Purchased</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.firstName}</td>
                  <td>{customer.lastName}</td>
                  <td>{customer.username}</td>                  
                  <td>{customer.organization}</td>
                  <td>{customer.address}</td>
                  <td>{customer.isRegistered ? "Yes" : "No"}</td>                
                  <td>{customer.numberOfDevicePurchased}</td>
                  <td>
                    <div className={style.actionButtonsBlock}>
                      <button
                        className={style.actionButton}
                        onClick={() => onEditClick(customer)}
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className={style.actionButton}
                        onClick={() => onDeleteClick(customer.id)}
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editRow && (
        <Dialog open={showDialog} onClose={discardButtonClicked} fullWidth maxWidth="md">
          <DialogContent>
            <div className={style.dialogForm}>
              <form onSubmit={onUpdateSubmit}>
                <div className={style.inventoryCustomerTitle}>
                  <h5>Customer Inventory</h5>
                  <p>
                    All the customers registered by the company.
                  </p>
                </div>
                <div className={style.inputbox}>
                    <label>Customer ID</label>
                    <input
                      type="text"
                      className={style.field}
                      value={customerForm.id}
                      readOnly
                    />
                  </div>                
                <div className={style.inputbox}>
                  <label>Email</label>
                  <input
                    type="email"
                    className={style.field}
                    name="email"
                    value={customerForm.email}
                    onChange={onInputChange}
                    required
                  />
                </div>
                <div className={style.inputbox}>
                  <label>Phone</label>
                  <input
                    type="text"
                    className={style.field}
                    name="phone"
                    value={customerForm.phone}
                    onChange={onInputChange}
                    required
                  />
                </div>
                <div className={style.inputbox}>
                  <label>First Name</label>
                  <input
                    type="test"
                    className={style.field}
                    name="name"
                    value={customerForm.firstName}
                    onChange={onInputChange}
                    required
                  />
                </div>
                <div className={style.inputbox}>
                  <label>Last Name</label>
                  <input
                    type="test"
                    className={style.field}
                    name="name"
                    value={customerForm.lastName}
                    onChange={onInputChange}
                    required
                  />
                </div>
                <div className={style.inputbox}>
                  <label>username</label>
                  <input
                    type="test"
                    className={style.field}
                    name="name"
                    value={customerForm.username}
                    onChange={onInputChange}
                    required
                  />
                </div>
                <div className={style.inputbox}>
                  <label>Organization</label>
                  <input
                    type="text"
                    className={style.field}
                    name="organization"
                    value={customerForm.organization}
                    onChange={onInputChange}
                    required
                  />
                </div>
                <div className={style.inputbox}>
                  <label>Address</label>
                  <textarea
                    className={style.field}
                    name="address"
                    value={customerForm.address}
                    onChange={onInputChange}
                  />
                </div>
                <div className={style.inputbox}>
                  <label>Devices Purchased</label>
                  <input
                    type="number"
                    className={style.field}
                    name="numberOfDevicePurchased"
                    value={customerForm.numberOfDevicePurchased}
                    onChange={onInputChange}
                    min={1}
                    required
                  />
                </div>
                <div className={style.inputbox}>
                  <label>Registered</label>
                  <input
                    type="checkbox"
                    name="isRegistered"
                    checked={customerForm.isRegistered}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        isRegistered: e.target.checked,
                      })
                    }
                  />
                </div>
                <div className={style.buttonsBlock}>
                  <button type="submit" className={style.submitButton}>
                    Update
                  </button>
                  <button type="button" className={style.submitButton} onClick={discardButtonClicked}>
                    Discard
                  </button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}      
    </RequireAuth>
    </>
  );
}

export default AdminInventoryCustomers;