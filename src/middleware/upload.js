const multer = require('multer');
const path = require('path');

const storage = (folder) => multer.diskStorage({
    destination: (req, file, cb) => cb(null, `src/uploads/${folder}`),
    filename: (req, file, cb) => cb(null, file.originalname)
});

const excelFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (['.xlsx', '.xls', '.csv'].includes(ext)) cb(null, true);
    else cb(new Error('Only Excel/CSV files allowed'));
};

const documentFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (['.pdf', '.doc', '.docx', '.xlsx'].includes(ext)) cb(null, true);
    else cb(new Error('Invalid file type'));
};

const uploadExcel = multer({ storage: multer.memoryStorage(), fileFilter: excelFilter });
const uploadDocument = multer({ storage: storage('documents'), fileFilter: documentFilter });

module.exports = { uploadExcel, uploadDocument };
