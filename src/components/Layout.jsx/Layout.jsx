import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Box } from "@mui/material";

const Layout = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <Box sx={{ flexGrow: 1, p: 2, bgcolor: "white" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
