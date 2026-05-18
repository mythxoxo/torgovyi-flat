import {
  booleanFromEnv,
  loadOptionalEnvFile,
  numberFromEnv,
  optionalString
} from "@meme-launchpad/config";

loadOptionalEnvFile();

export const apiEnv = {
  host: optionalString(process.env.API_HOST, "0.0.0.0"),
  port: numberFromEnv(process.env.API_PORT, 3001),
  publicUrl: optionalString(process.env.API_PUBLIC_URL, "http://localhost:3001"),
  dataFile: optionalString(process.env.DATA_FILE, "data/launchpad-local.json"),
  databaseUrl: optionalString(process.env.DATABASE_URL),
  telegramWebAppUrl: optionalString(process.env.TELEGRAM_WEBAPP_URL, "http://localhost:3000"),
  allowDevWallet: booleanFromEnv(process.env.ALLOW_DEV_WALLET, false),
  uploadStorage: optionalString(process.env.UPLOAD_STORAGE, "local"),
  s3Bucket: optionalString(process.env.S3_BUCKET),
  s3Region: optionalString(process.env.S3_REGION),
  s3AccessKey: optionalString(process.env.S3_ACCESS_KEY),
  s3SecretKey: optionalString(process.env.S3_SECRET_KEY),
  s3PublicBaseUrl: optionalString(process.env.S3_PUBLIC_BASE_URL)
};
