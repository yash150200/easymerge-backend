

// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');

// const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// // Ensure uploads folder exists
// if (!fs.existsSync(UPLOAD_DIR)) {
//   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// }

// // ───────────────── STORAGE ─────────────────

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, UPLOAD_DIR);
//   },

//   filename: (req, file, cb) => {
//     const ext =
//       path.extname(file.originalname || '').toLowerCase() || '';

//     cb(null, `${uuidv4()}${ext}`);
//   },
// });

// // ───────────────── IMAGE FILTER ─────────────────

// const imageFilter = (req, file, cb) => {

//   const allowedMimeTypes = [
//     'image/jpeg',
//     'image/jpg',
//     'image/png',
//     'image/webp',
//     'image/heic',
//     'image/heif',
//     'application/octet-stream',
//   ];

//   const ext = path.extname(file.originalname || '').toLowerCase();

//   const allowedExts = [
//     '.jpg',
//     '.jpeg',
//     '.png',
//     '.webp',
//     '.heic',
//     '.heif',
//   ];

//   if (
//     allowedMimeTypes.includes(file.mimetype) ||
//     allowedExts.includes(ext)
//   ) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         `Unsupported image type: ${file.mimetype}`
//       ),
//       false
//     );
//   }
// };

// // ───────────────── WORD FILTER ─────────────────

// const wordFilter = (req, file, cb) => {

//   const allowedMimeTypes = [
//     'application/msword',

//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

//     'application/octet-stream',
//   ];

//   const ext = path.extname(file.originalname || '').toLowerCase();

//   if (
//     allowedMimeTypes.includes(file.mimetype) ||
//     ext === '.doc' ||
//     ext === '.docx'
//   ) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         'Only DOC and DOCX files are allowed'
//       ),
//       false
//     );
//   }
// };

// // ───────────────── PDF FILTER ─────────────────

// const pdfFilter = (req, file, cb) => {

//   const ext = path.extname(file.originalname || '').toLowerCase();

//   if (
//     file.mimetype === 'application/pdf' ||
//     ext === '.pdf'
//   ) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error('Only PDF files are allowed'),
//       false
//     );
//   }
// };

// // ───────────────── LIMITS ─────────────────

// const LIMITS = {
//   fileSize: 50 * 1024 * 1024, // 50MB
// };

// // ───────────────── EXPORTS ─────────────────

// module.exports = {

//   uploadImages: multer({
//     storage,
//     fileFilter: imageFilter,
//     limits: LIMITS,
//   }).array('images', 20),

//   uploadWord: multer({
//     storage,
//     fileFilter: wordFilter,
//     limits: LIMITS,
//   }).single('document'),

//   uploadPdfs: multer({
//     storage,
//     fileFilter: pdfFilter,
//     limits: LIMITS,
//   }).array('pdfs', 20),
// };







const multer = require('multer');

const path = require('path');
const fs = require('fs');

const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR =
  path.join(__dirname, '..', 'uploads');

// create uploads folder
if (!fs.existsSync(UPLOAD_DIR)) {

  fs.mkdirSync(UPLOAD_DIR, {
    recursive: true,
  });

}

// ───────────────── STORAGE ─────────────────

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, UPLOAD_DIR);

  },

  filename: (req, file, cb) => {

    const ext =
      path.extname(
        file.originalname || ''
      ).toLowerCase() || '';

    cb(null, `${uuidv4()}${ext}`);

  },

});

// ───────────────── IMAGE FILTER ─────────────────

const imageFilter = (req, file, cb) => {

  const allowedExts = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.heic',
    '.heif',
  ];

  const ext =
    path.extname(
      file.originalname || ''
    ).toLowerCase();

  if (
    file.mimetype.startsWith('image/') ||
    allowedExts.includes(ext) ||
    file.mimetype ===
      'application/octet-stream'
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        `Unsupported image type: ${file.mimetype}`
      ),
      false
    );

  }

};

// ───────────────── WORD FILTER ─────────────────

const wordFilter = (req, file, cb) => {

  const ext =
    path.extname(
      file.originalname || ''
    ).toLowerCase();

  if (
    ext === '.doc' ||
    ext === '.docx'
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        'Only DOC and DOCX files are allowed'
      ),
      false
    );

  }

};

// ───────────────── PDF FILTER ─────────────────

const pdfFilter = (req, file, cb) => {

  const ext =
    path.extname(
      file.originalname || ''
    ).toLowerCase();

  if (
    file.mimetype ===
      'application/pdf' ||
    ext === '.pdf'
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        'Only PDF files are allowed'
      ),
      false
    );

  }

};

// ───────────────── LIMITS ─────────────────

const LIMITS = {
  fileSize: 50 * 1024 * 1024,
};

// ───────────────── EXPORTS ─────────────────

module.exports = {

  uploadImages: multer({
    storage,
    fileFilter: imageFilter,
    limits: LIMITS,
  }).array('images', 20),

  uploadWord: multer({
    storage,
    fileFilter: wordFilter,
    limits: LIMITS,
  }).single('document'),

  uploadPdfs: multer({
    storage,
    fileFilter: pdfFilter,
    limits: LIMITS,
  }).array('pdfs', 20),

};