import {
    DoctorDepartmentEntity,
    DoctorEntity,
    DoctorUserEntity,
} from './doctor.entity';

export interface CreateDoctorData {
    userId: string;
    firstName: string;
    lastName: string;
    specialization: string;
    departmentId: string;
    phoneNumber: string;
}

export interface UpdateDoctorData {
    userId?: string;
    firstName?: string;
    lastName?: string;
    specialization?: string;
    departmentId?: string;
    phoneNumber?: string;
}

export interface DoctorRepository {
    create(data: CreateDoctorData): Promise<DoctorEntity>;
    findMany(): Promise<DoctorEntity[]>;
    findById(id: string): Promise<DoctorEntity | null>;
    findByUserId(userId: string): Promise<DoctorEntity | null>;
    findUserById(userId: string): Promise<DoctorUserEntity | null>;
    findDepartmentById(
        departmentId: string,
    ): Promise<DoctorDepartmentEntity | null>;
    update(id: string, data: UpdateDoctorData): Promise<DoctorEntity>;
    delete(id: string): Promise<DoctorEntity>;
}
