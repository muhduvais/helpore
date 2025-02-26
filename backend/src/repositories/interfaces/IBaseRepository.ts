import { Document, FilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findAll(query: object, skip: number, limit: number): Promise<T[] | null>;
  findById(id: string): Promise<T | null>;
  findByQuery(query: FilterQuery<T>): Promise<T | null>;
  findByIdAndUpdate(id: string, data: UpdateQuery<T>): Promise<T | null>;
  updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<UpdateWriteOpResult>;
  delete(id: string): Promise<T | null>;
  count(query: object): Promise<number>;
}