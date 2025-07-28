import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Colors for charts
const COLORS = ["#ec407a", "#d81b60", "#f48fb1", "#f06292"];

const ReportingPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  // Dummy Data
  const userGrowthData = [
    { month: "Jan", users: 100 },
    { month: "Feb", users: 150 },
    { month: "Mar", users: 200 },
    { month: "Apr", users: 250 },
    { month: "May", users: 300 },
  ];

  const userStatusData = [
    { name: "Single", value: 300 },
    { name: "Married", value: 150 },
    { name: "Pregnant", value: 50 },
  ];

  const familyPlanData = [
    { name: "Conceiving", value: 200 },
    { name: "AvoidPregnant", value: 100 },
  ];

  const cycleData = [
    { month: "Jan", cycles: 40 },
    { month: "Feb", cycles: 60 },
    { month: "Mar", cycles: 55 },
    { month: "Apr", cycles: 70 },
  ];

  const topBlogs = [
    { title: "Understanding Menstrual Cycles", reactions: 120 },
    { title: "Healthy Tips During Period", reactions: 100 },
    { title: "Myths About Menstruation", reactions: 90 },
  ];

  const reportData = [
    { name: "Total Users", value: 500 },
    { name: "Active Users", value: 420 },
    { name: "Average Cycle Length", value: "28 Days" },
    { name: "Average Period Length", value: "5 Days" },
    { name: "Total Blogs", value: 35 },
    { name: "Total Reactions", value: 850 },
  ];

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Metric,Value"];
    const rows = reportData.map((item) => `${item.name},${item.value}`);
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "report.xlsx");
  };

  // Export PDF
  const exportToPDF = () => {
    const input = document.body; // capture full page
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("report.pdf");
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff0f5",
        minHeight: "100vh",
        p: "1.5rem",
        maxWidth: "1400px",
        margin: "auto",
        fontSize: "0.9rem",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: "#d81b60",
          fontWeight: "bold",
          mb: "1.5rem",
          fontSize: "1.6rem",
        }}
      >
        Reports & Analytics
      </Typography>

      {/* Filters */}
      <Box
        display="flex"
        gap="1rem"
        mb="1.5rem"
        flexWrap="wrap"
        sx={{ fontSize: "0.85rem" }}
      >
        <TextField
          type="date"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          type="date"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: "150px" }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Single">Single</MenuItem>
          <MenuItem value="Married">Married</MenuItem>
          <MenuItem value="Pregnant">Pregnant</MenuItem>
        </TextField>
        <TextField
          select
          label="Family Plan"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          sx={{ width: "180px" }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Conceiving">Conceiving</MenuItem>
          <MenuItem value="AvoidPregnant">Avoid Pregnant</MenuItem>
        </TextField>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#ec407a",
            "&:hover": { backgroundColor: "#d81b60" },
            px: "1rem",
          }}
        >
          Apply
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb="2rem">
        {reportData.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                borderRadius: "16px",
                textAlign: "center",
                p: "1rem",
                minHeight: "100px",
              }}
            >
              <CardContent>
                <Typography
                  variant="body1"
                  sx={{ color: "#d81b60", fontSize: "1rem" }}
                >
                  {item.name}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", fontSize: "1.3rem" }}
                >
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* User Growth */}
        <Grid item xs={12} md={8} sx={{ width: "50%" }}>
          <Card sx={{ borderRadius: "16px", p: "1rem", height: "350px" }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#d81b60", mb: "0.8rem" }}
            >
              User Growth Over Time
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#ec407a"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        {/* Users by Status */}
        <Grid item xs={12} md={4} sx={{ width: "30%" }}>
          <Card sx={{ borderRadius: "16px", p: "1rem", height: "350px" }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#d81b60", mb: "0.8rem" }}
            >
              Users by Status
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={userStatusData}
                  dataKey="value"
                  outerRadius={80}
                  fill="#ec407a"
                  label
                >
                  {userStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Cycles per Month */}
        <Grid item xs={12} md={8} sx={{ width: "50%" }}>
          <Card sx={{ borderRadius: "16px", p: "1rem", height: "350px" }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#d81b60", mb: "0.8rem" }}
            >
              Cycles Tracked per Month
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={cycleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cycles" fill="#ec407a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Family Plan */}
        <Grid item xs={12} md={4} sx={{ width: "30%" }}>
          <Card sx={{ borderRadius: "16px", p: "1rem", height: "350px" }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#d81b60", mb: "0.8rem" }}
            >
              Users by Family Plan
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={familyPlanData}
                  dataKey="value"
                  outerRadius={80}
                  fill="#f48fb1"
                  label
                >
                  {familyPlanData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Top Blogs */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: "16px", p: "1rem" }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#d81b60", mb: "0.8rem" }}
            >
              Top Liked Blogs
            </Typography>
            {topBlogs.map((blog, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: "0.5rem 0",
                  borderBottom: "1px solid #f8bbd0",
                }}
              >
                <Typography>{blog.title}</Typography>
                <Typography sx={{ color: "#d81b60", fontWeight: "bold" }}>
                  {blog.reactions} Reactions
                </Typography>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>

      {/* Export Buttons */}
      <Box
        textAlign="right"
        mt="2rem"
        display="flex"
        justifyContent="flex-end"
        gap="1rem"
      >
        <Button
          variant="contained"
          onClick={exportToCSV}
          sx={{ backgroundColor: "#ec407a" }}
        >
          Export CSV
        </Button>
        <Button
          variant="contained"
          onClick={exportToExcel}
          sx={{ backgroundColor: "#f48fb1" }}
        >
          Export Excel
        </Button>
        <Button
          variant="contained"
          onClick={exportToPDF}
          sx={{ backgroundColor: "#d81b60" }}
        >
          Export PDF
        </Button>
      </Box>
    </Box>
  );
};

export default ReportingPage;
