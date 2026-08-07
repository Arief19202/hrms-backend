const {
    registerUser,
    loginUser,
    getCurrentUser
} = require("../services/authService");

const register = async (req, res, next) => {

    try {

        const newUser = await registerUser(req.body);

        const safeUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            employee_id: newUser.employee_id,
            created_at: newUser.created_at
        };

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: safeUser
        });

    } catch (error) {
        next(error);
    }

};

const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        const result = await loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                    employee_id: result.user.employee_id
                },
                token: result.token
            }
        });

    } catch (error) {
        next(error);
    }

};

const me = async (req, res, next) => {

    try {

        const user = await getCurrentUser(req.user.userId);

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {
    register,
    login,
    me
};