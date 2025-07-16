"use client";
import { useEffect, useState } from "react";
import { domainName } from "../components/DomainName";
import { ClickAwayListener } from "@mui/material";
import styles from "./Profile.module.css";
import RequireAuth from "../components/RequireAuth";
import CircularProgress from "@mui/material/CircularProgress";

type Device = { id: string; deviceName: string; /* ... */ };
type User = {
  id: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePhoto?: string; // Add this for profile photo URL
  loggedInDevices?: Device[];
  // Add other fields as needed
};

export default function PersonalInfoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        "Content-Type": "application/json"
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "SUCCESS") setUser(data.data);
        console.log(data.status);
        setLoading(false);
      })
    .catch(() => {
      setLoading(false); 
    });
  }, []);

  const handleEditClick = () => {
    // Add edit functionality here
    console.log("Edit button clicked");
  };

  return (
    <RequireAuth>
       {loading ? (
        <div className={styles.loadingContainer} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
          <CircularProgress color="primary" size={60} />
          <div style={{ marginTop: "16px", fontSize: "1.2rem" }}>Loading...</div>
        </div>
      ) : !user ? (
        <div className={styles.loadingContainer}>User not found.</div>
      ) : (
        <div className={styles.personalInfoContainer}>
            <div className={styles.personalInfoHeader}>
              <div className={styles.profilePhoto}>
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" />
                ) : (
                  <span className={styles.profileInitials}>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
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
                  <div className={styles.infoField}>
                    <label className={styles.fieldLabel}>Email:</label>
                    <div className={styles.fieldValue}>{user.userEmail}</div>
                  </div>
                  
                  <div className={styles.infoField}>
                    <label className={styles.fieldLabel}>First Name:</label>
                    <div className={styles.fieldValue}>{user.firstName}</div>
                  </div>
                  
                  <div className={styles.infoField}>
                    <label className={styles.fieldLabel}>Last Name:</label>
                    <div className={styles.fieldValue}>{user.lastName}</div>
                  </div>
                  
                  <div className={styles.infoField}>
                    <label className={styles.fieldLabel}>Username:</label>
                    <div className={styles.fieldValue}>{user.username}</div>
                  </div>
                </div>
                
                <button className={styles.editButton} onClick={handleEditClick}>
                  Edit Profile
                </button>
              </div>
              
              <div className={styles.devicesSection}>
                <h3 className={styles.devicesSectionTitle}>Devices</h3>
                <ul className={styles.devicesList}>
                  {user?.loggedInDevices?.length ? (
                    user.loggedInDevices.map(device => (
                      <li key={device.id} className={styles.deviceItem}>
                        {device.deviceName}
                      </li>
                    ))
                  ) : (
                    <li className={styles.noDevices}>No devices registered</li>
                  )}
                </ul>
              </div>
            </div>

        </div>
      )}
    </RequireAuth>
  );
}



    