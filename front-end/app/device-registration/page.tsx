"use client";
import React, { FormEvent } from "react";
import style from "./DeviceRegistration.module.css";
import { domainName } from "../components/DomainName";
import RequireAuth from "../components/RequireAuth";

const DeviceRegistration = () => {
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      id: formData.get("deviceId"),
      deviceName: formData.get("deviceName"),
      devicePassword: formData.get("password"),
    };

    try {
      const response = await fetch(`${domainName}device/addDevice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Response:", result);

      if (result.status === "SUCCESS") {
        alert("Device registered successfully!");
        form.reset();
      } else {
        alert(result.message ||"Failed to register device.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <RequireAuth>
    <div id="deviceregistration">
      <div className={style.DeviceRegistrationTitle}>
        <h5>Register IoT Device</h5>
        <p className={style.DeviceRegistrationSubTitle}>
          Link your IoT device to our system to start receiving data
        </p>
      </div>

      <div className={style.deviceRegistrationForm}>
        <form onSubmit={onSubmit}>
          <div className={style.inputbox}>
            <label htmlFor="deviceId">Device ID</label>
            <input
              type="text"
              id="deviceId"
              name="deviceId"
              className={style.field}
              placeholder="Enter Device ID"
              required
            />
          </div>

          <div className={style.inputbox}>
            <label htmlFor="deviceName">Device Name</label>
            <input
              type="text"
              id="deviceName"
              name="deviceName"
              className={style.field}
              placeholder="Enter Device Name"
              required
            />
          </div>

          <div className={style.inputbox}>
            <label htmlFor="password">Device Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className={style.field}
              placeholder="Enter Password"
              required
            />
          </div>

          <button type="submit" className={style.submitButton}>
            Register Device
          </button>
        </form>
      </div>
    </div>
    </RequireAuth>
  );
};

export default DeviceRegistration;
