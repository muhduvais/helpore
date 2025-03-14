
import { Document, FilterQuery, UpdateWriteOpResult } from 'mongoose';
import { IBaseRepository } from '../../repositories/interfaces/IBaseRepository';
import { IBaseService } from '../interfaces/IBaseService';

export abstract class BaseService<T extends Document> implements IBaseService<T> {
    constructor(
        protected readonly repository: IBaseRepository<T>
    ) { }

    async findById(id: string): Promise<T | null> {
        try {
            return await this.repository.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async findAll( query: object, skip: number = 0, limit: number = 10): Promise<T[]> {
        try {
            return await this.repository.findAll(query, skip, limit);
        } catch (error) {
            throw error;
        }
    }

    async count(filter: Partial<T> = {}): Promise<number> {
        try {
            return await this.repository.count(filter);
        } catch (error) {
            throw error;
        }
    }

    async create(data: Partial<T>): Promise<T> {
        try {
            return await this.repository.create(data);
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        try {
            return await this.repository.findByIdAndUpdate(id, data);
        } catch (error) {
            throw error;
        }
    }

    async delete(id: string): Promise<T | null> {
        try {
            return await this.repository.delete(id);
        } catch (error) {
            throw error;
        }
    }

    async updateMany(filter: FilterQuery<T>, data: Partial<T>): Promise<UpdateWriteOpResult> {
        try {
            return await this.repository.updateMany(filter, data);
        } catch (error) {
            throw error;
        }
    }
}
