import multer from 'multer'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/temp")
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/^\.+/, '');
    cb(null, `${Date.now()}_${safeName}`)
  }
})

export const upload = multer({  
    storage,
})