import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  CssBaseline,
} from "@mui/material";

const NotificationPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [receiver, setReceiver] = useState("all");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSendNotification = async () => {
    if (!title || !content) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields!",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSnackbar({
        open: true,
        message: "Notification sent successfully!",
        severity: "success",
      });
      setTitle("");
      setContent("");
      setReceiver("all");
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to send notification!",
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: "#fff0f5", // light pink background
          minHeight: "80vh",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: "#d81b60", fontWeight: "bold" }}
        >
          Send Notification
        </Typography>

        <Grid container spacing={3}>
          {/* Left side - Form */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: "16px",
                backgroundColor: "#ffffff",
                boxShadow: 3,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2} sx={{ color: "#d81b60" }}>
                  Notification Details
                </Typography>
                <TextField
                  fullWidth
                  label="Title"
                  variant="outlined"
                  margin="normal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Content"
                  variant="outlined"
                  multiline
                  rows={4}
                  margin="normal"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Receiver</InputLabel>
                  <Select
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="active">Active Users</MenuItem>
                    <MenuItem value="inactive">Inactive Users</MenuItem>
                  </Select>
                </FormControl>

                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    disabled={loading}
                    onClick={handleSendNotification}
                    sx={{
                      borderRadius: "12px",
                      px: 4,
                      backgroundColor: "#ec407a",
                      "&:hover": { backgroundColor: "#d81b60" },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right side - Preview */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: "16px",
                backgroundColor: "#ffffff",
                boxShadow: 3,
              }}
            >
              <CardContent>
                <Typography variant="h6" mb={2} sx={{ color: "#d81b60" }}>
                  Preview
                </Typography>
                <Box
                  sx={{
                    backgroundColor: "#ffe4e9",
                    borderRadius: "12px",
                    p: 2,
                    minHeight: "150px",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#d81b60", fontWeight: "bold" }}
                  >
                    {title || "Notification Title"}
                  </Typography>
                  <Typography variant="body2" mt={1} sx={{ color: "#333" }}>
                    {content || "Your notification content will appear here."}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default NotificationPage;
