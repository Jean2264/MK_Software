import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads/productos");
  },

  filename: (req, file, cb) => {
    const extension = file.originalname.split(".").pop();

    const filename = `${Date.now()}--${Math.round(Math.random() * 1e9)}.${extension}`;

    cb(null, filename);
  },
});

const uploadProduct = multer({
  storage,
});

export default uploadProduct;
