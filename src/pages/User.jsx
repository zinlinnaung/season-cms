import { useState, useRef } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import UserApiDataTable from "../components/User/DataTable";
import axios from "axios";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
};

const UsersPage = () => {
  const token = localStorage.getItem("access_token");
  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : {};
  const pageId = user?.pageId || null;

  const tableRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    pageId: pageId,
    name: "",
    phone: "",
    password: "",
    role: "User",
  });

  // ✅ Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "error" | "warning" | "info" | "success"
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for adding
  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      pageId: pageId,
      name: "",
      phone: "",
      password: "",
      role: "User",
    });
    setOpen(true);
  };

  // Open modal for editing
  const handleEdit = async (row) => {
    try {
      const res = await axios.get(
        `https://node.tharapa.ai/api_order/msg_order_users/${row.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data;
      setFormData({
        pageId: data.pageId,
        name: data.name,
        phone: data.phone,
        password: "",
        role: data.role,
      });

      setSelectedUserId(row.id);
      setEditMode(true);
      setOpen(true);
    } catch (error) {
      showSnackbar("Failed to load user details", "error");
    }
  };

  // Submit (Add or Update)
  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.phone) {
        showSnackbar("Name and Username are required", "warning");
        return;
      }

      const url = editMode
        ? `https://node.tharapa.ai/api_order/msg_order_users/${selectedUserId}`
        : "https://node.tharapa.ai/api_order/msg_order_users";

      const method = editMode ? "put" : "post";

      const res = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        showSnackbar(
          editMode ? "User updated successfully!" : "User added successfully!",
          "success"
        );
        setOpen(false);
        tableRef.current?.refetch();
      } else {
        showSnackbar("Operation failed", "error");
      }
    } catch (err) {
      showSnackbar("Error occurred while saving user", "error");
    }
  };

  return (
    <Box p={2}>
      {/* Header section */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Users</Typography>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add User
        </Button>
      </Stack>

      {/* Table */}
      <UserApiDataTable
        ref={tableRef}
        apiUrl="https://node.tharapa.ai/api_order/msg_order_users_with_paginate"
        onEdit={handleEdit}
      />

      {/* Modal Form */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            {editMode ? "Edit User" : "Add New User"}
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Username"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              required
            />
            {!editMode && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
              />
            )}
            <TextField
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </TextField>

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={() => setOpen(false)} variant="outlined">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
              >
                {editMode ? "Update" : "Save"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      {/* ✅ Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;
