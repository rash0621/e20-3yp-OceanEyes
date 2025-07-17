"use client";
import { useEffect, useState } from "react";
import { domainName } from "../components/DomainName";
import styles from "./Profile.module.css";
import RequireAuth from "../components/RequireAuth";
import CircularProgress from "@mui/material/CircularProgress";

type Device = {
  id: string;
  deviceID: string;
  deviceName: string;
  deviceLocation: string;
};

type User = {
  id: string;
  userEmail: string;
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  organization: string;
  address: string;
  customerID: string;
  numberOfDevicePurchased: number;
  userPassword?: string;
  profilePhoto?: string;
  loggedInDevices?: Device[];
};

// Replace or integrate with your real notification / toast system
function showMessage(message: string, type: "success" | "error") {
  alert(`${type.toUpperCase()}: ${message}`);
}

export default function PersonalInfoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [editableUser, setEditableUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // For adding new devices
  const [deviceID, setDeviceID] = useState("");
  const [addedDevices, setAddedDevices] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.error("No token found in localStorage");
      setLoading(false);
      return;
    }
    fetch(`${domainName}user/me`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "SUCCESS") {
          setUser(data.data);
          setEditableUser(data.data); // Initialize editable copy
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEditClick = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setEditableUser(user);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editableUser) return;

    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(`${domainName}user/edit-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editableUser),
      });

      const result = await response.json();

      if (response.ok) {
        setUser(editableUser); // update current view
        setIsEditing(false);
      } else {
        alert(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error", error);
      alert("An error occurred while saving changes.");
    }
  };

  const handleInputChange = (field: keyof User, value: string | number) => {
    setEditableUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Add Device function
  const addDevice = async () => {
    if (!deviceID.trim()) {
      showMessage("Please enter a device ID.", "error");
      return;
    }

    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
      showMessage("Authentication token missing. Please register again.", "error");
      return;
    }

    try {
      // Step 1: Get user ID
      const userIdRes = await fetch(`${domainName}user/me/userID`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (!userIdRes.ok) {
        showMessage("Failed to fetch user ID. Please try again.", "error");
        return;
      }
      const { data: userId } = await userIdRes.json();

      // Step 2: Register the device
      const registerRes = await fetch(`${domainName}user/registerUserDevice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ deviceId: deviceID, userId }),
      });

      if (registerRes.ok) {
        setAddedDevices((prev) => [...prev, deviceID]);
        setDeviceID("");
        showMessage("Device registered successfully!", "success");
      } else {
        const errData = await registerRes.json().catch(() => null);
        showMessage(errData?.message || "Failed to register device. Please try again.", "error");
      }
    } catch (error) {
      console.error("Add device error:", error);
      showMessage("Network error. Please check your connection and try again.", "error");
    }
  };

  return (
    <RequireAuth>
      {loading ? (
        <div className={styles.loadingContainer}>
          <CircularProgress color="primary" size={60} />
          <div style={{ marginTop: "16px", fontSize: "1.2rem" }}>Loading...</div>
        </div>
      ) : !user || !editableUser ? (
        <div className={styles.loadingContainer}>User not found.</div>
      ) : (
        <div className={styles.personalInfoContainer}>
          <div className={styles.personalInfoHeader}>
            <div className={styles.profilePhoto}>
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" />
              ) : (
                <span className={styles.profileInitials}>
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </span>
              )}
            </div>
            <div className={styles.personalInfoTitle}>
              <h2>Personal Information</h2>
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.infoSectionWithButton}>
              <div className={styles.infoSection}>
                {[
                  { label: "Email", field: "userEmail" },
                  { label: "First Name", field: "firstName" },
                  { label: "Last Name", field: "lastName" },
                  { label: "Username", field: "username" },
                  { label: "Phone", field: "phone" },
                  { label: "Organization", field: "organization" },
                  { label: "Address", field: "address" },
                  { label: "Customer ID", field: "customerID" },
                  { label: "Number of Devices Purchased", field: "numberOfDevicePurchased" },
                ].map(({ label, field }) => (
                  <div className={styles.infoField} key={field}>
                    <label className={styles.fieldLabel}>{label}:</label>
                    {isEditing ? (
                      <input
                        className={styles.editInput}
                        type={field === "numberOfDevicePurchased" ? "number" : "text"}
                        value={editableUser[field as keyof User] as string | number}
                        onChange={(e) => handleInputChange(field as keyof User, e.target.value)}
                      />
                    ) : (
                      <div className={styles.fieldValue}>
                              {String(user[field as keyof User])}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!isEditing ? (
                <button className={styles.editButton} onClick={handleEditClick}>
                  Edit Profile
                </button>
              ) : (
                <div className={styles.editButtonGroup}>
                  <button className={styles.saveButton} onClick={handleSaveEdit}>
                    Save
                  </button>
                  <button className={styles.cancelButton} onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className={styles.devicesSection}>
              <h3 className={styles.devicesSectionTitle}>Devices</h3>

              <ul className={styles.devicesList}>
                {(user.loggedInDevices?.length || addedDevices.length) ? (
                  <>
                    {user.loggedInDevices?.map((device) => (
                      <li key={device.id} className={styles.deviceItem}>
                        <div>
                          <strong>Device ID:</strong> {device.id}
                        </div>
                        <div>
                          <strong>Name:</strong> {device.deviceName}
                        </div>
                        <div>
                          <strong>Location:</strong> {device.deviceLocation}
                        </div>
                      </li>
                    ))}
                    {addedDevices.map((id, idx) => (
                      <li key={`added-${idx}`} className={styles.deviceItem}>
                        <div>
                          <strong>Device ID:</strong> {id}
                        </div>
                        <div>
                          <em>Newly added device (details loading...)</em>
                        </div>
                      </li>
                    ))}
                  </>
                ) : (
                  <li className={styles.noDevices}>No devices registered</li>
                )}
              </ul>

              <div className={styles.addDeviceSection} style={{ marginTop: "1rem" }}>
                <input
                  type="text"
                  placeholder="Enter new device ID"
                  value={deviceID}
                  onChange={(e) => setDeviceID(e.target.value)}
                  className={styles.addDeviceInput}
                  style={{ padding: "0.5rem", width: "250px", marginRight: "10px" }}
                />
                <button
                  onClick={addDevice}
                  className={styles.addDeviceButton}
                  style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                >
                  Add Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}

