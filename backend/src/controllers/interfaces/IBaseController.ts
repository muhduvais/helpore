export interface IBaseController {
    getAll(req: any, res: any): Promise<void>;
    getById(req: any, res: any): Promise<void>;
    create(req: any, res: any): Promise<void>;
    update(req: any, res: any): Promise<void>;
    delete(req: any, res: any): Promise<void>;
}
