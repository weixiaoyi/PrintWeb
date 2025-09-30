const crypto = require("crypto");

exports.encrypt = (str) => {
    const algorithm = "aes-256-cbc";
    const key =
        "1894a02226eb3e7f0b625ed1590c6b12cd7cac2804c7fece5f04af7241b67764";
    const iv = "16706913718c7b32ebb53baa647caef2";
    const text = str;
    const cipher = crypto.createCipheriv(
        algorithm,
        Buffer.from(key, "hex"),
        Buffer.from(iv, "hex")
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

exports.decrypt = (encryptedText) => {
    const algorithm = "aes-256-cbc";
    const key =
        "1894a02226eb3e7f0b625ed1590c6b12cd7cac2804c7fece5f04af7241b67764";
    const iv = "16706913718c7b32ebb53baa647caef2";
    let decrypted;
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(key, "hex"),
        Buffer.from(iv, "hex")
    );
    decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
