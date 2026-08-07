const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    findByEmail,
    findById,
    create
} = require("../models/userModel");

const registerUser = async (userData) => {

    const existingUser = await findByEmail(userData.email);

    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUserData = {
        ...userData,
        password: hashedPassword
    };

    return await create(newUserData);
};

const loginUser = async (email, password) => {

    const user = await findByEmail(email);

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (user.is_active === false) {
        const error = new Error("Account is inactive");
        error.statusCode = 403;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            employeeId: user.employee_id,
            role: user.role,
            name: user.name
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        user,
        token
    };
};

const getCurrentUser = async (userId) => {

    const user = await findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};