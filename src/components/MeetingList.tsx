import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Divider,
  Paper,
} from "@mui/material";
import {
  PlayArrow,
  Description,
  Schedule,
  CloudUpload,
  CheckCircle,
  Error,
  Mic as MicIcon,
  Pending,
  Mic,
  People,
  AudioFile,
  AutoAwesome,
  ArrowBack,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface Meeting {
  id: string;
  filename: string;
  created_at: string;
  title: string;
  summary?: string;
}

interface ProcessingStatus {
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  result?: any;
  error?: string;
  meeting_id?: number;
  filename?: string;
}

const MeetingList = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingTasks, setProcessingTasks] = useState<{
    [key: string]: ProcessingStatus;
  }>({});
  const navigate = useNavigate();

  // Initial load of meetings and check for processing tasks
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchMeetings();

        // Check for any ongoing processing tasks from localStorage
        const currentTaskId = localStorage.getItem("currentProcessingTask");
        if (currentTaskId) {
          addProcessingTask(currentTaskId);
          localStorage.removeItem("currentProcessingTask");
        }
      } catch (err) {
        console.error("Initial load error:", err);
        setError("Failed to load initial data");
      }
    };

    loadInitialData();
  }, []);

  // Set up interval for checking processing status
  useEffect(() => {
    const taskIds = Object.keys(processingTasks);
    if (taskIds.length > 0) {
      const intervalId = setInterval(checkProcessingStatus, 2000);
      return () => clearInterval(intervalId);
    }
  }, [processingTasks]);

  const checkProcessingStatus = async () => {
    const taskIds = Object.keys(processingTasks);
    for (const taskId of taskIds) {
      try {
        const response = await axios.get<ProcessingStatus>(
          `http://localhost:8000/meeting/processing-status/${taskId}`
        );

        if (response.data.status === "completed") {
          setProcessingTasks((prev) => {
            const newTasks = { ...prev };
            delete newTasks[taskId];
            return newTasks;
          });
          await fetchMeetings();

          if (response.data.meeting_id) {
            navigate(`/meetings/${response.data.meeting_id}`);
          }
        } else if (response.data.status === "error") {
          setError(response.data.error || "Processing failed");
          setProcessingTasks((prev) => {
            const newTasks = { ...prev };
            delete newTasks[taskId];
            return newTasks;
          });
        } else {
          setProcessingTasks((prev) => ({
            ...prev,
            [taskId]: response.data,
          }));
        }
      } catch (err) {
        console.error("Status check error:", err);
        setProcessingTasks((prev) => {
          const newTasks = { ...prev };
          delete newTasks[taskId];
          return newTasks;
        });
      }
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await axios.get<Meeting[]>(
        "http://localhost:8000/meeting/get_meetings"
      );

      if (response.data) {
        setMeetings(response.data);
        setError(null);
      } else {
        setError("No meetings data received");
        setMeetings([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch meetings. Please try again later.");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const addProcessingTask = (taskId: string) => {
    setProcessingTasks((prev) => ({
      ...prev,
      [taskId]: { status: "pending", progress: 0 },
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle sx={{ color: "#198754" }} />;
      case "error":
        return <Error sx={{ color: "#f85149" }} />;
      case "processing":
        return <PlayArrow sx={{ color: "#0d6efd" }} />;
      default:
        return <Pending sx={{ color: "#7d8590" }} />;
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        bgcolor: "rgba(125, 133, 144, 0.1)",
        color: "#7d8590",
        border: "1px solid rgba(125, 133, 144, 0.2)",
      },
      processing: {
        label: "Processing",
        bgcolor: "rgba(13, 110, 253, 0.1)",
        color: "#0d6efd",
        border: "1px solid rgba(13, 110, 253, 0.2)",
      },
      completed: {
        label: "Completed",
        bgcolor: "rgba(25, 135, 84, 0.1)",
        color: "#198754",
        border: "1px solid rgba(25, 135, 84, 0.2)",
      },
      error: {
        label: "Error",
        bgcolor: "rgba(248, 81, 73, 0.1)",
        color: "#f85149",
        border: "1px solid rgba(248, 81, 73, 0.2)",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Chip
        icon={getStatusIcon(status)}
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bgcolor,
          color: config.color,
          border: config.border,
          fontWeight: 500,
        }}
      />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box
      style={{ marginLeft: "-190px" }}
      sx={{
        width: "1530px",
        minHeight: "100vh",
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
            startIcon={<CloudUpload />}
            onClick={() => navigate("/")}
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
            Upload New Recording
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          zIndex: 1,
          px: { xs: 3, sm: 4, md: 6 },
          py: 4,
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
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

          {/* Processing Tasks */}
          {Object.entries(processingTasks).map(([taskId, status]) => (
            <Card
              key={taskId}
              elevation={0}
              sx={{
                mb: 3,
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
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <AutoAwesome sx={{ mr: 2, color: "#0d6efd" }} />
                  <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, color: "#f0f6fc", fontWeight: 600 }}
                  >
                    {status.filename || "Processing Recording"}
                  </Typography>
                  {getStatusChip(status.status)}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#7d8590" }}>
                      {status.status === "processing"
                        ? "Analyzing audio and generating insights..."
                        : "Preparing for processing..."}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#f0f6fc", fontWeight: 500 }}
                    >
                      {status.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={status.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#21262d",
                      "& .MuiLinearProgress-bar": {
                        background:
                          "linear-gradient(90deg, #0d6efd 0%, #6f42c1 100%)",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Loading State */}
          {loading && meetings.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
              }}
            >
              <CircularProgress
                size={48}
                sx={{
                  mb: 2,
                  color: "#0d6efd",
                }}
              />
              <Typography variant="body1" sx={{ color: "#7d8590" }}>
                Loading your meetings...
              </Typography>
            </Box>
          ) : meetings.length === 0 &&
            Object.keys(processingTasks).length === 0 ? (
            <Card
              elevation={0}
              sx={{
                background: "rgba(22, 27, 34, 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid #30363d",
                borderRadius: 3,
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  py: 8,
                }}
              >
                <AudioFile sx={{ fontSize: 64, color: "#30363d", mb: 3 }} />
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    color: "#f0f6fc",
                    fontWeight: 600,
                  }}
                >
                  No meetings yet
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#7d8590", mb: 4, maxWidth: 400, mx: "auto" }}
                >
                  Upload your first meeting recording to get started with
                  AI-powered transcription and insights
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CloudUpload />}
                  onClick={() => navigate("/")}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    background:
                      "linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)",
                    color: "white",
                    boxShadow: "0 4px 14px rgba(13, 110, 253, 0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #0b5ed7 0%, #5a32a3 100%)",
                      boxShadow: "0 6px 20px rgba(13, 110, 253, 0.6)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Upload First Recording
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box>
              {/* Header for meetings list */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    color: "#f0f6fc",
                    fontWeight: 700,
                    mb: 2,
                    background:
                      "linear-gradient(135deg, #f0f6fc 0%, #7d8590 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Your Meetings
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#7d8590",
                  }}
                >
                  {meetings.length} processed recording
                  {meetings.length !== 1 ? "s" : ""}
                </Typography>
              </Box>

              {/* Meetings List */}
              {meetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  elevation={0}
                  sx={{
                    mb: 3,
                    background: "rgba(22, 27, 34, 0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid #30363d",
                    borderRadius: 3,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      borderColor: "#0d6efd",
                      backgroundColor: "rgba(22, 27, 34, 0.9)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 4 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            background:
                              "linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)",
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 3,
                            flexShrink: 0,
                          }}
                        >
                          <AudioFile sx={{ color: "white", fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 1,
                              color: "#f0f6fc",
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            {meeting.filename}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#0d6efd",
                              mb: 2,
                              fontWeight: 500,
                              cursor: "pointer",
                              textDecoration: "none",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                            component={Link}
                            to={`/meetings/${meeting.id}`}
                          >
                            {meeting.title}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Schedule
                              sx={{ mr: 1, fontSize: 16, color: "#7d8590" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#7d8590" }}
                            >
                              {formatDate(meeting.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          component={Link}
                          to={`/meetings/${meeting.id}`}
                          sx={{
                            color: "#0d6efd",
                            bgcolor: "rgba(13, 110, 253, 0.1)",
                            border: "1px solid rgba(13, 110, 253, 0.2)",
                            "&:hover": {
                              backgroundColor: "rgba(13, 110, 253, 0.2)",
                              transform: "scale(1.05)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <PlayArrow />
                        </IconButton>
                      </Box>

                      {meeting.summary && (
                        <>
                          <Divider sx={{ mb: 3, borderColor: "#30363d" }} />
                          <Box
                            sx={{
                              bgcolor: "rgba(13, 110, 253, 0.05)",
                              border: "1px solid rgba(13, 110, 253, 0.1)",
                              borderRadius: 2,
                              p: 3,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#7d8590",
                                lineHeight: 1.6,
                                fontStyle: "italic",
                              }}
                            >
                              {meeting.summary}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MeetingList;
