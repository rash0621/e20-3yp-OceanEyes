"use client"

import { SetStateAction, useEffect, useState } from 'react';
import style from './Instances.module.css'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent } from "@mui/material";
import {domainName} from "../DomainName"
import AddInstance from "./AddInstance";

function GenerateInstances() {

  const token = localStorage.getItem("jwtToken");

  // return token ? <Outlet /> : <Navigate to="/login" />;
  let loggedInUser = {"isLoggedIn":true};

  const [instances, setInstances] = useState<InstanceType[]>([]);;    

  useEffect(()=>{
    loadData();
  },[])

  const loadData=async()=>{
    try{
      const result=await  axios.get(`${domainName}instance/allInstances`);
      setInstances(result.data);
    }catch(error){
      console.error("Error loading instances:", error);
    }
  }
   
  // Show the interface: Either for 'Add New' or 'Edit'
  const [showDiologBox, setshowDialogBox] = useState(false);
  const [editRow, setEditRow] = useState(false);  
  const [addRow, setAddRow] = useState(false);

  const [selectedInstance, setSelectedInstance] = useState<InstanceType | null>(null);
  
  //Initialize the object
  const [instance, setInstance] = useState({  
    instanceId: "",
    localDateTime: new Date(),
    deviceName: "",
    startGpsLocation: "",
    distanceBetweenPoints: 0,
    map: 0,
    description: "",
    operator: "",
    locationDistrict: ""
})

interface InstanceType {
    instanceId: string;
    localDateTime: Date;
    deviceName: string;
    startGpsLocation: string;
    distanceBetweenPoints: number;
    map: number;
    description: string;
    operator: string;
    locationDistrict: string;
  }

//Deconstruct the object
const {instanceId,deviceName,startGpsLocation,distanceBetweenPoints,map,localDateTime,description,operator,locationDistrict}=instance;
  
const onInputChange=(e: React.ChangeEvent<HTMLFormElement>)=>{
  setInstance({...instance,[e.target.name]:e.target.value})
};

//When 'Add New' button is clicked : Only For Add New
  const onAddNewClicked=()=>{
    setshowDialogBox(true);
    setAddRow(true);
    setEditRow(false);
    setViewRow(false); 
    setInstance({
        instanceId: "",
        localDateTime: new Date(),
        deviceName: "",
        startGpsLocation: "",
        distanceBetweenPoints: 0,
        map: 0,
        description: "",
        operator: "",
        locationDistrict: ""
    });
  }

  //When 'Add' button is clicked in the interface : Only For Add New
  const onAddSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    try {
      await axios.post(`${domainName}instance/save`, instance);
      // Reload the data after successful submission
      loadData();
      // Clear the form fields after successful submission if needed
      setshowDialogBox(false);
      setAddRow(false);
      alert("Instance added successfully!");
    } catch (error) {
      console.error("Error adding instance:", error);
      alert("Failed to add instance!");
    }
  };

  //When 'Edit' icon button is clicked : Only For Edit
  const onEditClick = (instance: InstanceType) => {
    setInstance(instance);
    setshowDialogBox(true);
    setAddRow(false);
    setEditRow(true);
    setViewRow(false); 
  }

  //When 'Update' button is clicked in the interface : Only Edit
  const onUpdateSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    const confirmUpdate = window.confirm('Are you sure you want to update this instance?');
    if (!confirmUpdate) return; 
    try {
      await axios.put(`http://localhost:8080/instance/update/${instance.instanceId}`, instance);
      // Optionally, reload the data after successful submission
      loadData();
      setEditRow(false);
      setshowDialogBox(false);
      alert("Instnace updated successfully!");
    } catch (error) {
      console.error("Error editing instance:", error);
      alert("Failed to update instance!");
    }
  };

  // When 'Discard' button is clicked: for Edit, and Add New
  const discardButtonClicked = () => {
    setshowDialogBox(false);
    setAddRow(false);    
    setEditRow(false);
  }

/******************************************************************************************/

/************************** Delete a specific entry *************************************/

const onDeleteClick = async (instanceId:string) => {
  console.log("Delete button clicked");
  console.log(instanceId);
  const confirmDelete = window.confirm('Are you sure you want to delete this instance?');
    if (!confirmDelete) return;  
    try {
      await axios.delete(`http://localhost:8080/instance/delete/${instanceId}`);
      loadData();
      alert('Instance deleted successfully');
    } catch (error) {
      console.error("Error deleting instance:", error);
      alert("Failed to delete instance!");
    }
}

/************************** View a specific entry *************************************/

const [viewRow, setViewRow] = useState(false);

const onViewClick = (instance:InstanceType) => {
  setSelectedInstance(instance);
  setViewRow(true);
  setEditRow(false);
  setAddRow(false);
  setshowDialogBox(true);
}

  // When 'Close' button is clicked: for view
  const closeButtonClicked = () => {
    setshowDialogBox(false);
    setSelectedInstance(null);
    setAddRow(false);    
    setEditRow(false);
    setViewRow(false);
  }

  return(
  <>
  
    <div className="pageTitle">
      <h3 className="text-4xl sm:text-6xl font-semibold text-center my-10 lh-81">Current Instances</h3>
    </div>
    <div className={style["container"]}>
      <AddInstance />
      <div className={style["tableContainer"]}>
          <table className={style["table"]}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Device Name</th>
                <th scope="col">Start GPS location</th>
                <th scope="col">Distance Between Points</th>
                {/* <th scope="col">Description</th> */}
                <th scope="col">Map</th>
                <th scope="col">Description</th>
                <th scope="col">Operator</th>
                <th scope="col">Location District</th>
              </tr>
            </thead>
            <tbody>
            {instances && Array.isArray(instances) && instances.map((instance: InstanceType, index: number) => (
                        <tr  key={instance.instanceId}>
                          <td>{instance.localDateTime.toLocaleString()}</td>
                          <td>{instance.deviceName}</td>
                          <td>{instance.startGpsLocation}</td>
                          <td>{instance.distanceBetweenPoints}</td>
                          <td>{instance.map}</td>
                          {/* <td>{instance.description}</td> */}
                          <td>{instance.operator}</td>
                          <td>{instance.locationDistrict}</td>
                          {loggedInUser.isLoggedIn && <td>
                            <div className='actionButtonsBloack'>
                              <button className='actionButton' onClick={() => onEditClick(instance)}><FontAwesomeIcon icon={faPen}/></button>
                              <button className='actionButton' onClick={() => onViewClick(instance)}><FontAwesomeIcon icon={faEye}/></button>
                              <button className='actionButton' onClick={() => onDeleteClick(instance.instanceId)}><FontAwesomeIcon icon={faTrash} /></button>
                            </div>         
                          </td>}
                        </tr>
                      ))
                    }
            </tbody>
            {/* <tfoot>
                <tr>
                    <td colSpan="9"><span>Last Modified: </span></td>
                </tr>
            </tfoot> */}
          </table>
      </div>
    </div>
    { (addRow || editRow) &&  <Dialog
          open={showDiologBox}
          onClose={discardButtonClicked}
          fullWidth
          maxWidth="md"
        >
      {/* Dialog- Add New/Edit/View */}
      {/* <DialogContent>
        <div className = "dataForm">          
          <form onSubmit={editRow ? (e:React.ChangeEvent<HTMLFormElement>)=>onUpdateSubmit(e) : (e: React.ChangeEvent<HTMLFormElement>)=>onAddSubmit(e)}>
              <div className = "formTitle">
                <h2>{editRow ? "Edit Deliverable" : "Add a New Deliverable"}</h2> 
              </div>
              <div className = "inputbox">
                <label>Work Package No</label>
                <input 
                    type = "text" 
                    className = "field" 
                    placeholder = "Enter Work Package No" 
                    name = "workPackageNo" 
                    value={deviceName} 
                    onChange={(e)=>onInputChange(e)}  
                    required/>
              </div>
              <div className = "inputbox">
                <label>Deliverable Related No</label>
                <input 
                    type = "text" 
                    className = "field"
                    placeholder = "Enter Deliverable Related No" 
                    name = "deliverableRelatedNo"  
                    value={deliverableRelatedNo} 
                    onChange={(e)=>onInputChange(e)} 
                    required/>
              </div>
              <div className = "inputbox">
                <label>Deliverable No</label>
                <input 
                    type = "text" 
                    className = "field" 
                    placeholder = "Enter Deliverable No" 
                    name = "deliverableNo" 
                    value={deliverableNo} 
                    onChange={(e)=>onInputChange(e)} 
                    required/>
              </div>
              <div className = "inputbox">
                <label>Deliverable Name</label>
                <input 
                    type = "text" 
                    className = "field" 
                    placeholder = "Enter Deliverable Name" 
                    name = "deliverableName" 
                    value={deliverableName} 
                    onChange={(e)=>onInputChange(e)} 
                    required/>
              </div>
              <div className = "inputbox">
                <label>Description</label>
                <textarea 
                    type = "text" 
                    className = "field" 
                    placeholder = "Enter Description" 
                    name = "description" 
                    value={description} 
                    onChange={(e)=>onInputChange(e)} 
                    required/>
              </div>
              <div className = "inputbox">
                <label>Lead Beneficiary</label>
                <input 
                    type = "text" 
                    className = "field" 
                    placeholder = "Enter Lead Beneficiary" 
                    name = "leadBeneficiary"  value={leadBeneficiary} 
                    onChange={(e)=>onInputChange(e)} 
                    required/>
              </div>
              <div className = "inputbox">
                <label>Type</label>
                <input 
                    type = "text" 
                    className = "field"
                    placeholder = "Enter Type" 
                    name = "type"  
                    value={type} 
                    onChange={(e)=>onInputChange(e)} 
                    required/>
              </div>
              <div className = "inputbox">
                <label>Dissemination Level</label>
                <input 
                    type = "text" 
                    className = "field" 
                    placeholder = "Enter Dissemination Level" 
                    name = "disseminationLevel"  
                    value={disseminationLevel} 
                    onChange={(e)=>onInputChange(e)} 
                    required/>
              </div>
              <div className = "inputbox">
                <label>Due Date</label>
                <input 
                    type = "date" 
                    className = "field" 
                    placeholder = "Select a Date" 
                    name = "dueDate"  
                    value={dueDate} 
                    onChange={(e)=>onInputChange(e)} 
                    required/>
              </div>
              <div className = "buttonsBlock">
                  {addRow? <button type = "submit">Add</button> : <button type = "submit">Update</button> }
                  <button type="button" onClick={discardButtonClicked}>Discard</button>
              </div>
            </form>
        </div>       
        </DialogContent>  */}
        </Dialog>}
                {/* Dialog- View*/}
        {/* {viewRow && <Dialog
          open={showDiologBox}
          onClose={closeButtonClicked}
          fullWidth
          maxWidth="md"
        >
        <DialogContent>
              <div>                
                    <table className={style["viewDetails"]}>
                        <tbody>
                            <tr>
                                <th>Work Package No</th>
                                <td>{selectedDeliverable.workPackageNo}</td>
                            </tr>
                            <tr>
                                <th>Deliverable Related No</th>
                                <td>{selectedDeliverable.deliverableRelatedNo}</td>
                            </tr>
                            <tr>
                                <th>Deliverable No</th>
                                <td>{selectedDeliverable.deliverableNo}</td>
                            </tr>
                            <tr>
                                <th>Deliverable Name</th>
                                <td>{selectedDeliverable.deliverableName}</td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>{selectedDeliverable.description}</td>
                            </tr>
                            <tr>
                                <th>Lead Beneficiary</th>
                                <td>{selectedDeliverable.leadBeneficiary}</td>
                            </tr>
                            <tr>
                                <th>Type</th>
                                <td>{selectedDeliverable.type}</td>
                            </tr>
                            <tr>
                                <th>Dissemination Level</th>
                                <td>{selectedDeliverable.disseminationLevel}</td>
                            </tr>
                            <tr>
                                <th>Due Date</th>
                                <td>{selectedDeliverable.dueDate}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className = "buttonsBlock"><button onClick={closeButtonClicked}>Close</button></div>
                </div>
      </DialogContent> 
    </Dialog>} */}
  </>
  );
}
  
export default GenerateInstances;