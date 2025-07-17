"use client";
import React, { useState } from "react";
import styles from "./AdminAddCustomer.module.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import { domainName } from "../components/DomainName";

interface CustomerForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  organization: string;
  address: string;
  numberOfDevicePurchased: string;
}

const initialForm: CustomerForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  organization: "",
  address: "",
  numberOfDevicePurchased: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{10,15}$/;

export default function AddCustomer() {
  const [form, setForm] = useState<CustomerForm>(initialForm);
  const [errors, setErrors] = useState<Partial<CustomerForm>>({});
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [idGenerated, setIdGenerated] = useState<boolean>(false);

  const validate = (): boolean => {
    const newErrors: Partial<CustomerForm> = {};
      if (!form.firstName) newErrors.firstName = "First name is required.";
      if (!form.lastName) newErrors.lastName = "Last name is required.";
      if (!form.username) newErrors.username = "Username is required.";


    if (!form.email) newErrors.email = "Email is required.";
    else if (!emailRegex.test(form.email)) newErrors.email = "Invalid email format.";

    if (!form.phone) newErrors.phone = "Phone number is required.";
    else if (!phoneRegex.test(form.phone)) newErrors.phone = "Invalid phone number format.";

    if (!form.organization) newErrors.organization = "Organization is required.";

    if (!form.numberOfDevicePurchased) newErrors.numberOfDevicePurchased = "Number of devices is required.";
    else if (isNaN(Number(form.numberOfDevicePurchased)) || Number(form.numberOfDevicePurchased) < 1)
      newErrors.numberOfDevicePurchased = "Enter a valid number greater than 0.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const validateField = (name: string, value: string): string | undefined => {
  switch (name) {
    case "firstName":
      if (!value) return "First name is required.";
      break;
    case "lastName":
      if (!value) return "Last name is required.";
      break;
    case "username":
      if (!value) return "Username is required.";
      break;
    case "email":
      if (!value) return "Email is required.";
      if (!emailRegex.test(value)) return "Invalid email format.";
      break;
    case "phone":
      if (!value) return "Phone number is required.";
      if (!isValidPhoneNumber(value)) return "Invalid phone number format. Use +[country code][number]";
      break;
    case "organization":
      if (!value) return "Organization is required.";
      break;
    case "numberOfDevicePurchased":
      if (!value) return "Number of devices is required.";
      if (isNaN(Number(value)) || Number(value) < 1 || !Number.isInteger(Number(value)))
        return "Enter a valid integer greater than 0.";
      break;
    default:
      return undefined;
  }
  return undefined;
};

const handleGenerateId = async () => {
  // console.log("Generate ID button clicked"); 
  if (!validate()) {
      console.log("Not validated");
    return;
  }
  console.log("Generating ID...");

  try {
    const response = await fetch(`${domainName}admin-customer-registry/generate-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    console.log("Generate ID response:", data);

    if (response.ok && data.customerId) {
      setCustomerId(data.customerId);
      setIdGenerated(true);
      setSuccessMsg("");
    } else {
      setSuccessMsg("Failed to generate Customer ID.");
    }
  } catch (err) {
    console.error("Error generating ID:", err);
    setSuccessMsg("Server error while generating Customer ID.");
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: validateField(name, value) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !customerId) {
    setSuccessMsg("Please generate a Customer ID before saving.");
    return;
    }
    console.log("Saving customer:", form);
     try {
        const response = await fetch(`${domainName}admin-customer-registry/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            numberOfDevicePurchased: Number(form.numberOfDevicePurchased),
            isRegistered: false,
            id: customerId,
          }),
        });

        const data = await response.json();
        console.log("Save response:", data);

        if (response.ok) {
          setSuccessMsg("Customer added successfully!");
          setForm(initialForm);
          setCustomerId("");
          setIdGenerated(false);
        } else {
          setSuccessMsg("Failed to add customer.");
        }
      } catch (err) {
        console.error("Error saving customer:", err);
        setSuccessMsg("Server error while saving customer.");
      }
    };

  const handleCancel = () => {
    setForm(initialForm);
    setErrors({});
    setSuccessMsg("");
    setCustomerId("");
    setIdGenerated(false);
  };

  return (
    <div>
      <div className={styles.AddCustomerTitle}>
        <h5>Add a New Customer</h5>
        <p>
          Enter customer details below to register.
        </p>
      </div>
      <div className={styles.addCustomerForm}>
        <form onSubmit={handleSave}>
          <div className={styles.inputbox}>
          <label htmlFor="firstName">First Name *</label>
          <input
            className={styles.field}
            type="text"
            name="firstName"
            id="firstName"
            value={form.firstName || ""}
            onChange={handleChange}
            required
            placeholder="John"
          />
          {errors.firstName && <div style={{ color: "red", fontSize: "0.8em" }}>{errors.firstName}</div>}
        </div>

        <div className={styles.inputbox}>
          <label htmlFor="lastName">Last Name *</label>
          <input
            className={styles.field}
            type="text"
            name="lastName"
            id="lastName"
            value={form.lastName || ""}
            onChange={handleChange}
            required
            placeholder="Doe"
          />
          {errors.lastName && <div style={{ color: "red", fontSize: "0.8em" }}>{errors.lastName}</div>}
        </div>

        <div className={styles.inputbox}>
          <label htmlFor="username">Username *</label>
          <input
            className={styles.field}
            type="text"
            name="username"
            id="username"
            value={form.username || ""}
            onChange={handleChange}
            required
            placeholder="johndoe123"
          />
          {errors.username && <div style={{ color: "red", fontSize: "0.8em" }}>{errors.username}</div>}
        </div>
          <div className={styles.inputbox}>
            <label htmlFor="email">Email *</label>
            <input
              className={styles.field}
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
            {errors.email && <div style={{ color: "red" , fontSize: "0.8em"}}>{errors.email}</div>}
          </div>
          <div className={styles.inputbox}>
            <label htmlFor="phone">Phone Number *</label>
            <input
              className={styles.field}
              type="text"
              name="phone"
              id="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+94771234567"
            />
            {errors.phone && <div style={{ color: "red" , fontSize: "0.8em"}}>{errors.phone}</div>}
          </div>
          <div className={styles.inputbox}>
            <label htmlFor="organization">Organization *</label>
            <input
              className={styles.field}
              type="text"
              name="organization"
              id="organization"
              value={form.organization}
              onChange={handleChange}
              required
            />
            {errors.organization && <div style={{ color: "red" , fontSize: "0.8em" }}>{errors.organization}</div>}
          </div>
          <div className={styles.inputbox}>
            <label htmlFor="address">Address</label>
            <textarea
              className={styles.field}
              name="address"
              id="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
            />
            {errors.address && <div style={{ color: "red", fontSize: "0.8em" }}>{errors.address}</div>}
          </div>
          <div className={styles.inputbox}>
            <label htmlFor="numberOfDevicePurchased">Number of Devices Purchased *</label>
            <input
              className={styles.field}
              type="number"
              name="numberOfDevicePurchased"
              id="numberOfDevicePurchased"
              value={form.numberOfDevicePurchased}
              onChange={handleChange}
              required
              min={1}
            />
            {errors.numberOfDevicePurchased && (
              <div style={{ color: "red" , fontSize: "0.8em"}}>{errors.numberOfDevicePurchased}</div>
            )}
          </div>
          
          <div className={styles.actionSection}>
  
          <div className={styles.buttonWrapper}>
            <button
              type="button"
              className={styles.button}
              style={{ marginTop: "1rem" }}
              onClick={handleGenerateId}
              //disabled={Object.keys(errors).length > 0 || idGenerated}
            >
              Generate ID
            </button>
          </div>

          
          {customerId && (
            <div style={{ color: "blue", marginTop: "0.5rem", textAlign: "center" }}>
              Generated Customer ID: <strong>{customerId}</strong>
            </div>
          )}

          
          <div className={styles.buttonGroup} style={{ marginTop: "1rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              type="submit"
              className={styles.button}
              disabled={!customerId}
            >
              Save
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>

          {successMsg && (
        <div
          style={{
            color: successMsg.includes("successfully") ? "green" : "red",
            marginTop: "1rem",
            textAlign: "center",
          }}
        >
          {successMsg}
        </div>
      )}
    </div>
  </form>
</div>
</div>
  );
}
    