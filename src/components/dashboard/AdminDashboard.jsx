import React from "react";
import {
  Box,
  CssBaseline,
  Typography,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import NotificationsIcon from "@mui/icons-material/Notifications";

// Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    primary: {
      main: "#BB86FC",
    },
    secondary: {
      main: "#03DAC6",
    },
    text: {
      primary: "#FFFFFF",
    },
  },
});

const Dashboard = () => {
  // Dummy data - replace with API data
  const stats = [
    {
      title: "Total Users",
      value: 1500,
      icon: <PeopleIcon fontSize="large" />,
      color: "#BB86FC",
    },
    {
      title: "Total Blogs",
      value: 300,
      icon: <ArticleIcon fontSize="large" />,
      color: "#03DAC6",
    },
    {
      title: "Bookmarks",
      value: 1200,
      icon: <BookmarkIcon fontSize="large" />,
      color: "#FF9800",
    },
    {
      title: "Notifications",
      value: 800,
      icon: <NotificationsIcon fontSize="large" />,
      color: "#F44336",
    },
  ];

  const userGrowthData = [
    { month: "Jan", users: 400 },
    { month: "Feb", users: 600 },
    { month: "Mar", users: 800 },
    { month: "Apr", users: 1200 },
  ];

  const familyPlanData = [
    { name: "Conceiving", value: 60 },
    { name: "Avoid Pregnant", value: 40 },
  ];

  const COLORS = ["#BB86FC", "#03DAC6"];

  return (
    // <ThemeProvider theme={darkTheme}>
    //   <CssBaseline />
    //   <AppBar position="static" color="primary">
    //     <Toolbar>
    //       <Typography variant="h6">Analytics Dashboard</Typography>
    //     </Toolbar>
    //   </AppBar>

    <Box p={3}>
      {/* Stats Cards */}
      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid item xs={12} sm={6} md={5} width={"20%"} key={index}>
            <Card
              sx={{
                backgroundColor: item.color + "33",
                borderRadius: "16px",
              }}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h6">{item.title}</Typography>
                    <Typography variant="h4">{item.value}</Typography>
                  </Box>
                  <Box color={item.color}>{item.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={8} sx={{ width: "50%" }}>
          <Card sx={{ borderRadius: "16px" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                User Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <XAxis dataKey="month" stroke="#FFFFFF" />
                  <YAxis stroke="#FFFFFF" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#BB86FC"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} sx={{ width: "30%" }}>
          <Card sx={{ borderRadius: "16px" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Family Plan Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={familyPlanData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {familyPlanData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    // </ThemeProvider>
  );
};

export default Dashboard;
