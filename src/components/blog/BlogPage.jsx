import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Fab,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const BlogPage = () => {
  const [search, setSearch] = useState("");

  // Dummy Blog Data (replace with API data)
  const blogs = [
    {
      id: 1,
      title: "Understanding Menstrual Cycles",
      content:
        "Learn the basics about how your cycle works and what to expect every month.",
      imageUrl:
        "https://s3.us-east-1.amazonaws.com/com.tharapa.data/shuya/blogs/blog2.png",
    },
    {
      id: 2,
      title: "Healthy Tips During Period",
      content:
        "Discover the best ways to stay healthy and comfortable during your period.",
      imageUrl:
        "https://s3.us-east-1.amazonaws.com/com.tharapa.data/shuya/blogs/blog2.png",
    },
    {
      id: 3,
      title: "Myths About Menstruation",
      content:
        "Busting the most common myths and misconceptions about periods.",
      imageUrl:
        "https://s3.us-east-1.amazonaws.com/com.tharapa.data/shuya/blogs/blog2.png",
    },
    {
      id: 4,
      title: "Foods to Eat During Period",
      content:
        "List of healthy foods for energy and comfort during menstruation.",
      imageUrl:
        "https://s3.us-east-1.amazonaws.com/com.tharapa.data/shuya/blogs/blog2.png",
    },
    {
      id: 5,
      title: "Signs of Hormonal Imbalance",
      content: "Learn about common signs and how to manage them.",
      imageUrl:
        "https://s3.us-east-1.amazonaws.com/com.tharapa.data/shuya/blogs/blog2.png",
    },
  ];

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        backgroundColor: "#fff0f5", // light pink
        minHeight: "86vh",
        p: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ color: "#d81b60", fontWeight: "bold" }}>
          Blog Management
        </Typography>

        <TextField
          placeholder="Search blog..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            width: "250px",
          }}
        />
      </Box>

      {/* Scrollable Blog Grid */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          maxHeight: "calc(80vh)", // Adjust height (header + padding)
          pr: 1,
        }}
      >
        <Grid container spacing={3}>
          {filteredBlogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog.id} width={"40%"}>
              <Card
                sx={{
                  borderRadius: "16px",
                  backgroundColor: "#ffffff",
                  boxShadow: 3,
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={blog.imageUrl}
                  alt={blog.title}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ color: "#d81b60", fontWeight: "bold" }}
                  >
                    {blog.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#333", mt: 1 }}>
                    {blog.content.substring(0, 60)}...
                  </Typography>
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#ec407a",
                        "&:hover": { backgroundColor: "#d81b60" },
                        fontSize: "12px",
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{
                        color: "#ec407a",
                        borderColor: "#ec407a",
                        fontSize: "12px",
                        "&:hover": { borderColor: "#d81b60", color: "#d81b60" },
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Floating Add Blog Button */}
      <Fab
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "#ec407a",
          "&:hover": { backgroundColor: "#d81b60" },
        }}
      >
        <AddIcon sx={{ color: "#fff" }} />
      </Fab>
    </Box>
  );
};

export default BlogPage;
