import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { DataGrid, GridToolbar, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";

const UserApiDataTable = forwardRef(
  ({ apiUrl = "", pageSize = 10, columns, onEdit }, ref) => {
    const token = localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user"));
    const pageId = user?.pageId ?? null;

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
      page: 0,
      pageSize,
    });
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const getRoleColor = (role) => {
      const roleColors = {
        admin: "error",
        user: "primary",
        moderator: "secondary",
        manager: "success",
        editor: "warning",
      };
      return roleColors[role?.toLowerCase()] || "default";
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { page, pageSize } = paginationModel;
        const res = await axios.get(`${apiUrl}`, {
          params: {
            page: page + 1,
            limit: pageSize,
            pageId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = res.data.data ?? [];
        const total = res.data.total ?? data.length;

        const normalized = data.map((item, index) => ({
          id: item.id ?? item._id ?? index + 1,
          ...item,
        }));

        setRows(normalized);
        setRowCount(total);
      } catch (err) {
        if (err.response.status === 403) {
          setError("You don't have access to use User.");
        } else {
          setError(
            err.response?.data?.message || err.message || "Unknown error"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refetch: fetchData,
    }));

    const handleDelete = async () => {
      if (!deleteTarget) return;
      setDeleting(true);
      try {
        await axios.delete(
          `https://node.tharapa.ai/api_order/msg_order_users/${deleteTarget.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setSnackbar({
          open: true,
          message: "User deleted successfully!",
          severity: "success",
        });
        setDeleteTarget(null);
        fetchData();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to delete user",
          severity: "error",
        });
      } finally {
        setDeleting(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, [apiUrl, paginationModel.page, paginationModel.pageSize]);

    const defaultColumns = [
      { field: "id", headerName: "ID", width: 90 },
      { field: "name", headerName: "Name", width: 200, flex: 1 },
      { field: "phone", headerName: "Username", width: 150 },
      {
        field: "role",
        headerName: "Role",
        width: 150,
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={getRoleColor(params.value)}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 120,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<Edit />}
            label="Edit"
            color="inherit"
            onClick={() => onEdit && onEdit(params.row)}
          />,
          <GridActionsCellItem
            icon={<Delete />}
            label="Delete"
            color="inherit"
            onClick={() => setDeleteTarget(params.row)}
          />,
        ],
      },
    ];

    return (
      <Box sx={{ height: 600, width: "100%" }}>
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography>Loading...</Typography>
          </Box>
        )}
        {error && <Typography color="error">{error}</Typography>}

        <DataGrid
          rows={rows}
          columns={columns ?? defaultColumns}
          rowCount={rowCount}
          loading={loading}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          components={{ Toolbar: GridToolbar }}
        />

        <Dialog
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              color="error"
              onClick={handleDelete}
              disabled={deleting}
              variant="contained"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

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
      </Box>
    );
  }
);

export default UserApiDataTable;
