export const loadOptionalEnvFile = () => {
  try {
    process.loadEnvFile?.();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    return;
  }

  try {
    process.loadEnvFile?.(".env.production");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
};
