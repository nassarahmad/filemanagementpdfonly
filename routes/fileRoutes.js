const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Helper function to get absolute file path (prevents path traversal attacks)
const getFilePath = (fileName) => path.join(__dirname, '..', 'storage', path.basename(fileName));

// Validate if the file is a PDF
const isPdfFile = (fileName) => {
  return fileName.toLowerCase().endsWith('.pdf');
};

// Read file
router.get('/read', async (req, res) => {
  try {
    const fileName = req.query.fileName;
    if (!isPdfFile(fileName)) {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }
    const data = await fs.readFile(getFilePath(fileName), 'utf8');
    res.json({ content: data });
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Write file
router.post('/write', async (req, res) => {
  try {
    const { fileName, content } = req.body;
    if (!isPdfFile(fileName)) {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }
    await fs.writeFile(getFilePath(fileName), content, 'utf8');
    res.json({ message: 'PDF file written successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rename file
router.put('/rename', async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!isPdfFile(oldName) || !isPdfFile(newName)) {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }
    const oldFilePath = getFilePath(oldName);
    const newFilePath = getFilePath(newName);
    await fs.access(oldFilePath); // Check if the old file exists
    await fs.rename(oldFilePath, newFilePath);
    res.json({ message: 'PDF file renamed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file
router.delete('/delete', async (req, res) => {
  try {
    const fileName = req.query.fileName;
    if (!isPdfFile(fileName)) {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }
    await fs.unlink(getFilePath(fileName));
    res.json({ message: 'PDF file deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Append to file (Disabled for PDFs) not supported
router.post('/append', async (req, res) => {
  res.status(400).json({ error: 'Appending content to PDF files is not supported' });
});
// i am tried but not working because it is not supported and i asked ai for that he telled me not supported

module.exports = router;