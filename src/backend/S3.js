import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
dotenv.config();

const { S3_ENDPOINT, BUCKET_NAME, BUCKET_SERVER_NAME, S3_ACCESS_KEY, S3_SECRET_KEY } = process.env;

const s3 = new S3Client({
    region: "eu-central-003",
    credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
    },
    endpoint: S3_ENDPOINT, // Contabo Object Storage endpoint
    disableS3ExpressSessionAuth: true, // Required for some S3-compatible services
    forcePathStyle: true, // Required for some S3-compatible services
    signatureVersion: 'v4', // Recommended for Contabo Object Storage
});

export const allUpload = (path, nameFnc, size, filter) =>
    multer({
        storage: multerS3({
            s3: s3,
            bucket: BUCKET_NAME,
            acl: 'public-read',
            metadata: (req, file, cb) => {
                cb(null, {
                    fieldName: file.fieldname,
                });
            },
            key: function (req, file, cb) {
                let uniqueFileName = nameFnc(req, file) || "";
                let finalKey = "";
                if (!uniqueFileName) {
                    const uniqueSuffix = `${Date.now()}`;
                    const fileExtension = path.extname(file.originalname);
                    uniqueFileName = `${uniqueSuffix}${fileExtension}`;
                    finalKey = `${path}/${uniqueFileName}`;
                }
                // Prepend folder to the file key
                // const folderPath = folder ? `${folder}/` : '';  // Ensure folder is passed
                finalKey = `${BUCKET_SERVER_NAME}/${uniqueFileName}`;  // Set file path including folder
                cb(null, finalKey);  // Use finalKey with the folder structure
            },
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // cacheControl: 'no-cache',
        }),
        limits: {
            fileSize: size * 1000000, // size*1 MB
        },
        fileFilter: (req, file, callback) => {
            if (typeCheck(file, filter)) {
                callback(null, true);
            } else {
                callback(new Error("file is not supported"));
            }
        },
    });

export const deleteFile = async (urlOrKey) => {
    try {
        const key = urlOrKey.includes('https://')
            ? urlOrKey.split('.com/')[1]  // Gets everything after .com/
            : urlOrKey;

        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
        };

        const command = new DeleteObjectCommand(params);
        const data = await s3.send(command);
        // console.log("Success. File deleted:", data);
        return data;
    } catch (err) {
        console.log("Error deleting file:", err);
        throw err;
    }
};

const typeCheck = (file, filter) => {
    if (filter == "img,pdf") {
        return ["image/png", "image/jpg", "image/jpeg", "application/pdf"].includes(file.mimetype);
    }
    if (filter == "img") {
        return ["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype);
    }
    return false;
};

// import { ListObjectsCommand } from "@aws-sdk/client-s3";

// async function testS3Connection() {
//     try {
//         const command = new ListObjectsCommand({
//             Bucket: "cdn.ticketmet.com",  // Ensure this is passed correctly
//             Key: 'aircontrols'
//         });
//         const response = await s3.send(command);
//         console.log("S3 connection successful:", response);
//     } catch (error) {
//         // console.error("S3 connection failed:", error);
//         if (error.$metadata) {
//             // console.error("Error metadata:", error.$metadata);
//         }
//     }
// }

// testS3Connection();
export default s3;