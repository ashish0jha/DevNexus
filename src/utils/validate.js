const validator = require("validator");

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req?.body;

    if (!firstName || !lastName) {
        throw new Error("Invalid Name");
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Invalid Email");
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("weak Password");
    }
};

const isValidEditData = (req) => {
    const ALLOWED_FIELDS = [
        "firstName",
        "lastName",
        "age",
        "gender",
        "photoUrl",
        "about",
        "skills",
        "location",
    ];
    const isValidFields = Object.keys(req.body).every((feild) =>
        ALLOWED_FIELDS.includes(feild),
    );
    if (!isValidFields) {
        throw new Error("Invalid Input Fields")
    }
};

const validPostUplaod = (req) => {
    const ALLOWED_FIELDS = ["content", "imageUrl"];

    const isValidField = Object.keys(req.body).every((key) => ALLOWED_FIELDS.includes(key));
    if (!isValidField) {
        throw new Error("Invalid fields");
    }
    if (content.length > 750) {
        throw new Error("Content is not supported");
    }
}

module.exports = { validateSignUpData, isValidEditData, validPostUplaod };
