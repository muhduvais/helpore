import { Model, Document, FilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";
import { IBaseRepository } from "./interfaces/IBaseRepository";

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    constructor(protected readonly model: Model<T>) { }

    async create(data: Partial<T>): Promise<T> {
        try {
            return await this.model.create(data);
        } catch (error) {
            console.error(`Error creating ${this.model.modelName}:`, error);
            throw error;
        }
    }

    async find(): Promise<T[] | null> {
        try {
            return await this.model.find({});
        } catch (error) {
            console.error(`Error finding ${this.model.modelName}`, error);
            throw error;
        }
    }

    async findAll(query: object, skip: number, limit: number): Promise<T[] | null> {
        try {
            return await this.model.find(query).skip(skip).limit(limit);
        } catch (error) {
            console.error(`Error finding ${this.model.modelName} by id:`, error);
            throw error;
        }
    }

    async findById(id: string): Promise<T | null> {
        try {
            return await this.model.findById(id);
        } catch (error) {
            console.error(`Error finding ${this.model.modelName} by id:`, error);
            throw error;
        }
    }

    async findByEmail(email: string): Promise<T | null> {
        try {
            return await this.model.findOne({ email });
        } catch (error) {
            console.error(`Error finding ${this.model.modelName} by email:`, error);
            throw error;
        }
    }

    async findByQuery(query: FilterQuery<T>): Promise<T | null> {
        try {
            return await this.model.findOne(query);
        } catch (error) {
            console.error(`Error finding ${this.model.modelName} by query:`, error);
            throw error;
        }
    }

    async findByIdAndUpdate(id: string, data: UpdateQuery<T>): Promise<T | null> {
        try {
            return await this.model.findByIdAndUpdate(id, data, { new: true });
        } catch (error) {
            console.error(`Error updating ${this.model.modelName}:`, error);
            throw error;
        }
    }

    async updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<UpdateWriteOpResult> {
        try {
            return await this.model.updateMany(filter, data);
        } catch (error) {
            console.error(`Error updating ${this.model.modelName}:`, error);
            throw error;
        }
    }

    async delete(id: string): Promise<T | null> {
        try {
            return await this.model.findByIdAndDelete(id);
        } catch (error) {
            console.error(`Error deleting ${this.model.modelName}:`, error);
            throw error;
        }
    }

    async count(query: object): Promise<number> {
        try {
            return await this.model.countDocuments(query).exec();
        } catch (error) {
            console.error(`Error counting ${this.model.modelName} documents:`, error);
            throw error;
        }
    }
}