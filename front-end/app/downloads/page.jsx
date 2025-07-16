"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { domainName } from "../components/DomainName";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSpinner, faImage, faCalendar, faClock, faMapMarkerAlt, faFileAlt } from "@fortawesome/free-solid-svg-icons";

const RequireAuth = dynamic(() => import("../components/RequireAuth"), { ssr: false });

export default function DownloadsPage() {
  const [groupedInstances, setGroupedInstances] = useState({});
  const [instanceImages, setInstanceImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(null);
  const pdfRef = useRef();

  useEffect(() => {
    const fetchTurns = async () => {
      try {
        const response = await axios.get(`${domainName}turn/allTurns`);
        const grouped = response.data.reduce((acc, turn) => {
          acc[turn.instanceId] = acc[turn.instanceId] || [];
          acc[turn.instanceId].push(turn);
          return acc;
        }, {});
        
        // Sort turns by date and time for each instance and take only latest 4
        Object.keys(grouped).forEach(instanceId => {
          grouped[instanceId].sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB - dateA; // Sort in descending order (latest first)
          });
          // Keep only the latest 4 turns
          grouped[instanceId] = grouped[instanceId].slice(0, 4);
        });
        
        setGroupedInstances(grouped);
        
        // Fetch images for all turns
        await fetchAllImages(grouped);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchTurns();
  }, []);

  const fetchAllImages = async (grouped) => {
    const imagePromises = {};
    
    for (const [instanceId, turns] of Object.entries(grouped)) {
      imagePromises[instanceId] = {};
      
      for (const turn of turns) {
        try {
          const response = await axios.get(`${domainName}capture/images/turn/${turn.id}`);
          if (response.data.status === "SUCCESS") {
            imagePromises[instanceId][turn.id] = response.data.data;
          } else {
            imagePromises[instanceId][turn.id] = [];
          }
        } catch (err) {
          imagePromises[instanceId][turn.id] = [];
        }
      }
    }
    
    setInstanceImages(imagePromises);
  };

  const generatePDF = async (instanceId) => {
    setGeneratingPDF(instanceId);
    const pdfContent = pdfRef.current;
    
    if (!pdfContent) {
      console.error("PDF content ref not found");
      setGeneratingPDF(null);
      return;
    }

    try {
      // Hide all instance sections except the target
      const allSections = pdfContent.querySelectorAll(".instance-section");
      allSections.forEach((section) => {
        section.style.display = "none";
      });

      const target = pdfContent.querySelector(`#instance-${instanceId}`);
      if (!target) {
        console.error(`Target instance ${instanceId} not found`);
        setGeneratingPDF(null);
        return;
      }
      
      target.style.display = "block";
      target.style.position = "relative";
      target.style.zIndex = "1";

      // Wait a bit for the element to be visible
      await new Promise(resolve => setTimeout(resolve, 100));

      // Wait for images to load
      const images = target.querySelectorAll('img');
      console.log(`Found ${images.length} images to load`);
      
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn(`Failed to load image: ${img.src}`);
              resolve();
            };
            // Set a timeout to avoid hanging
            setTimeout(() => resolve(), 3000);
          }
        });
      }));

      console.log("All images loaded, generating canvas...");

      // Generate PDF with better quality
      const canvas = await html2canvas(target, { 
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: target.scrollWidth,
        height: target.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure the cloned document has the same styles
          const clonedTarget = clonedDoc.querySelector(`#instance-${instanceId}`);
          if (clonedTarget) {
            clonedTarget.style.display = "block";
            clonedTarget.style.position = "relative";
          }
        }
      });
      
      console.log("Canvas generated, creating PDF...");
      
      const imgData = canvas.toDataURL("image/png", 0.8);
      
      // Calculate PDF dimensions for A4
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If content is too tall, we might need multiple pages
      const maxHeight = 297; // A4 height in mm
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      if (pdfHeight <= maxHeight) {
        // Single page
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      } else {
        // Multiple pages
        const pageCount = Math.ceil(pdfHeight / maxHeight);
        const canvasHeight = canvas.height;
        const pageHeight = canvasHeight / pageCount;
        
        for (let i = 0; i < pageCount; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          const sourceY = i * pageHeight;
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, pageHeight, 0, 0, canvas.width, pageHeight);
          const pageImgData = pageCanvas.toDataURL("image/png", 0.8);
          
          pdf.addImage(pageImgData, "PNG", 0, 0, pdfWidth, maxHeight);
        }
      }
      
      console.log("PDF created, saving...");
      
      // Save the PDF
      pdf.save(`Instance_${instanceId}_Report.pdf`);
      
      console.log("PDF saved successfully");

      // Restore all sections
      allSections.forEach((section) => {
        section.style.display = "block";
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Error generating PDF: ${error.message}`);
    } finally {
      setGeneratingPDF(null);
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-blue-100">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <FontAwesomeIcon icon={faSpinner} spin className="relative text-6xl text-blue-600 mb-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Ocean Data</h2>
              <p className="text-gray-600">Fetching instances and images...</p>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <img
        src="/assets/nav/downloads.jpg"
        alt="OceanEyes Device"
        style={{ width: "200px", display: "block", margin: "10px auto" }}
      />
          </div>

          {Object.keys(groupedInstances).length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <FontAwesomeIcon icon={faFileAlt} className="text-6xl text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Instances Found</h3>
                <p className="text-gray-600">No data available for download at this time.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedInstances).map((instanceId) => {
                const totalImages = Object.values(instanceImages[instanceId] || {}).reduce((sum, imgs) => sum + imgs.length, 0);
                const latestTurn = groupedInstances[instanceId][0];
                
                return (
                  <div
                    key={instanceId}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden "
                  >
                    <div style={{ backgroundColor: '#1b335aff' }} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-white bg-opacity-20 p-3 ">
                            <FontAwesomeIcon icon={faFileAlt} className="text-white text-2xl" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                              Instance {instanceId}
                            </h2>
                            <div className="flex items-center space-x-4 text-blue-100 text-white">
                              <span className="flex items-center space-x-1">
                                <FontAwesomeIcon icon={faCalendar} className="text-sm" />
                                <span className="text-sm">Latest: {latestTurn?.date}</span>
                              </span>
                              <span className="flex items-center space-x-1 text-white">
                                <FontAwesomeIcon icon={faClock} className="text-sm" />
                                <span className="text-sm">{latestTurn?.time}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                          <img
        src="/assets/downloads/turns.png"
        alt="OceanEyes Device"
        style={{ width: "70px", display: "block", margin: "10px auto" }}
      />
                          <div className="text-2xl font-bold text-blue-800">
                            {groupedInstances[instanceId].length}
                          </div>
                          <div className="text-sm text-blue-600">Latest Turns</div>
                        </div>
                        
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                          <img
        src="/assets/downloads/img.png"
        alt="OceanEyes Device"
        style={{ width: "70px", display: "block", margin: "10px auto" }}
      />
                          <div className="text-2xl font-bold text-green-800">
                            {totalImages}
                          </div>
                          <div className="text-sm text-green-600">Total Images</div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                          <img
        src="/assets/downloads/gps.png"
        alt="OceanEyes Device"
        style={{ width: "90px", display: "block", margin: "10px auto" }}
      />
                          <div className="text-sm font-semibold text-purple-800">
                            {latestTurn?.gpsLocationLatitude === 0 ? 'N/A' : 'GPS Available'}
                          </div>
                          <div className="text-xs text-purple-600">Location Data</div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={() => generatePDF(instanceId)}
                          disabled={generatingPDF === instanceId}
                          className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            generatingPDF === instanceId
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          }`}
                          style={generatingPDF !== instanceId ? { backgroundColor: '#357aebff' } : {}}
                        >
                          {generatingPDF === instanceId ? (
                            <>
                              <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                              <span>Generating PDF...</span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faDownload} className="text-lg" />
                              <span>Download Report</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hidden PDF Content */}
        <div ref={pdfRef} style={{ position: 'absolute', left: '-9999px', top: '0' }}>
          {Object.entries(groupedInstances).map(([instanceId, instanceTurns]) => (
            <div
              key={instanceId}
              id={`instance-${instanceId}`}
              className="instance-section"
              style={{
                background: "#fff",
                color: "#000",
                width: "800px",
                maxWidth: "800px",
                padding: "40px",
                fontFamily: "Arial, sans-serif",
                lineHeight: "1.6",
                boxSizing: "border-box"
              }}
            >
              {/* Header */}
              <div style={{ 
                textAlign: "center", 
                marginBottom: "30px",
                borderBottom: "3px solid #2563eb",
                paddingBottom: "20px"
              }}>
                <h1 style={{ 
                  fontSize: "28px", 
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 10px 0"
                }}>
                  OceanEyes Instance Report
                </h1>
                <h2 style={{ 
                  fontSize: "20px", 
                  color: "#4b5563",
                  margin: "0"
                }}>
                  Instance ID: {instanceId}
                </h2>
                <p style={{ 
                  fontSize: "14px", 
                  color: "#6b7280",
                  margin: "10px 0 0 0"
                }}>
                  Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
              </div>

              {/* Summary */}
              <div style={{ 
                backgroundColor: "#f8fafc",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "30px",
                border: "1px solid #e2e8f0"
              }}>
                <h3 style={{ 
                  fontSize: "18px", 
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 15px 0"
                }}>
                  Summary
                </h3>
                <div>
                  <div>
                    <p style={{ margin: "5px 0", fontSize: "14px" }}>
                      <strong>Latest Turns:</strong> {instanceTurns.length}
                    </p>
                    <p style={{ margin: "5px 0", fontSize: "14px" }}>
                      <strong>Date Range:</strong> {instanceTurns[instanceTurns.length - 1]?.date} - {instanceTurns[0]?.date}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: "5px 0", fontSize: "14px" }}>
                      <strong>Total Images:</strong> {Object.values(instanceImages[instanceId] || {}).reduce((sum, imgs) => sum + imgs.length, 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Turn Details */}
              <h3 style={{ 
                fontSize: "20px", 
                fontWeight: "bold",
                color: "#1f2937",
                margin: "0 0 20px 0",
                borderBottom: "2px solid #e5e7eb",
                paddingBottom: "10px"
              }}>
                Latest Turn Details
              </h3>

              {instanceTurns.map((turn, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    marginBottom: "25px",
                    padding: "20px",
                    backgroundColor: "#fafafa",
                    pageBreakInside: "avoid"
                  }}
                >
                  <h4 style={{ 
                    fontSize: "16px", 
                    fontWeight: "bold",
                    color: "#374151",
                    margin: "0 0 15px 0"
                  }}>
                    Turn {idx + 1} {idx === 0 ? "(Latest)" : idx === 1 ? "(Previous)" : `(${idx + 1} ago)`}
                  </h4>
                  
                  {/* Turn Information Table */}
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "15px",
                    fontSize: "14px"
                  }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db", backgroundColor: "#f9fafb", fontWeight: "bold", width: "30%" }}>
                          Date
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>
                          {turn.date}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db", backgroundColor: "#f9fafb", fontWeight: "bold" }}>
                          Time
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>
                          {turn.time}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db", backgroundColor: "#f9fafb", fontWeight: "bold" }}>
                          Latitude
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>
                          {turn.gpsLocationLatitude === 0 ? "N/A" : turn.gpsLocationLatitude}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db", backgroundColor: "#f9fafb", fontWeight: "bold" }}>
                          Longitude
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>
                          {turn.gpsLocationLongitude === 0 ? "N/A" : turn.gpsLocationLongitude}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Images section */}
                  {instanceImages[instanceId]?.[turn.id] && instanceImages[instanceId][turn.id].length > 0 && (
                    <div style={{ marginTop: "15px" }}>
                      <h5 style={{ 
                        fontSize: "14px", 
                        fontWeight: "bold",
                        color: "#374151",
                        margin: "0 0 10px 0"
                      }}>
                        Captured Images ({instanceImages[instanceId][turn.id].length})
                      </h5>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "10px",
                        marginTop: "10px"
                      }}>
                        {instanceImages[instanceId][turn.id].map((img, i) => (
                          <div key={i} style={{ textAlign: "center" }}>
                            <img
                              src={`${domainName}${img}`}
                              alt={`Turn ${idx + 1} Image ${i + 1}`}
                              style={{
                                width: "120px",
                                height: "90px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                border: "1px solid #d1d5db"
                              }}
                            />
                            <p style={{ 
                              fontSize: "10px", 
                              color: "#6b7280",
                              margin: "5px 0 0 0"
                            }}>
                              Image {i + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(!instanceImages[instanceId]?.[turn.id] || instanceImages[instanceId][turn.id].length === 0) && (
                    <p style={{ 
                      fontSize: "12px", 
                      color: "#6b7280",
                      fontStyle: "italic",
                      margin: "15px 0 0 0"
                    }}>
                      No images captured for this turn.
                    </p>
                  )}
                </div>
              ))}

              {/* Footer */}
              <div style={{
                marginTop: "40px",
                padding: "20px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                textAlign: "center",
                fontSize: "12px",
                color: "#6b7280"
              }}>
                <p style={{ margin: "0" }}>
                  This report was generated by OceanEyes System<br/>
                  Report contains the latest {instanceTurns.length} turn(s) with {Object.values(instanceImages[instanceId] || {}).reduce((sum, imgs) => sum + imgs.length, 0)} total images
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}