import { v2 as cloudinary } from 'cloudinary'
import * as configService from "../../../config/config.service.js"

cloudinary.config({ 
    cloud_name: configService.CLUDINARY_CLOUD_NAME, 
    api_key: configService.CLUDINARY_API_KEY, 
    api_secret: configService.CLUDINARY_API_SECRET,
});

export default cloudinary;