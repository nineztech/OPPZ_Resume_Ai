    import { Sequelize, DataTypes } from "sequelize";
    import { sequelize } from "../config/dbConnection.js";

    const Resume = sequelize.define(
    "resumes",
    {
        id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        },
        userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
        },
        title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Untitled Resume'
        },
        templateId: {
        type: DataTypes.STRING,
        allowNull: false
        },
        selectedColor: {
        type: DataTypes.STRING,
        defaultValue: 'blue'
        },
        resumeData: {
        type: DataTypes.JSON,
        allowNull: false
        },
        isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
        },
        lastEdited: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
        }
    },
    {
        timestamps: true
    }
    );

    export default Resume;