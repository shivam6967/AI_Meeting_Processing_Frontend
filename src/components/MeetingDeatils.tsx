import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  ButtonGroup,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TranscriptIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TranslateIcon from "@mui/icons-material/Translate";
import axios from "axios";

interface MeetingDetails {
  id: string;
  filename: string;
  created_at: string;
  title: string;
  summary?: string;
  duration?: string;
  participants?: any[];
  key_points?: any[];
  action_items?: any[];
  transcript?: string;
  language?: string;
}

const MeetingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<{
    pdf: boolean;
    docx: boolean;
  }>({ pdf: false, docx: false });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<"english" | "marathi">(
    "english"
  );
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    fetchMeetingDetails(currentLanguage);
  }, [id]);

  const fetchMeetingDetails = async (language: "english" | "marathi") => {
    try {
      setLoading(true);
      const response = await axios.get<MeetingDetails>(
        `http://localhost:8000/meeting/get_meeting_by_id/${id}?language=${language}`
      );
      setMeeting(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch meeting details");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: "english" | "marathi" | null
  ) => {
    if (newLanguage === null || newLanguage === currentLanguage) return;

    setTranslating(true);
    setCurrentLanguage(newLanguage);

    try {
      const response = await axios.get<MeetingDetails>(
        `http://localhost:8000/meeting/get_meeting_by_id/${id}?language=${newLanguage}`
      );
      setMeeting(response.data);
      setSnackbarMessage(
        `Content translated to ${
          newLanguage === "english" ? "English" : "Marathi"
        }`
      );
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Translation error:", err);
      setSnackbarMessage("Failed to translate content. Please try again.");
      setSnackbarOpen(true);
      setCurrentLanguage(currentLanguage === "english" ? "marathi" : "english");
    } finally {
      setTranslating(false);
    }
  };

  const downloadReport = async (format: "pdf" | "docx") => {
    if (!id) return;

    setDownloadLoading((prev) => ({ ...prev, [format]: true }));

    try {
      // FIXED: Now passing the current language to the download endpoint
      const response = await axios.get(
        `http://localhost:8000/meeting/download_report/${id}?format=${format}&language=${currentLanguage}`,
        {
          responseType: "blob",
          timeout: 300000,
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const meetingTitle =
        meeting?.title?.replace(/[^a-z0-9]/gi, "_") || "Meeting_Report";
      const filename = `${meetingTitle}_Report.${format}`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbarMessage(
        `${format.toUpperCase()} report downloaded successfully!`
      );
      setSnackbarOpen(true);
    } catch (err) {
      console.error(`Download ${format} error:`, err);
      setSnackbarMessage(
        `Failed to download ${format.toUpperCase()} report. Please try again.`
      );
      setSnackbarOpen(true);
    } finally {
      setDownloadLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  const formatTranscript = (transcript: string): string[] => {
    if (!transcript) return [];

    const sentences = transcript.split(/(?<=[.!?])\s+/);
    const paragraphs: string[] = [];

    for (let i = 0; i < sentences.length; i += 3) {
      paragraphs.push(sentences.slice(i, i + 3).join(" "));
    }

    return paragraphs;
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const renderParticipant = (participant: any): string => {
    if (typeof participant === "string") {
      return participant;
    }
    if (typeof participant === "object" && participant !== null) {
      if (participant.name) {
        return participant.role
          ? `${participant.name} (${participant.role})`
          : participant.name;
      }
      return JSON.stringify(participant);
    }
    return String(participant);
  };

  const renderListItem = (item: any): string => {
    if (typeof item === "string") {
      return item;
    }
    if (typeof item === "object" && item !== null) {
      return JSON.stringify(item);
    }
    return String(item);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {translating ? "Translating..." : "Loading meeting details..."}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/meetings")}
        >
          Back to Meetings
        </Button>
      </Box>
    );
  }

  if (!meeting) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
        <Alert severity="info">Meeting not found</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/meetings")}
          sx={{ mt: 2 }}
        >
          Back to Meetings
        </Button>
      </Box>
    );
  }

  const participants = meeting.participants || [];
  const keyPoints = meeting.key_points || [];
  const actionItems = meeting.action_items || [];
  const transcriptParagraphs = meeting.transcript
    ? formatTranscript(meeting.transcript)
    : [];

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, px: 2 }}>
      {/* Language Switcher */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/meetings")}
        >
          Back to Meetings
        </Button>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TranslateIcon color="action" />
          <ToggleButtonGroup
            value={currentLanguage}
            exclusive
            onChange={handleLanguageChange}
            aria-label="language selection"
            size="small"
            disabled={translating}
          >
            <ToggleButton value="english" aria-label="english">
              English
            </ToggleButton>
            <ToggleButton value="marathi" aria-label="marathi">
              मराठी
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Download Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
        }}
      >
        <ButtonGroup variant="contained" aria-label="download report options">
          <Button
            startIcon={
              downloadLoading.pdf ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PictureAsPdfIcon />
              )
            }
            onClick={() => downloadReport("pdf")}
            disabled={
              downloadLoading.pdf || downloadLoading.docx || translating
            }
            color="error"
          >
            {downloadLoading.pdf ? "Generating..." : "Download PDF"}
          </Button>
        </ButtonGroup>
      </Box>

      {/* Translation Indicator */}
      {translating && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>
              Translating content to{" "}
              {currentLanguage === "english" ? "English" : "Marathi"}...
            </Typography>
          </Box>
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {meeting.title}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              File: {meeting.filename}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Processed: {new Date(meeting.created_at).toLocaleString()}
            </Typography>
            {meeting.duration && (
              <Typography variant="body2" color="text.secondary">
                Duration: {meeting.duration}
              </Typography>
            )}
            <Chip
              label={currentLanguage === "english" ? "English" : "मराठी"}
              size="small"
              color="primary"
              sx={{ mt: 1 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <DownloadIcon />
              {currentLanguage === "english"
                ? "Download Complete Report"
                : "संपूर्ण अहवाल डाउनलोड करा"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentLanguage === "english"
                ? "Generate a comprehensive report including summary, participants, key points, action items, and full transcript."
                : "सारांश, सहभागी, मुख्य मुद्दे, कृती आयटम आणि संपूर्ण ट्रान्सक्रिप्ट समाविष्ट असलेला सर्वसमावेशक अहवाल तयार करा."}
            </Typography>
            <ButtonGroup variant="outlined" size="small">
              <Button
                startIcon={
                  downloadLoading.pdf ? (
                    <CircularProgress size={16} />
                  ) : (
                    <PictureAsPdfIcon />
                  )
                }
                onClick={() => downloadReport("pdf")}
                disabled={
                  downloadLoading.pdf || downloadLoading.docx || translating
                }
                color="error"
              >
                {downloadLoading.pdf
                  ? currentLanguage === "english"
                    ? "Generating PDF..."
                    : "PDF तयार करत आहे..."
                  : currentLanguage === "english"
                  ? "PDF Report"
                  : "PDF अहवाल"}
              </Button>
            </ButtonGroup>
          </Box>

          {meeting.summary && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {currentLanguage === "english" ? "Summary" : "सारांश"}
              </Typography>
              <Typography variant="body1">{meeting.summary}</Typography>
            </Box>
          )}

          {participants.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {currentLanguage === "english" ? "Participants" : "सहभागी"}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {participants.map((participant, index) => (
                  <Chip
                    key={index}
                    label={renderParticipant(participant)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {keyPoints.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {currentLanguage === "english" ? "Key Points" : "मुख्य मुद्दे"}
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {keyPoints.map((point, index) => (
                  <Typography component="li" key={index} variant="body1">
                    {renderListItem(point)}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {actionItems.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {currentLanguage === "english" ? "Action Items" : "कृती आयटम"}
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {actionItems.map((item, index) => (
                  <Typography component="li" key={index} variant="body1">
                    {renderListItem(item)}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {meeting.transcript && (
            <Box sx={{ mb: 3 }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="transcript-content"
                  id="transcript-header"
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TranscriptIcon />
                    <Typography variant="h6">
                      {currentLanguage === "english"
                        ? "Full Transcript"
                        : "संपूर्ण ट्रान्सक्रिप्ट"}
                    </Typography>
                    <Chip
                      label={`${meeting.transcript.split(" ").length} ${
                        currentLanguage === "english" ? "words" : "शब्द"
                      }`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      maxHeight: 400,
                      overflow: "auto",
                      border: "1px solid",
                      borderColor: "grey.200",
                    }}
                  >
                    {transcriptParagraphs.length > 0 ? (
                      transcriptParagraphs.map(
                        (paragraph: string, index: number) => (
                          <Typography
                            key={index}
                            variant="body1"
                            sx={{
                              mb: 2,
                              lineHeight: 1.6,
                              "&:last-child": { mb: 0 },
                            }}
                          >
                            {paragraph}
                          </Typography>
                        )
                      )
                    ) : (
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {meeting.transcript}
                      </Typography>
                    )}
                  </Paper>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
};

export default MeetingDetails;
