import Record from "./../models/recordModel.js";
import AppError from "../utils/appError.js";
import FileReader from "../utils/readFile.js"
import fs from "fs"
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink)

const RecordController = {
	async getRecordData(req, res, next) {
		try {
			const userId = req.user._id;
			if (!userId) {
				throw new AppError("User ID lost", 400);
			}
			const recordData = await Record.findOne({ userId: userId });
			res.status(200).json({
				status: "success",
				data: recordData,
			});
		} catch (error) {
			return next(error);
		}
	},

	async updateRecordData(req, res, next) {
		try {
			const userId = req.user._id;
			if (!userId) {
				throw new AppError("User ID lost", 400);
			}

			const recordData = await Record.findOneAndUpdate(
				{ userId: userId },
				{ ...req.body, timestamp: Date.now() },
				{ new: true, upsert: true }
			);
			res.status(200).json({
				status: "success",
				data: recordData,
			});
		} catch (error) {
			return next(error);
		}
	},

	async deleteRecordData(req, res, next) {
		try {
			const userId = req.user._id;
			if (!userId) {
				throw new AppError("User ID lost", 400);
			}
			const deletedData = await Record.findOneAndDelete({
				userId: userId,
			});
			res.status(200).json({
				status: "success",
				data: deletedData,
			});
		} catch (error) {
			return next(error);
		}
	},

	async importRecordData(req, res, next) {
		try {
			const userId = req.user._id;
			const data = await FileReader(req.file);
			await unlinkAsync(req.file.path);
			const filename = req.file.originalname;
			const patientId = filename.split("_")[0];
			const response = await Record.findOneAndUpdate(
				{
					userId: userId,
				},
				{
					finished: false,
					patientId: patientId,
					recordData: data,
					timestamp: Date.now(),
				},
				{
					upsert:true,
					includeResultMetadata: true,
					returnOriginal:false
				}
			);
			// console.log(response)
			res.status(200).json({
				status: "success",
			});
		} catch (error) {
			console.log(error)
			return next(error);
		}
	},
};

export default RecordController;
