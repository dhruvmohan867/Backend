import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/temp")
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/^\.+/, '');
    cb(null, `${Date.now()}_${safeName}`)
  }
})

// Only allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime', 'video/x-msvideo']
  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ApiError(400, `Unsupported file type: ${file.mimetype}. Only images and videos are allowed.`), false)
  }
}

export const upload = multer({  
    storage,
    fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024  // 100 MB max
    }
})