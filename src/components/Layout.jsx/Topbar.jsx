import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const Topbar = () => {
  return (
    <AppBar
      position="static"
      sx={{ bgcolor: "#def5fd", color: "black" }}
      elevation={1}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" component="div">
          Admin Dashboard
        </Typography>
        <Box>
          {/* <IconButton color="inherit">
            <DarkModeIcon />
          </IconButton> */}
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
