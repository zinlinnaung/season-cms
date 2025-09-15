// Sidebar.jsx
import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1090px)");

  // Theme colors
  const selectedColor = "#FFD700"; // Gold
  const hoverColor = "#FFC700"; // Slightly darker gold on hover
  const textColor = "#FFFFFF"; // White
  const sidebarBg = "#1C1C1C"; // Dark sidebar background
  const headerBg = "#111111"; // Dark header background

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  ];

  const handleDrawerToggle = () => setOpen(!open);

  const handleLogout = () => {
    localStorage.removeItem("auth"); // Clear login/session
    navigate("/login", { replace: true });
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Section: Logo/Title */}
      <Box>
        <Box
          sx={{
            p: 2,
            bgcolor: headerBg,
            textAlign: "center",
            borderBottom: "1px solid #333",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color={textColor}>
            My Admin
          </Typography>
        </Box>

        {/* Menu Items */}
        <List sx={{ mt: 2 }}>
          {menuItems.map(({ text, icon, path }) => {
            const selected = location.pathname === path;
            return (
              <ListItem
                button
                key={text}
                component={Link}
                to={path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  backgroundColor: selected ? selectedColor : "transparent",
                  "&:hover": {
                    backgroundColor: selected
                      ? selectedColor // keep gold if already selected
                      : hoverColor,
                  },
                  "& .MuiListItemText-primary": {
                    color: selected ? "#111" : textColor,
                    fontWeight: selected ? "bold" : "normal",
                  },
                  "& .MuiListItemIcon-root": {
                    color: selected ? "#111" : textColor,
                  },
                  transition: "background-color 0.3s, color 0.3s",
                }}
              >
                <ListItemIcon sx={{ color: selected ? "#111" : textColor }}>
                  {icon}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section: Logout */}
      <Box>
        <Divider sx={{ bgcolor: "#333" }} />
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            "&:hover": { backgroundColor: hoverColor },
            "& .MuiListItemText-primary": {
              color: textColor,
              fontWeight: "bold",
            },
            "& .MuiListItemIcon-root": { color: textColor },
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            color: textColor,
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 1301,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: sidebarBg,
            color: textColor,
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
