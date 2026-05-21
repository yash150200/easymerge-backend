
// // const express = require('express');
// // const router = express.Router();

// // const path = require('path');
// // const fs = require('fs');

// // const { PDFDocument } = require('pdf-lib');
// // const { v4: uuidv4 } = require('uuid');

// // const { uploadImages, uploadWord } = require('./upload');

// // const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');

// // const getDownloadUrl = (req, filename) => {
// //   return `${req.protocol}://${req.get('host')}/outputs/${filename}`;
// // };




// // // ─────────────────────────────────────────────
// // // IMAGE TO PDF
// // // ─────────────────────────────────────────────

// // router.post('/image-to-pdf', (req, res) => {

// //   uploadImages(req, res, async (err) => {

// //     if (err) {
// //       console.log('Upload Error:', err);

// //       return res.status(400).json({
// //         error: err.message,
// //       });
// //     }

// //     if (!req.files || req.files.length === 0) {

// //       return res.status(400).json({
// //         error: 'No images uploaded',
// //       });
// //     }

// //     try {

// //       const pdfDoc = await PDFDocument.create();

// //       for (const file of req.files) {

// //         console.log('Processing Image:', file.originalname);

// //         const imageBytes = fs.readFileSync(file.path);

// //         let image;

// //         // PNG
// //         if (
// //           file.mimetype.includes('png')
// //         ) {

// //           image = await pdfDoc.embedPng(imageBytes);

// //         }

// //         // JPG / JPEG
// //         else {

// //           image = await pdfDoc.embedJpg(imageBytes);

// //         }

// //         const width = image.width;
// //         const height = image.height;

// //         const page = pdfDoc.addPage([
// //           width,
// //           height,
// //         ]);

// //         page.drawImage(image, {
// //           x: 0,
// //           y: 0,
// //           width,
// //           height,
// //         });

// //         // delete uploaded image
// //         try {
// //           fs.unlinkSync(file.path);
// //         } catch (e) {
// //           console.log('Delete Error:', e.message);
// //         }

// //       }

// //       const pdfBytes = await pdfDoc.save();

// //       const outName = `easymerge_${uuidv4()}.pdf`;

// //       const outPath = path.join(
// //         OUTPUTS_DIR,
// //         outName
// //       );

// //       fs.writeFileSync(
// //         outPath,
// //         pdfBytes
// //       );

// //       return res.json({
// //         success: true,
// //         fileName: outName,
// //         downloadUrl: getDownloadUrl(req, outName),
// //         pages: req.files.length,
// //       });

// //     } catch (e) {

// //       console.log('Image Conversion Error:', e);

// //       return res.status(500).json({
// //         error: 'Conversion failed: ' + e.message,
// //       });

// //     }

// //   });

// // });


// // // ─────────────────────────────────────────────
// // // WORD TO PDF
// // // ─────────────────────────────────────────────

// // router.post('/word-to-pdf', (req, res) => {

// //   uploadWord(req, res, async (err) => {

// //     if (err) {

// //       return res.status(400).json({
// //         error: err.message,
// //       });
// //     }

// //     if (!req.file) {

// //       return res.status(400).json({
// //         error: 'No document uploaded',
// //       });
// //     }

// //     try {

// //       const libreConvert = require('libreoffice-convert');

// //       const { promisify } = require('util');

// //       const convertAsync = promisify(
// //         libreConvert.convert
// //       );

// //       const inputBuffer = fs.readFileSync(
// //         req.file.path
// //       );

// //       const pdfBuffer = await convertAsync(
// //         inputBuffer,
// //         '.pdf',
// //         undefined
// //       );

// //       const outName =
// //         `easymerge_${uuidv4()}.pdf`;

// //       const outPath = path.join(
// //         OUTPUTS_DIR,
// //         outName
// //       );

// //       fs.writeFileSync(
// //         outPath,
// //         pdfBuffer
// //       );

// //       // delete uploaded file
// //       try {
// //         fs.unlinkSync(req.file.path);
// //       } catch (e) {
// //         console.log(e);
// //       }

// //       return res.json({
// //         success: true,
// //         fileName: outName,
// //         downloadUrl: getDownloadUrl(req, outName),
// //       });

// //     } catch (e) {

// //       console.log('Word Conversion Error:', e);

// //       // cleanup
// //       try {
// //         if (req.file) {
// //           fs.unlinkSync(req.file.path);
// //         }
// //       } catch (err) {}

// //       if (
// //         e.message &&
// //         e.message.includes('soffice')
// //       ) {

// //         return res.status(500).json({
// //           error:
// //             'LibreOffice is required. Please install LibreOffice on your PC.',
// //         });

// //       }

// //       return res.status(500).json({
// //         error: 'Conversion failed: ' + e.message,
// //       });

// //     }

// //   });

// // });

// // module.exports = router;






// const express = require('express');
// const router = express.Router();

// const path = require('path');
// const fs = require('fs');

// const sharp = require('sharp');

// const { PDFDocument } = require('pdf-lib');
// const { v4: uuidv4 } = require('uuid');

// const { uploadImages, uploadWord } = require('./upload');

// const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');

// // FORCE HTTPS DOWNLOAD URL
// const getDownloadUrl = (req, filename) => {
//   return `https://${req.get('host')}/outputs/${filename}`;
// };

// // ─────────────────────────────────────────────
// // IMAGE TO PDF
// // ─────────────────────────────────────────────

// router.post('/image-to-pdf', (req, res) => {

//   uploadImages(req, res, async (err) => {

//     if (err) {
//       console.log('Upload Error:', err);

//       return res.status(400).json({
//         error: err.message,
//       });
//     }

//     if (!req.files || req.files.length === 0) {

//       return res.status(400).json({
//         error: 'No images uploaded',
//       });
//     }

//     try {

//       const pdfDoc = await PDFDocument.create();

//       for (const file of req.files) {

//         console.log('Processing Image:', file.originalname);

//         // Convert all image types safely to PNG
//         const pngBuffer = await sharp(file.path)
//           .rotate()
//           .png()
//           .toBuffer();

//         const image = await pdfDoc.embedPng(pngBuffer);

//         const width = image.width;
//         const height = image.height;

//         const page = pdfDoc.addPage([
//           width,
//           height,
//         ]);

//         page.drawImage(image, {
//           x: 0,
//           y: 0,
//           width,
//           height,
//         });

//         // delete uploaded image
//         try {
//           fs.unlinkSync(file.path);
//         } catch (e) {
//           console.log('Delete Error:', e.message);
//         }

//       }

//       const pdfBytes = await pdfDoc.save();

//       const outName = `easymerge_${uuidv4()}.pdf`;

//       const outPath = path.join(
//         OUTPUTS_DIR,
//         outName
//       );

//       fs.writeFileSync(
//         outPath,
//         pdfBytes
//       );

//       return res.json({
//         success: true,
//         fileName: outName,
//         downloadUrl: getDownloadUrl(req, outName),
//         pages: req.files.length,
//       });

//     } catch (e) {

//       console.log('Image Conversion Error:', e);

//       return res.status(500).json({
//         error: 'Conversion failed: ' + e.message,
//       });

//     }

//   });

// });

// // ─────────────────────────────────────────────
// // WORD TO PDF
// // ─────────────────────────────────────────────

// router.post('/word-to-pdf', (req, res) => {

//   uploadWord(req, res, async (err) => {

//     if (err) {

//       return res.status(400).json({
//         error: err.message,
//       });
//     }

//     if (!req.file) {

//       return res.status(400).json({
//         error: 'No document uploaded',
//       });
//     }

//     try {

//       const libreConvert = require('libreoffice-convert');

//       const { promisify } = require('util');

//       const convertAsync = promisify(
//         libreConvert.convert
//       );

//       const inputBuffer = fs.readFileSync(
//         req.file.path
//       );

//       const pdfBuffer = await convertAsync(
//         inputBuffer,
//         '.pdf',
//         undefined
//       );

//       const outName =
//         `easymerge_${uuidv4()}.pdf`;

//       const outPath = path.join(
//         OUTPUTS_DIR,
//         outName
//       );

//       fs.writeFileSync(
//         outPath,
//         pdfBuffer
//       );

//       // delete uploaded file
//       try {
//         fs.unlinkSync(req.file.path);
//       } catch (e) {
//         console.log(e);
//       }

//       return res.json({
//         success: true,
//         fileName: outName,
//         downloadUrl: getDownloadUrl(req, outName),
//       });

//     } catch (e) {

//       console.log('Word Conversion Error:', e);

//       try {
//         if (req.file) {
//           fs.unlinkSync(req.file.path);
//         }
//       } catch (err) {}

//       return res.status(500).json({
//         error:
//           'Word to PDF currently unavailable on cloud server.',
//       });

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

// Create outputs folder if not exists
if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

// FORCE HTTPS URL
const getDownloadUrl = (req, filename) => {
  return `https://${req.get('host')}/outputs/${filename}`;
};

// ─────────────────────────────────────────────
// IMAGE TO PDF
// ─────────────────────────────────────────────

router.post('/image-to-pdf', (req, res) => {

  uploadImages(req, res, async (err) => {

    if (err) {

      console.log('UPLOAD ERROR:', err);

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

        console.log('Processing:', file.originalname);

        const imageBytes = fs.readFileSync(file.path);

        let image;

        // PNG
        if (
          file.mimetype.includes('png') ||
          file.originalname.toLowerCase().endsWith('.png')
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

      console.log(
        'IMAGE CONVERSION ERROR:',
        e
      );

      return res.status(500).json({
        error:
          'Server conversion failed: ' +
          e.message,
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

      try {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {}

      return res.status(500).json({
        error:
          'Word to PDF currently unavailable on cloud server.',
      });

    }

  });

});

module.exports = router;