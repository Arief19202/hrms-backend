const {
    findAll,
    findById,
    findByName,
    create,
    update,
    remove
} = require("../models/departmentModel");

const getAllDepartments = async (query) => {
    return await findAll(query);
};

const getDepartmentById = async (id) => {
    return await findById(id);
};

const createDepartment = async (departmentData) => {

    const existingDepartment = await findByName(departmentData.name);

    if (existingDepartment) {
        const error = new Error("Department already exists");
        error.statusCode = 400;
        throw error;
    }

    return await create(departmentData);
};

const updateDepartment = async (id, departmentData) => {

    const department = await findById(id);

    if (!department) {
        return null;
    }

    if (departmentData.name) {

        const existingDepartment = await findByName(departmentData.name);

        if (
            existingDepartment &&
            existingDepartment.id !== Number(id)
        ) {
            const error = new Error("Department already exists");
            error.statusCode = 400;
            throw error;
        }
    }

    return await update(id, departmentData);
};

const deleteDepartment = async (id) => {

    const department = await findById(id);

    if (!department) {
        return null;
    }

    return await remove(id);
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};