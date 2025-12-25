import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageIcon from "@mui/icons-material/Language";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const language = event.target.value;
    i18n.changeLanguage(language);
  };

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "mr", name: "Marathi", nativeName: "मराठी" },
  ];

  return (
    <Box sx={{ minWidth: 120, display: "flex", alignItems: "center", gap: 1 }}>
      <LanguageIcon />
      <FormControl size="small">
        <InputLabel id="language-select-label">Language</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={i18n.language}
          label="Language"
          onChange={handleLanguageChange}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Typography variant="body2">{lang.nativeName}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;
