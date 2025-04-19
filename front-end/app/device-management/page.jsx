import RequireAuth from "../components/RequireAuth";

export default function DeviceManagement() {
    return (
      
      <RequireAuth>
      <div className="p-6 text-2xl font-bold">
        Device Management Page
      </div>
      
      </RequireAuth>
    );
  }
  