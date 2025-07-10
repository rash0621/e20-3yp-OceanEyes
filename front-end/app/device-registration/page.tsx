"use client";
import React, { FormEvent, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import style from "./DeviceRegistration.module.css";
import { domainName } from "../components/DomainName";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const RequireAuth = dynamic(() => import('../components/RequireAuth'), { ssr: false });

// Hardcoded credentials (for demo)
const VALID_DEVICE_ID = "oceaneyesdevice001_001";
const PASSWORD = "ocean20251.eyes2/001";

const DeviceRegistration = () => {
  const [deviceName, setDeviceName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [email, setEmail] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"verifyDevice" | "enterPassword">("verifyDevice");
  const [message, setMessage] = useState("");

  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Step 1: Device verification
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (deviceId === VALID_DEVICE_ID) {
      const formData = new FormData();
      formData.append("access_key", "79daefad-dcdd-495e-8e56-a407363926ee");
      formData.append("subject", "Your Device Management Password");
      formData.append("from_name", "OceanEyes System");
      formData.append("reply_to", "no-reply@oceanyes.com");
      formData.append("to", email);
      formData.append("text", `Hello,\n\nHere is your password: ${PASSWORD}\n\nThank you!`);

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (json.success) {
          setMessage("Password sent! Check your email.");
          setStep("enterPassword");
        } else {
          setMessage("Email failed to send. Try again.");
        }
      } catch {
        setMessage("Error while sending email.");
      }
    } else {
      setMessage("Invalid Device ID.");
    }
  };

  // Step 2: Password validation and backend submission
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setMessage("Verified! Registering device...");

      const payload = {
        id: deviceId,
        deviceName: deviceName,
        email: email,
        devicePassword: PASSWORD,
      };

      try {
        const response = await fetch(`${domainName}device/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.status === "SUCCESS") {
          setMessage("Device registered successfully!");
          setTimeout(() => router.push("/device-management"), 1500);
        } else {
          setMessage(result.message || "Failed to register device.");
        }
      } catch (err) {
        console.error("Registration error:", err);
        setMessage("An unexpected error occurred.");
      }
    } else {
      setMessage("Incorrect password.");
    }
  };

  return (
    <RequireAuth>
      <div id="deviceregistration">
        <div className="pageTitle">
          <img src="/assets/nav/register.jpg" alt="OceanEyes Device"
            style={{ width: "200px", display: "block", margin: "10px auto" }} />
          <p className={style.DeviceRegistrationSubTitle}>
            Link your IoT device to our system to start receiving data
          </p>
        </div>

        <div className={style.deviceRegistrationForm}>
          {step === "verifyDevice" && (
            <form onSubmit={handleVerify}>
              <div className={style.inputbox}>
                <label>Device ID</label>
                <input type="text" className={style.field} value={deviceId} onChange={e => setDeviceId(e.target.value)} required placeholder="Enter Device ID" />
              </div>
              <div className={style.inputbox}>
                <label>Device Name</label>
                <input type="text" className={style.field} value={deviceName} onChange={e => setDeviceName(e.target.value)} required placeholder="Enter Device Name" />
              </div>
              <div className={style.inputbox}>
                <label>Email</label>
                <input type="email" className={style.field} value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
              </div>
              <button type="submit" className={style.submitButton}>Request Password</button>
              {message && <p style={{ color: "red" }}>{message}</p>}
            </form>
          )}

          {step === "enterPassword" && (
            <form onSubmit={handlePasswordSubmit}>
              <div className={style.inputbox}>
                <label>Enter Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={style.field}
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Enter Password"
                    required
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      color: '#666',
                    }}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </span>
                </div>
              </div>
              <button type="submit" className={style.submitButton}>Verify and Register</button>
              {message && <p style={{ color: passwordInput === PASSWORD ? "green" : "red" }}>{message}</p>}
            </form>
          )}
        </div>
      </div>
    </RequireAuth>
  );
};

export default DeviceRegistration;
