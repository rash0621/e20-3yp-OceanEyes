"use client"

import { SetStateAction, useEffect, useState } from 'react';
import style from './Captures.module.css'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent } from "@mui/material";
import {domainName} from "../DomainName"

function GenerateInstances() {

  const token = localStorage.getItem("jwtToken");

  // return token ? <Outlet /> : <Navigate to="/login" />;
  let loggedInUser = {"isLoggedIn":true};

  const [captures, setCaptures] = useState<CaptureType[]>([]);;    

  useEffect(()=>{
    loadData();
  },[])

  const loadData=async()=>{
    try{
      const result=await  axios.get(`${domainName}capture/allCaptures`);
      setCaptures(result.data);
    }catch(error){
      console.error("Error loading captures:", error);
    }
  }
   
  // Show the interface: Either for 'Add New' or 'Edit'
  const [showDiologBox, setshowDialogBox] = useState(false);
  const [editRow, setEditRow] = useState(false);  
  const [addRow, setAddRow] = useState(false);

  const [selectedCapture, setSelectedCapture] = useState<CaptureType | null>(null);
  
  //Initialize the object
  const [capture, setCapture] = useState({  
    distance: "",
    imageId: ""
})

interface CaptureType {
    distance: string;
    imageId: string;
  }

//Deconstruct the object
const {distance, imageId}=capture;
  
const onInputChange=(e: React.ChangeEvent<HTMLFormElement>)=>{
  setCapture({...capture,[e.target.name]:e.target.value})
};

//When 'Add New' button is clicked : Only For Add New
  const onAddNewClicked=()=>{
    setshowDialogBox(true);
    setAddRow(true);
    setEditRow(false);
    setViewRow(false); 
    setCapture({
        distance: "",
        imageId: ""
    });
  }

  //When 'Add' button is clicked in the interface : Only For Add New
  const onAddSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    try {
      await axios.post(`${domainName}capture/save`, capture);
      // Reload the data after successful submission
      loadData();
      // Clear the form fields after successful submission if needed
      setshowDialogBox(false);
      setAddRow(false);
      alert("Capture added successfully!");
    } catch (error) {
      console.error("Error adding capture:", error);
      alert("Failed to add capture!");
    }
  };

  //When 'Edit' icon button is clicked : Only For Edit
  const onEditClick = (capture: CaptureType) => {
    setCapture(capture);
    setshowDialogBox(true);
    setAddRow(false);
    setEditRow(true);
    setViewRow(false); 
  }

  //When 'Update' button is clicked in the interface : Only Edit
  const onUpdateSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    const confirmUpdate = window.confirm('Are you sure you want to update this capture?');
    if (!confirmUpdate) return; 
    try {
      await axios.put(`http://localhost:8080/capture/update/${capture.captureId}`, capture);
      // Optionally, reload the data after successful submission
      loadData();
      setEditRow(false);
      setshowDialogBox(false);
      alert("Instnace updated successfully!");
    } catch (error) {
      console.error("Error editing capture:", error);
      alert("Failed to update capture!");
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

const onDeleteClick = async (captureId:string) => {
  console.log("Delete button clicked");
  console.log(captureId);
  const confirmDelete = window.confirm('Are you sure you want to delete this capture?');
    if (!confirmDelete) return;  
    try {
      await axios.delete(`http://localhost:8080/capture/delete/${captureId}`);
      loadData();
      alert('Capture deleted successfully');
    } catch (error) {
      console.error("Error deleting capture:", error);
      alert("Failed to delete capture!");
    }
}

/************************** View a specific entry *************************************/

const [viewRow, setViewRow] = useState(false);

const onViewClick = (capture:CaptureType) => {
  setSelectedCapture(capture);
  setViewRow(true);
  setEditRow(false);
  setAddRow(false);
  setshowDialogBox(true);
}

  // When 'Close' button is clicked: for view
  const closeButtonClicked = () => {
    setshowDialogBox(false);
    setSelectedCapture(null);
    setAddRow(false);    
    setEditRow(false);
    setViewRow(false);
  }

  return(
  <>
  
    <div className="pageTitle">
      <h3 className="text-4xl sm:text-6xl font-semibold text-center my-10 lh-81">Current Captures</h3>
    </div>
    <div className={style["container"]}>
      <div className={style["tableContainer"]}>
          <table className={style["table"]}>
            <thead>
              <tr>
                <th scope="col">Distance</th>
                <th scope="col">Image Id</th>
              </tr>
            </thead>
            <tbody>
            {captures && Array.isArray(captures) && captures.map((capture: CaptureType, index: number) => (
                        <tr  key={capture.captureId}>
                          <td>{capture.distance}</td>
                          <td>{capture.imageId}</td>
                          {loggedInUser.isLoggedIn && <td>
                            <div className='actionButtonsBloack'>
                              <button className='actionButton' onClick={() => onEditClick(capture)}><FontAwesomeIcon icon={faPen}/></button>
                              <button className='actionButton' onClick={() => onViewClick(capture)}><FontAwesomeIcon icon={faEye}/></button>
                              <button className='actionButton' onClick={() => onDeleteClick(capture.captureId)}><FontAwesomeIcon icon={faTrash} /></button>
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
     
        </Dialog>}
  </>
  );
}
  
export default GenerateInstances;