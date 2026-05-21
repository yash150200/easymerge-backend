// const express = require('express');
// const router = express.Router();
// const path = require('path');
// const fs = require('fs');
// const { PDFDocument } = require('pdf-lib');
// const sharp = require('sharp');
// const { v4: uuidv4 } = require('uuid');
// const { uploadImages, uploadWord } = require('./upload');

// const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');
// const getDownloadUrl = (req, filename) =>
//   `${req.protocol}://${req.get('host')}/outputs/${filename}`;

// // ── POST /api/convert/image-to-pdf ──
// router.post('/image-to-pdf', (req, res) => {
//   uploadImages(req, res, async (err) => {
//     if (err) return res.status(400).json({ error: err.message });
//     if (!req.files || req.files.length === 0)
//       return res.status(400).json({ error: 'No images uploaded' });

//     try {
//       const pdfDoc = await PDFDocument.create();

//       for (const file of req.files) {
//         // Convert to PNG via sharp (handles HEIC, JPEG, PNG, WebP)
//         const pngBuffer = await sharp(file.path)
//           .rotate() // auto-orient via EXIF
//           .toFormat('png')
//           .toBuffer();

//         const image = await pdfDoc.embedPng(pngBuffer);
//         const { width, height } = image.scale(1);

//         // A4 dimensions in points: 595 x 842
//         // Fit image to A4 while preserving aspect ratio
//         const A4_W = 595, A4_H = 842;
//         const MARGIN = 40;
//         const maxW = A4_W - MARGIN * 2;
//         const maxH = A4_H - MARGIN * 2;

//         const ratio = Math.min(maxW / width, maxH / height, 1);
//         const drawW = width * ratio;
//         const drawH = height * ratio;

//         const page = pdfDoc.addPage([A4_W, A4_H]);
//         page.drawImage(image, {
//           x: (A4_W - drawW) / 2,
//           y: (A4_H - drawH) / 2,
//           width: drawW,
//           height: drawH,
//         });

//         // Cleanup upload
//         fs.unlink(file.path, () => {});
//       }

//       const pdfBytes = await pdfDoc.save();
//       const outName = `easymerge_${uuidv4()}.pdf`;
//       const outPath = path.join(OUTPUTS_DIR, outName);
//       fs.writeFileSync(outPath, pdfBytes);

//       res.json({
//         success: true,
//         fileName: outName,
//         downloadUrl: getDownloadUrl(req, outName),
//         pages: req.files.length,
//       });
//     } catch (e) {
//       console.error('Image to PDF error:', e);
//       res.status(500).json({ error: 'Conversion failed: ' + e.message });
//     }
//   });
// });

// // ── POST /api/convert/word-to-pdf ──
// router.post('/word-to-pdf', (req, res) => {
//   uploadWord(req, res, async (err) => {
//     if (err) return res.status(400).json({ error: err.message });
//     if (!req.file) return res.status(400).json({ error: 'No document uploaded' });

//     try {
//       const libreConvert = require('libreoffice-convert');
//       const { promisify } = require('util');
//       const convertAsync = promisify(libreConvert.convert);

//       const inputBuffer = fs.readFileSync(req.file.path);
//       const pdfBuffer = await convertAsync(inputBuffer, '.pdf', undefined);

//       const outName = `easymerge_${uuidv4()}.pdf`;
//       const outPath = path.join(OUTPUTS_DIR, outName);
//       fs.writeFileSync(outPath, pdfBuffer);

//       // Cleanup
//       fs.unlink(req.file.path, () => {});

//       res.json({
//         success: true,
//         fileName: outName,
//         downloadUrl: getDownloadUrl(req, outName),
//       });
//     } catch (e) {
//       // Cleanup
//       if (req.file) fs.unlink(req.file.path, () => {});

//       console.error('Word to PDF error:', e);

//       if (e.message && e.message.includes('soffice')) {
//         return res.status(500).json({
//           error: 'LibreOffice is required for Word conversion. Install it: sudo apt install libreoffice (Linux) or brew install libreoffice (Mac)',
//         });
//       }
//       res.status(500).json({ error: 'Conversion failed: ' + e.message });
//     }
//   });
// });

// module.exports = router;
const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');

const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');

const { uploadImages, uploadWord } = require('./upload');

const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');

const getDownloadUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/outputs/${filename}`;
};


// ─────────────────────────────────────────────
// IMAGE TO PDF
// ─────────────────────────────────────────────

router.post('/image-to-pdf', (req, res) => {

  uploadImages(req, res, async (err) => {

    if (err) {
      console.log('Upload Error:', err);

      return res.status(400).json({
        error: err.message,
      });
    }

    if (!req.files || req.files.length === 0) {

      return res.status(400).json({
        error: 'No images uploaded',
      });
    }

    try {

      const pdfDoc = await PDFDocument.create();

      for (const file of req.files) {

        console.log('Processing Image:', file.originalname);

        const imageBytes = fs.readFileSync(file.path);

        let image;

        // PNG
        if (
          file.mimetype.includes('png')
        ) {

          image = await pdfDoc.embedPng(imageBytes);

        }

        // JPG / JPEG
        else {

          image = await pdfDoc.embedJpg(imageBytes);

        }

        const width = image.width;
        const height = image.height;

        const page = pdfDoc.addPage([
          width,
          height,
        ]);

        page.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
        });

        // delete uploaded image
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          console.log('Delete Error:', e.message);
        }

      }

      const pdfBytes = await pdfDoc.save();

      const outName = `easymerge_${uuidv4()}.pdf`;

      const outPath = path.join(
        OUTPUTS_DIR,
        outName
      );

      fs.writeFileSync(
        outPath,
        pdfBytes
      );

      return res.json({
        success: true,
        fileName: outName,
        downloadUrl: getDownloadUrl(req, outName),
        pages: req.files.length,
      });

    } catch (e) {

      console.log('Image Conversion Error:', e);

      return res.status(500).json({
        error: 'Conversion failed: ' + e.message,
      });

    }

  });

});


// ─────────────────────────────────────────────
// WORD TO PDF
// ─────────────────────────────────────────────

router.post('/word-to-pdf', (req, res) => {

  uploadWord(req, res, async (err) => {

    if (err) {

      return res.status(400).json({
        error: err.message,
      });
    }

    if (!req.file) {

      return res.status(400).json({
        error: 'No document uploaded',
      });
    }

    try {

      const libreConvert = require('libreoffice-convert');

      const { promisify } = require('util');

      const convertAsync = promisify(
        libreConvert.convert
      );

      const inputBuffer = fs.readFileSync(
        req.file.path
      );

      const pdfBuffer = await convertAsync(
        inputBuffer,
        '.pdf',
        undefined
      );

      const outName =
        `easymerge_${uuidv4()}.pdf`;

      const outPath = path.join(
        OUTPUTS_DIR,
        outName
      );

      fs.writeFileSync(
        outPath,
        pdfBuffer
      );

      // delete uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.log(e);
      }

      return res.json({
        success: true,
        fileName: outName,
        downloadUrl: getDownloadUrl(req, outName),
      });

    } catch (e) {

      console.log('Word Conversion Error:', e);

      // cleanup
      try {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {}

      if (
        e.message &&
        e.message.includes('soffice')
      ) {

        return res.status(500).json({
          error:
            'LibreOffice is required. Please install LibreOffice on your PC.',
        });

      }

      return res.status(500).json({
        error: 'Conversion failed: ' + e.message,
      });

    }

  });

});

module.exports = router;