const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');
const { uploadPdfs } = require('./upload');

const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');
const getDownloadUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/outputs/${filename}`;

// ── POST /api/merge/pdfs ──
router.post('/pdfs', (req, res) => {
  uploadPdfs(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files || req.files.length < 2)
      return res.status(400).json({ error: 'At least 2 PDF files are required to merge' });

    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;

      for (const file of req.files) {
        const pdfBytes = fs.readFileSync(file.path);
        const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
        totalPages += copiedPages.length;

        // Cleanup upload
        fs.unlink(file.path, () => {});
      }

      // Set metadata
      mergedPdf.setTitle('EasyMerge - Merged PDF');
      mergedPdf.setCreator('EasyMerge App');
      mergedPdf.setCreationDate(new Date());

      const pdfBytes = await mergedPdf.save();
      const outName = `easymerge_merged_${uuidv4()}.pdf`;
      const outPath = path.join(OUTPUTS_DIR, outName);
      fs.writeFileSync(outPath, pdfBytes);

      res.json({
        success: true,
        fileName: outName,
        downloadUrl: getDownloadUrl(req, outName),
        totalPages,
        mergedCount: req.files.length,
      });
    } catch (e) {
      req.files?.forEach(f => fs.unlink(f.path, () => {}));
      console.error('PDF merge error:', e);
      res.status(500).json({ error: 'Merge failed: ' + e.message });
    }
  });
});

module.exports = router;
