import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deliveryPrice, setDeliveryPrice] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const normalizeCustomers = (data) =>
    data.map((c) => ({
      ...c,
      is_confirm: !!c.is_confirm,
      is_cancle: !!c.is_cancle,
    }));

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "https://node.tharapa.ai/api/customer-other"
      );
      setCustomers(normalizeCustomers(response.data));
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
      setSnackbarMessage("Failed to fetch customer data.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleConfirmClick = (row) => {
    setSelectedRow(row);
    setDeliveryPrice(""); // Reset input when dialog opens
    setDialogOpen(true);
  };

  const handleCancelClick = async (row) => {
    try {
      await axios.post(
        `https://node.tharapa.ai/api/customer-other/cancel/${row.id}`
      );
      await fetchCustomers();
      setSnackbarMessage(`❌ Canceled customer ID: ${row.id}`);
      setSnackbarSeverity("info");
    } catch (error) {
      console.error("Error during cancellation:", error);
      setSnackbarMessage("❌ Failed to cancel customer.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRow(null);
    setDeliveryPrice("");
  };

  const handleDialogConfirm = async () => {
    try {
      if (!selectedRow) return;

      if (!deliveryPrice.trim()) {
        setSnackbarMessage("Please enter a delivery price.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      // Confirm customer
      await axios.post(
        `https://node.tharapa.ai/api/customer-other/confirm/${selectedRow.id}`
      );

      // Build message with user name and delivery price
      const messageToSend = `${selectedRow.name} order အတည်ပြုပြီးပါပြီ။ delivery price ${deliveryPrice} ကျသင့်ပါတယ် ခင်ဗျာ`;

      await axios.post("https://node.tharapa.ai/api/send_message", {
        fb_subscriber_id: selectedRow.fb_subscriber_id,
        fb_page_id: selectedRow.fb_page_id,
        message: messageToSend,
      });

      await fetchCustomers();

      setSnackbarMessage(
        `✅ Confirmed and messaged customer ID: ${selectedRow.id}`
      );
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error during confirmation:", error);
      setSnackbarMessage("❌ Failed to confirm or send message.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      setDialogOpen(false);
      setSelectedRow(null);
      setDeliveryPrice("");
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "social_id", headerName: "Social ID", width: 120 },
    { field: "price", headerName: "Price", width: 120 },
    { field: "address", headerName: "Address", width: 200 },
    { field: "created_at", headerName: "Created At", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => handleConfirmClick(params.row)}
            disabled={params.row.is_confirm || params.row.is_cancle}
          >
            Confirm
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleCancelClick(params.row)}
            disabled={params.row.is_confirm || params.row.is_cancle}
          >
            Cancel
          </Button>
        </Box>
      ),
    },
  ];

  const orderCustomers = customers.filter((c) => !c.is_confirm && !c.is_cancle);
  const confirmedCustomers = customers.filter((c) => c.is_confirm);
  const canceledCustomers = customers.filter((c) => c.is_cancle);

  const getCurrentTabData = () => {
    if (tabIndex === 0) return orderCustomers;
    if (tabIndex === 1) return confirmedCustomers;
    return canceledCustomers;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Orders List
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="Order Tabs"
        sx={{ mb: 2 }}
      >
        <Tab label="Order" />
        <Tab label="Confirm" />
        <Tab label="Cancel" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={getCurrentTabData()}
            columns={columns}
            getRowId={(row) => row.id}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
          />
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="confirm-dialog-title">Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description" sx={{ mb: 2 }}>
            Are you sure you want to confirm the action for{" "}
            <strong>{selectedRow?.name}</strong> (ID: {selectedRow?.id})?
          </DialogContentText>

          <TextField
            autoFocus
            label="Delivery Price"
            fullWidth
            variant="outlined"
            value={deliveryPrice}
            onChange={(e) => setDeliveryPrice(e.target.value)}
            placeholder="Enter delivery price"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDialogConfirm}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerPage;
