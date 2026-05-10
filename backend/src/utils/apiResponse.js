export const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {})
  });
};
