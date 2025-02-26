import { FilterQuery, UpdateWriteOpResult } from "mongoose";

export interface IBaseService<T> {
  findById(id: string): Promise<T | null>;
  findAll(query: object, skip: number, limit: number): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  updateMany(filter: FilterQuery<T>, data: Partial<T>): Promise<UpdateWriteOpResult>;
  delete(id: string): Promise<T | null>;
}