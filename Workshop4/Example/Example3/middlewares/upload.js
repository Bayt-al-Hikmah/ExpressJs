const multer = require('multer');
const path = require('path');

// Configure storage and file filtering
const upload = multer({
    dest: 'public/avatars/', // You can make this dynamic if needed
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

module.exports = upload;