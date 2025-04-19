import RequireAuth from "../components/RequireAuth";

export default function ViewMap() {
    return (
      
          <RequireAuth>
            <div className="p-6 text-2xl font-bold">
               Map
            </div>
          </RequireAuth>
      
    );
  }
  