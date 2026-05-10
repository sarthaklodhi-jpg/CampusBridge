import xss from "xss";

export const sanitizeHtml = (value) => {
  if (typeof value !== "string") return value;
  return xss(value.trim(), {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"]
  });
};
