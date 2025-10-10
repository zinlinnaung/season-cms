import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
// import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";

const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // const phoneRegex = /^09\d{6,9}$/;
    // if (!phoneRegex.test(phone)) {
    //   setError("ဖုန်းနံပါတ်သည် 09 ဖြင့်စတင်ရပါမည်။");
    //   setIsLoading(false);
    //   return;
    // }

    try {
      const res = await axios.post(
        "https://node.tharapa.ai/api_order/msg_order_login",
        {
          phone,
          password,
        }
      );
  
      localStorage.setItem("access_token", res.data.token);
  
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("username သို့မဟုတ် စကားဝှက် မှားနေပါသည်။");
      } else {
        setError("Server ပြဿနာရှိနေပါသည်။ နောက်မှပြန်ကြိုးစားပါ။");
      }
    } finally {
      setIsLoading(false);
    }

    // try {
    //   const response = await axios.post(
    //     "https://megawecare.tharapa.ai/api/authentication/i/login",
    //     { phone, password }
    //   );
    //   const { access_token, refresh_token } = response.data;
    //   localStorage.setItem("access_token", access_token);
    //   localStorage.setItem("refresh_token", refresh_token);
    //   navigate("/dashboard");
    // } catch (err) {
    //   if (err.response && err.response.status === 401) {
    //     setError("username သို့မဟုတ် စကားဝှက် မှားနေပါသည်။");
    //   } else {
    //     setError("Server ပြဿနာရှိနေပါသည်။ နောက်မှပြန်ကြိုးစားပါ။");
    //   }
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fff0f5", // Light pink background
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      {/* Logo */}
      <Box
        component="img"
        src="season.png"
        alt="Logo"
        sx={{
          width: { xs: "45%", sm: "140px", md: "8%", lg: "8%" },
          mb: 3,
        }}
      />

      {/* Login Card */}
      <Paper
        elevation={4}
        sx={{
          width: { xs: "100%", sm: "90%", md: "500px" },
          borderRadius: 4,
          backgroundColor: "#ffe4ec", // Pink card
          p: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: "bold",
            textAlign: "center",
            color: "#d81b60", // Deep pink text
          }}
        >
          Login
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          {/* Phone */}
          <TextField
            label="username ထည့်ပါ"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            disabled={isLoading}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
                borderRadius: "12px",
              },
            }}
            InputProps={{
              startAdornment: <PersonIcon sx={{ color: "#d81b60" }} />,
            }}
          />

          {/* Password */}
          <TextField
            label="စကားဝှက်ထည့်ပါ"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            disabled={isLoading}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
                borderRadius: "12px",
              },
            }}
            InputProps={{
              startAdornment: <LockIcon sx={{ color: "#d81b60" }} />,
            }}
          />

          {error && <Alert severity="error">{error}</Alert>}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#ec407a",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "50px",
              "&:hover": {
                backgroundColor: "#d81b60",
              },
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
