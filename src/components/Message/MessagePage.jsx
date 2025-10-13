import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  Paper,
} from "@mui/material";
import axios from "axios";

const MessagePage = () => {
  const token = localStorage.getItem("access_token");
  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : {};
  const pageId = user?.pageId || null;
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingMessage, setExistingMessage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" | "error" | "warning" | "info",
  });

  // ===== Fetch from API =====
  const fetchMessage = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://node.tharapa.ai/msg/order-message", {
        params: {
          pageId: pageId,
        },
      });
      console.log('res data: ', res.data)
      if (res.data) {
        const msg = res.data.order_confirm_msg ? res.data.order_confirm_msg : '';
        setExistingMessage(msg);
        setMessage(msg || "");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setSnackbar({
        open: true,
        message: "Failed to load message.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== Create / Update =====
  const handleSave = async () => {
    if (!message.trim()) {
      setSnackbar({
        open: true,
        message: "Message cannot be empty.",
        severity: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      const id = existingMessage?.id || 1;
      const payload = {
        pageId: id,
        text: message,
      };

      await axios.put(
        `https://node.tharapa.ai/msg/order-message/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSnackbar({
        open: true,
        message: existingMessage
          ? "Message updated successfully!"
          : "Message created successfully!",
        severity: "success",
      });

      setExistingMessage({ id, text: message });
    } catch (err) {
      console.error("Save failed:", err);
      setSnackbar({
        open: true,
        message: "Failed to save message.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  return (
    <Paper
      sx={{
        maxWidth: 600,
        p: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6">Order Confirm Message</Typography>
      <Typography variant="caption">
        {
          'For the delivery fee and total price, use "{{ }}" to write, for example - {{delivery}}, {{grandTotal}}'
        }
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "flex-start", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Message"
            multiline
            minRows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : existingMessage ? "Update" : "Create"}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default MessagePage;
