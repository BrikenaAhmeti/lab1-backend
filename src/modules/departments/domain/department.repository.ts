import {
    DepartmentDoctorEntity,
    DepartmentEntity,
    DepartmentRoomEntity,
} from './department.entity';

export interface CreateDepartmentData {
    name: string;
    description?: string | null;
    location: string;
}

export interface UpdateDepartmentData {
    name: string;
    description?: string | null;
    location: string;
}

export interface DepartmentUsage {
    doctors: number;
    rooms: number;
    nurses: number;
}

export interface DepartmentRepository {
    create(data: CreateDepartmentData): Promise<DepartmentEntity>;
    findMany(): Promise<DepartmentEntity[]>;
    findById(id: string): Promise<DepartmentEntity | null>;
    findByName(name: string): Promise<DepartmentEntity | null>;
    update(id: string, data: UpdateDepartmentData): Promise<DepartmentEntity>;
    delete(id: string): Promise<DepartmentEntity>;
    findDoctorsByDepartmentId(
        departmentId: string,
    ): Promise<DepartmentDoctorEntity[]>;
    findRoomsByDepartmentId(
        departmentId: string,
    ): Promise<DepartmentRoomEntity[]>;
    countUsage(departmentId: string): Promise<DepartmentUsage>;
}
