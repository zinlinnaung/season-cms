import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TableContainer,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import "antd/dist/reset.css";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import * as XLSX from "xlsx";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [expandedRow, setExpandedRow] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelRow, setCancelRow] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    products: [], // ✅ store products as array of { code, price, quantity }
  });

  const handleExport = () => {
    if (!filteredData.length) {
      setSnackbarMessage("⚠ No data to export.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    // prepare data for export
    const exportData = filteredData.map((row) => ({
      ID: row.id,
      Name: row.name,
      Phone: row.phone,
      Address: row.address,
      CreatedAt: new Date(row.created_at).toLocaleString("en-GB"),
      Products: row.products
        .map((p) => `${p.name} (x${p.quantity})`)
        .join(", "),
      Total: row.products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    XLSX.writeFile(workbook, `orders_export_${Date.now()}.xlsx`);
  };

  // open edit dialog
  const handleEditClick = (row) => {
    const productCodes = row.social_id
      ? row.social_id
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c !== "")
      : [];

    const productPrices = row.price
      ? row.price
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== "")
      : [];

    const productQuantities = row.email
      ? row.email
          .split(",")
          .map((q) => q.trim())
          .filter((q) => q !== "")
      : [];

    const products = productCodes.map((code, idx) => ({
      code,
      price: productPrices[idx] || "",
      quantity: productQuantities[idx] || "",
    }));

    setEditForm({
      name: row.name || "",
      phone: row.phone || "",
      address: row.address || "",
      products,
    });

    setSelectedRow(row);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedRow(null);
  };

  // save edited data
  const handleEditSave = async () => {
    try {
      if (!selectedRow) return;

      const social_id = editForm.products.map((p) => p.code).join(",");
      const price = editForm.products.map((p) => p.price).join(",");
      const email = editForm.products.map((p) => p.quantity).join(",");

      await axios.put(
        `https://node.tharapa.ai/api/customer-other/update/${selectedRow.id}`,
        {
          name: editForm.name,
          phone: editForm.phone,
          address: editForm.address,
          social_id,
          price,
          email,
        }
      );

      setSnackbarMessage(`✅ Updated customer ID: ${selectedRow.id}`);
      setSnackbarSeverity("success");
      await fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      setSnackbarMessage("❌ Failed to update customer.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      setEditDialogOpen(false);
      setSelectedRow(null);
    }
  };

  // --- Burmese number helpers ---
  function burmeseToEnglishNumber(str) {
    const map = {
      "၀": "0",
      "၁": "1",
      "၂": "2",
      "၃": "3",
      "၄": "4",
      "၅": "5",
      "၆": "6",
      "၇": "7",
      "၈": "8",
      "၉": "9",
    };
    return str.replace(/[၀-၉]/g, (m) => map[m]);
  }

  // Normalize API data
  // Normalize API data
  const normalizeCustomers = (data) =>
    data.map((c) => {
      // --- product names ---
      const productNames = c.social_id
        ? c.social_id
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s) // ignore empty strings including leading commas
        : [];

      // --- product prices ---
      const productPrices = c.price
        ? c.price
            .split(",")
            .map((p) => {
              const numStr = burmeseToEnglishNumber(p.replace(/[^\d၀-၉]/g, ""));
              return parseInt(numStr, 10) || 0;
            })
            .filter((p) => p > 0) // ignore empty/invalid prices
        : [];

      // --- product quantities ---
      const productQuantities = c.email
        ? c.email
            .split(",")
            .map((q) => {
              const numStr = burmeseToEnglishNumber(q.replace(/[^\d၀-၉]/g, ""));
              return parseInt(numStr, 10) || 0; // use 0 for empty/invalid
            })
            .filter((q) => q > 0) // keep only real quantities
        : [];

      // --- combine into products ---
      const products = productNames.map((name, idx) => ({
        name,
        price: productPrices[idx] || 0,
        quantity: productQuantities[idx] || 1,
      }));

      return {
        ...c,
        is_confirm: !!c.is_confirm,
        is_cancle: !!c.is_cancle,
        products,
        deli_fee: 0,
      };
    });

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

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  const handleCancelClick = (row) => {
    setCancelRow(row);
    setCancelDialogOpen(true);
  };
  const handleCancelConfirm = async () => {
    try {
      if (!cancelRow) return;

      // 1. Cancel backend
      await axios.post(
        `https://node.tharapa.ai/api/customer-other/cancel/${cancelRow.id}`
      );

      // 2. Send message if provided
      if (cancelMessage.trim()) {
        await axios.post("https://node.tharapa.ai/api/send_message", {
          fb_subscriber_id: cancelRow.fb_subscriber_id,
          fb_page_id: cancelRow.fb_page_id,
          message: cancelMessage.trim(),
        });
      }

      setSnackbarMessage(
        `❌ Cancelled and messaged customer ID: ${cancelRow.id}`
      );
      setSnackbarSeverity("warning");
      await fetchCustomers();
    } catch (error) {
      console.error("Error cancelling order:", error);
      setSnackbarMessage("❌ Failed to cancel order.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      setCancelDialogOpen(false);
      setCancelRow(null);
      setCancelMessage(""); // reset
    }
  };

  // Close cancel dialog
  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setCancelRow(null);
  };

  const handleConfirmClick = (row) => {
    setSelectedRow(row);
    setDeliveryPrice(0);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRow(null);
    setDeliveryPrice(0);
  };

  const handleDialogConfirm = async () => {
    try {
      if (!selectedRow) return;

      if (!deliveryPrice) {
        setSnackbarMessage("Please enter a delivery price.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      // Confirm backend
      await axios.post(
        `https://node.tharapa.ai/api/customer-other/confirm/${selectedRow.id}`
      );

      // Calculate totals
      const productTotal = selectedRow.products.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );

      const delivery = parseInt(deliveryPrice, 10) || 0;
      const grandTotal = productTotal + delivery;

      const messageToSend = `
လူကြီးမင်းရဲ့ Order လေးကို စစ်ဆေးပြီးပါပြီရှင် ။ 
ပို့်ဆောင်ခ စျေးနှုန်းလေးကတော့ ${delivery} MMK ပါရှင့်။
မှာယူထားတဲ့မုန့်လေးတွေရယ် ပို့ဆောင်ခ စျေးနှုန်းလေးနဲ့ ဆိုရင် 
Total - ${grandTotal} MMK ကျသင့်ပါတယ်ရှင် ။ 

မှာယူအားပေးမှုအတွက် ကျေးဇူးအထူးတင်ရှိပါတယ်ရှင့်။
"အရသာရှိရှိ သုံးဆောင်ပါရှင်။"
      `.trim();

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
      setDeliveryPrice(0);
    }
  };

  const getCurrentTabData = () => {
    if (tabIndex === 0)
      return customers.filter((c) => !c.is_confirm && !c.is_cancle);
    if (tabIndex === 1) return customers.filter((c) => c.is_confirm);
    return customers.filter((c) => c.is_cancle);
  };

  const filteredData = getCurrentTabData().filter((record) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      record.name?.toLowerCase().includes(term) ||
      record.phone?.toLowerCase().includes(term) ||
      record.email?.toLowerCase().includes(term) ||
      record.social_id?.toLowerCase().includes(term) ||
      record.address?.toLowerCase().includes(term);

    if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1])
      return matchesSearch;

    const start = dayjs(dateRange[0]).startOf("day");
    const end = dayjs(dateRange[1]).endOf("day");
    const recordDate = dayjs(record.created_at);

    return matchesSearch && recordDate.isBetween(start, end, null, "[]");
  });

  // Calculate live total for dialog
  const dialogProductTotal = selectedRow
    ? selectedRow.products.reduce((sum, p) => sum + p.price * p.quantity, 0)
    : 0;
  const dialogGrandTotal =
    dialogProductTotal + (parseInt(deliveryPrice, 10) || 0);

  return (
    <Container maxWidth="xl" sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Orders List
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Order" />
        <Tab label="Confirm" />
        <Tab label="Cancel" />
      </Tabs>

      <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#1C1C1C" }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 250, backgroundColor: "#fff", borderRadius: 2 }}
        />

        <Box display="flex" gap={2}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ minWidth: 250 }}
          />
          <Button
            variant="contained"
            sx={{ backgroundColor: "#fed700", color: "black" }}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          sx={{
            maxHeight: "60vh",
            border: "1px solid black",
            borderRadius: 2,
            maxHeight: "60vh",
            border: "1px solid black",
            borderRadius: 2,
            "&::-webkit-scrollbar": {
              width: "6px", // 👈 narrow scrollbar
              height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#fed700", // scrollbar color
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#555",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: "#fed700" }} />
                <TableCell sx={{ backgroundColor: "#fed700" }}>ID</TableCell>
                <TableCell sx={{ backgroundColor: "#fed700" }}>Name</TableCell>
                <TableCell sx={{ backgroundColor: "#fed700" }}>Phone</TableCell>
                <TableCell sx={{ backgroundColor: "#fed700" }}>
                  Address
                </TableCell>
                <TableCell sx={{ backgroundColor: "#fed700" }}>
                  Created At
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => {
                const isExpanded = expandedRow === row.id;
                return (
                  <React.Fragment key={row.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setExpandedRow(isExpanded ? null : row.id)
                          }
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.address}</TableCell>
                      <TableCell>
                        {new Date(row.created_at).toLocaleString("en-GB")}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={6}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box margin={2}>
                            <Typography variant="subtitle1" gutterBottom>
                              Invoice
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>No</TableCell>
                                  <TableCell>Product Name</TableCell>
                                  <TableCell>Price</TableCell>
                                  <TableCell>Quantity</TableCell>
                                  <TableCell>Amount</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {row.products.map((p, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>
                                      {p.price.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{p.quantity}</TableCell>
                                    <TableCell>
                                      {(p.price * p.quantity).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell colSpan={4} align="right">
                                    Total
                                  </TableCell>
                                  <TableCell>
                                    {row.products
                                      .reduce(
                                        (sum, p) => sum + p.price * p.quantity,
                                        0
                                      )
                                      .toLocaleString()}
                                  </TableCell>
                                </TableRow>
                                {/* <TableRow>
                                  <TableCell colSpan={4} align="right">
                                    Deli Fee
                                  </TableCell>
                                  <TableCell>
                                    {row.deli_fee?.toLocaleString()}
                                  </TableCell>
                                </TableRow> */}
                                <TableRow>
                                  <TableCell colSpan={4} align="right">
                                    Net Amount
                                  </TableCell>
                                  <TableCell>
                                    {(
                                      row.products.reduce(
                                        (sum, p) => sum + p.price * p.quantity,
                                        0
                                      ) + (row.deli_fee || 0)
                                    ).toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                            <Box mt={2} display="flex" gap={2}>
                              <Button
                                variant="contained"
                                color="primary"
                                disabled={row.is_confirm || row.is_cancle}
                                onClick={() => handleConfirmClick(row)}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="contained"
                                sx={{
                                  backgroundColor: "#fed700",
                                  color: "black",
                                }}
                                onClick={() => handleEditClick(row)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                disabled={row.is_cancle}
                                onClick={() => handleCancelClick(row)}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          {/* Customer Info */}
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={editForm.phone}
            onChange={(e) =>
              setEditForm({ ...editForm, phone: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            value={editForm.address}
            onChange={(e) =>
              setEditForm({ ...editForm, address: e.target.value })
            }
          />

          {/* Product Table */}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Products
            </Typography>
            <Table
              size="small"
              sx={{ border: "1px solid #ddd", borderRadius: 2 }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editForm.products.length > 0 ? (
                  editForm.products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          variant="standard"
                          size="medium"
                          sx={{ minWidth: 150, borderBottom: "none" }}
                          value={product.code}
                          onChange={(e) => {
                            const newProducts = [...editForm.products];
                            newProducts[index].code = e.target.value;
                            setEditForm({ ...editForm, products: newProducts });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant="standard"
                          size="small"
                          value={product.price}
                          onChange={(e) => {
                            const newProducts = [...editForm.products];
                            newProducts[index].price = e.target.value;
                            setEditForm({ ...editForm, products: newProducts });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant="standard"
                          size="small"
                          value={product.quantity}
                          onChange={(e) => {
                            const newProducts = [...editForm.products];
                            newProducts[index].quantity = e.target.value;
                            setEditForm({ ...editForm, products: newProducts });
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => {
                            const newProducts = editForm.products.filter(
                              (_, i) => i !== index
                            );
                            setEditForm({ ...editForm, products: newProducts });
                          }}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No products
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Add Row Button */}
            <Box mt={2} textAlign="left">
              <Button
                variant="outlined"
                onClick={() => {
                  setEditForm({
                    ...editForm,
                    products: [
                      ...editForm.products,
                      { code: "", price: "", quantity: "" },
                    ],
                  });
                }}
              >
                + Add Product
              </Button>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* confirm dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Confirm Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirm order for <strong>{selectedRow?.name}</strong> (ID:{" "}
            {selectedRow?.id})
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Delivery Price"
            fullWidth
            type="number"
            value={deliveryPrice}
            onChange={(e) => setDeliveryPrice(e.target.value)}
          />
          <Typography variant="body1" mt={2}>
            Product Total: {dialogProductTotal.toLocaleString()} MMK
          </Typography>
          <Typography variant="body1">
            Grand Total: {dialogGrandTotal.toLocaleString()} MMK
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogConfirm} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCancelDialogClose}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel the order for{" "}
            <strong>{cancelRow?.name}</strong> (ID: {cancelRow?.id})?
          </DialogContentText>

          <TextField
            margin="dense"
            label="Message to Customer"
            fullWidth
            multiline
            minRows={3}
            value={cancelMessage}
            onChange={(e) => setCancelMessage(e.target.value)}
            placeholder="Type the message you want to send to customer..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose}>No</Button>
          <Button
            onClick={handleCancelConfirm}
            variant="contained"
            color="error"
          >
            Yes, Cancel
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
