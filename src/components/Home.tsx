import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Grid,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Mic as MicIcon,
  PlayArrow as PlayArrowIcon,
  People as PeopleIcon,
  AudioFile as AudioFileIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axios from "axios";

interface UploadResponse {
  task_id: string;
  message: string;
  status: string;
}

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles[0]) {
      const droppedFile = droppedFiles[0];
      if (droppedFile.type.startsWith("audio/")) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please select an audio file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError(null);

    try {
      const response = await axios.post<UploadResponse>(
        "http://localhost:8000/meeting/upload-audio",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      localStorage.setItem("currentProcessingTask", response.data.task_id);
      navigate("/meetings");
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error("Upload error:", err);
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Box
      style={{ width: "1557px", margin: "0 -190px" }}
      sx={{
        height: "100vh",
        background: "#0d1117",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at top left, rgba(13, 110, 253, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(220, 38, 127, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, rgba(255, 193, 7, 0.1) 0%, transparent 50%)
          `,
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.003) 2px,
              rgba(255, 255, 255, 0.003) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.003) 2px,
              rgba(255, 255, 255, 0.003) 4px
            )
          `,
          zIndex: 0,
        },
      }}
    >
      {/* Navigation */}
      <Paper
        elevation={0}
        sx={{
          background: "rgba(13, 17, 23, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(48, 54, 61, 0.8)",
          position: "relative",
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 2,
            px: { xs: 3, sm: 4, md: 6 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(13, 110, 253, 0.3)",
              }}
            >
              <MicIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="700" color="white">
                MeetingAI
              </Typography>
              <Typography variant="caption" sx={{ color: "#7d8590" }}>
                Professional meeting intelligence
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={() => navigate("/meetings")}
            disabled={uploading}
            sx={{
              borderColor: "#30363d",
              color: "#f0f6fc",
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                borderColor: "#0d6efd",
                backgroundColor: "rgba(13, 110, 253, 0.1)",
              },
            }}
          >
            View Meetings
          </Button>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {/* Left Side - Hero Section */}
        <Box
          style={{ margin: "100px" }}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            px: { xs: 3, sm: 4, md: 6 },
            py: 4,
          }}
        >
          <Box sx={{ maxWidth: 500 }}>
            <Typography
              variant="h2"
              component="h1"
              fontWeight="800"
              sx={{
                color: "#f0f6fc",
                mb: 3,
                background: "linear-gradient(135deg, #f0f6fc 0%, #7d8590 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.1,
              }}
            >
              Transform Conversations Into Intelligence
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#7d8590",
                mb: 4,
                lineHeight: 1.5,
                fontSize: { xs: "1rem", md: "1.125rem" },
              }}
            >
              Upload your meeting recordings and get instant AI-powered
              transcriptions, summaries, and actionable insights.
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Upload Interface */}
        <Box
          style={{ margin: "100px" }}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 3, sm: 4, md: 6 },
            py: 4,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 800 }}>
            <Card
              elevation={0}
              sx={{
                background: "rgba(22, 27, 34, 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid #30363d",
                borderRadius: 3,
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -1,
                  left: -1,
                  right: -1,
                  bottom: -1,
                  background:
                    "linear-gradient(135deg, rgba(13, 110, 253, 0.3) 0%, rgba(111, 66, 193, 0.3) 100%)",
                  borderRadius: 3,
                  zIndex: -1,
                  opacity: file ? 1 : 0,
                  transition: "opacity 0.3s ease",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Upload Drop Zone */}
                <Paper
                  elevation={0}
                  sx={{
                    border: 2,
                    borderStyle: "dashed",
                    borderColor: isDragActive
                      ? "#0d6efd"
                      : file
                      ? "#198754"
                      : "#30363d",
                    backgroundColor: isDragActive
                      ? "rgba(13, 110, 253, 0.05)"
                      : file
                      ? "rgba(25, 135, 84, 0.05)"
                      : "rgba(22, 27, 34, 0.3)",
                    borderRadius: 2,
                    p: 4,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    minHeight: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": !file
                      ? {
                          borderColor: "#0d6efd",
                          backgroundColor: "rgba(13, 110, 253, 0.05)",
                          transform: "translateY(-2px)",
                        }
                      : {},
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <Box>
                      <Box
                        sx={{
                          position: "relative",
                          display: "inline-block",
                          mb: 2,
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            fontSize: 48,
                            color: "#198754",
                            filter:
                              "drop-shadow(0 4px 8px rgba(25, 135, 84, 0.3))",
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => setFile(null)}
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            bgcolor: "#21262d",
                            border: "1px solid #30363d",
                            color: "#f85149",
                            width: 24,
                            height: 24,
                            "&:hover": {
                              bgcolor: "#f85149",
                              color: "white",
                            },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        sx={{
                          color: "#f0f6fc",
                          mb: 1,
                          fontSize: "1rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Chip
                        label={formatFileSize(file.size)}
                        size="small"
                        sx={{
                          bgcolor: "rgba(25, 135, 84, 0.1)",
                          color: "#198754",
                          border: "1px solid rgba(25, 135, 84, 0.2)",
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <CloudUploadIcon
                        sx={{
                          fontSize: 48,
                          color: "#7d8590",
                          mb: 2,
                          filter: isDragActive
                            ? "drop-shadow(0 4px 8px rgba(13, 110, 253, 0.3))"
                            : "none",
                        }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        sx={{
                          color: "#f0f6fc",
                          mb: 1,
                          fontSize: "1rem",
                        }}
                      >
                        Drop your audio file here, or{" "}
                        <Button
                          component="label"
                          variant="text"
                          sx={{
                            textTransform: "none",
                            p: 0,
                            minWidth: "auto",
                            color: "#0d6efd",
                            fontWeight: 600,
                            fontSize: "inherit",
                            "&:hover": {
                              backgroundColor: "transparent",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          browse files
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            style={{ display: "none" }}
                          />
                        </Button>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#7d8590",
                          fontSize: "0.875rem",
                        }}
                      >
                        MP3, WAV, M4A, FLAC supported
                      </Typography>
                    </Box>
                  )}
                </Paper>

                {/* Error Display */}
                {error && (
                  <Alert
                    severity="error"
                    icon={<ErrorIcon />}
                    sx={{
                      mt: 3,
                      bgcolor: "rgba(248, 81, 73, 0.1)",
                      border: "1px solid rgba(248, 81, 73, 0.2)",
                      color: "#f85149",
                      "& .MuiAlert-icon": {
                        color: "#f85149",
                      },
                      borderRadius: 2,
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* Upload Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  startIcon={
                    uploading ? (
                      <CircularProgress size={18} sx={{ color: "#f0f6fc" }} />
                    ) : (
                      <PlayArrowIcon />
                    )
                  }
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    background:
                      "linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)",
                    color: "white",
                    boxShadow: "0 4px 14px rgba(13, 110, 253, 0.4)",
                    border: "1px solid rgba(13, 110, 253, 0.2)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #0b5ed7 0%, #5a32a3 100%)",
                      boxShadow: "0 6px 20px rgba(13, 110, 253, 0.6)",
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": {
                      background: "#21262d",
                      color: "#7d8590",
                      boxShadow: "none",
                      border: "1px solid #30363d",
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {uploading
                    ? "Processing your recording..."
                    : "Upload & Process Recording"}
                </Button>

                {uploading && (
                  <LinearProgress
                    sx={{
                      mt: 2,
                      borderRadius: 1,
                      height: 4,
                      bgcolor: "#21262d",
                      "& .MuiLinearProgress-bar": {
                        background:
                          "linear-gradient(90deg, #0d6efd 0%, #6f42c1 100%)",
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
