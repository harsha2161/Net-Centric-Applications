const multer = require('multer');

// Use memoryStorage so uploads work in serverless environments (Vercel)
// where there is no writable filesystem. Files are available as file.buffer.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadProjectImages = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 5 }
]);

module.exports = { uploadProjectImages };
