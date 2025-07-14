"use client";
import { useEffect, useState } from "react";
import { domainName } from "../components/DomainName";
import { ClickAwayListener } from "@mui/material";

type User = {
  id: string;
  userEmail: string;
  // Add other fields as needed
};

export default function PersonalInfoPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }
  console.log(`Token: [${token}]`);
//     console.log("Token:", token);
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
      });
  }, []);
  
  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.userEmail}</p>
      {/* Add more fields as needed */}
    </div>
  );
}