import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout";
import StaffLayout from "../layouts/StaffLayout";
import Login from "../pages/Login";
import StaffRegister from "../pages/StaffRegister";
import ChangePassword from "../pages/ChangePassword";
import Dashboard from "../pages/Dashboard";
import StaffDashboard from "../pages/StaffDashboard";
import Residents from "../pages/Residents";
import ResidentDetails from "../pages/ResidentDetails";
import Letters from "../pages/Letters";
import LetterReview from "../pages/LetterReview";
import Issues from "../pages/Issues";
import Announcements from "../pages/Announcements";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import StaffManagement from "../pages/StaffManagement";

function AdminProtected({ children }) {
  const {isAuthenticated,isAdmin}=useAuth();
  if(!isAuthenticated) return <Navigate to="/login" replace/>;
  if(!isAdmin) return <Navigate to="/login" replace/>;
  return children;
}

function StaffProtected({ children }) {
  const {isAuthenticated,isStaff}=useAuth();
  if(!isAuthenticated) return <Navigate to="/login" replace/>;
  if(!isStaff) return <Navigate to="/login" replace/>;
  return children;
}

// Either an admin or an approved staff member - used for the shared
// change-password screen only.
function AnyProtected({ children }) {
  const {isAuthenticated,isAdmin,isStaff}=useAuth();
  if(!isAuthenticated) return <Navigate to="/login" replace/>;
  if(!isAdmin && !isStaff) return <Navigate to="/login" replace/>;
  return children;
}

export default function AppRoutes(){
 return <Routes>
   <Route path="/login" element={<Login/>}/>
   <Route path="/staff/register" element={<StaffRegister/>}/>
   <Route path="/change-password" element={<AnyProtected><ChangePassword/></AnyProtected>}/>

   <Route path="/" element={<AdminProtected><AdminLayout/></AdminProtected>}>
     <Route index element={<Navigate to="/dashboard" replace/>}/>
     <Route path="dashboard" element={<Dashboard/>}/>
     <Route path="residents" element={<Residents/>}/>
     <Route path="residents/:id" element={<ResidentDetails/>}/>
     <Route path="staff-management" element={<StaffManagement/>}/>
     <Route path="letters" element={<Letters/>}/>
     <Route path="letters/:referenceNumber" element={<LetterReview/>}/>
     <Route path="issues" element={<Issues/>}/>
     <Route path="announcements" element={<Announcements/>}/>
     <Route path="reports" element={<Reports/>}/>
     <Route path="settings" element={<Settings/>}/>
   </Route>

   <Route path="/staff" element={<StaffProtected><StaffLayout/></StaffProtected>}>
     <Route index element={<Navigate to="/staff/dashboard" replace/>}/>
     <Route path="dashboard" element={<StaffDashboard/>}/>
     <Route path="residents" element={<Residents/>}/>
     <Route path="residents/:id" element={<ResidentDetails/>}/>
     <Route path="issues" element={<Issues/>}/>
   </Route>

   <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes>;
}
