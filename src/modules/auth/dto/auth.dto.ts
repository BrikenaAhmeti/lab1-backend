import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsDefined,
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import {
    NormalizeNullableString,
    NormalizeString,
    OptionalField,
    OptionalNullableField,
} from '../../../shared/validation/decorators';
import {
    assertAtLeastOneField,
    validateDto,
} from '../../../shared/validation/validate-dto';

const usernameRegex = /^[a-zA-Z0-9._-]+$/;

export class RegisterDto {
    @IsDefined({ message: 'First name is required' })
    @IsString({ message: 'First name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    @MaxLength(100, { message: 'First name must not exceed 100 characters' })
    firstName!: string;

    @IsDefined({ message: 'Last name is required' })
    @IsString({ message: 'Last name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
    lastName!: string;

    @IsDefined({ message: 'Email is required' })
    @IsString({ message: 'Email is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email!: string;

    @OptionalField()
    @IsString({ message: 'Username must be a string' })
    @NormalizeString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(30, { message: 'Username must not exceed 30 characters' })
    @Matches(usernameRegex, {
        message: 'Username can contain only letters, numbers, dots, underscores, and hyphens',
    })
    username?: string;

    @IsDefined({ message: 'Password is required' })
    @IsString({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    password!: string;

    @OptionalField()
    @IsString({ message: 'Phone number must be a string' })
    @NormalizeString()
    @MaxLength(30, { message: 'Phone number must not exceed 30 characters' })
    phoneNumber?: string;
}

export class LoginDto {
    @OptionalField()
    @IsString({ message: 'Identifier must be a string' })
    @NormalizeString()
    @MaxLength(100, { message: 'Identifier must not exceed 100 characters' })
    identifier?: string;

    @OptionalField()
    @IsString({ message: 'Email must be a string' })
    @NormalizeString()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email?: string;

    @IsDefined({ message: 'Password is required' })
    @IsString({ message: 'Password is required' })
    @MinLength(1, { message: 'Password is required' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    password!: string;
}

export class RefreshDto {
    @IsDefined({ message: 'Refresh token is required' })
    @IsString({ message: 'Refresh token is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken!: string;
}

export class CreateUserDto {
    @IsDefined({ message: 'First name is required' })
    @IsString({ message: 'First name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    @MaxLength(100, { message: 'First name must not exceed 100 characters' })
    firstName!: string;

    @IsDefined({ message: 'Last name is required' })
    @IsString({ message: 'Last name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
    lastName!: string;

    @IsDefined({ message: 'Email is required' })
    @IsString({ message: 'Email is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email!: string;

    @OptionalField()
    @IsString({ message: 'Username must be a string' })
    @NormalizeString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(30, { message: 'Username must not exceed 30 characters' })
    @Matches(usernameRegex, {
        message: 'Username can contain only letters, numbers, dots, underscores, and hyphens',
    })
    username?: string;

    @IsDefined({ message: 'Password is required' })
    @IsString({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    password!: string;

    @OptionalField()
    @IsString({ message: 'Phone number must be a string' })
    @NormalizeString()
    @MaxLength(30, { message: 'Phone number must not exceed 30 characters' })
    phoneNumber?: string;

    @OptionalField()
    @IsBoolean({ message: 'emailConfirmed must be a boolean' })
    emailConfirmed?: boolean;

    @OptionalField()
    @IsBoolean({ message: 'lockoutEnabled must be a boolean' })
    lockoutEnabled?: boolean;

    @OptionalField()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;

    @OptionalField()
    @IsArray({ message: 'roleIds must be an array' })
    @IsString({ each: true, message: 'Role id is required' })
    @IsNotEmpty({ each: true, message: 'Role id is required' })
    roleIds?: string[];
}

export class CreateReceptionistDto {
    @IsDefined({ message: 'First name is required' })
    @IsString({ message: 'First name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    @MaxLength(100, { message: 'First name must not exceed 100 characters' })
    firstName!: string;

    @IsDefined({ message: 'Last name is required' })
    @IsString({ message: 'Last name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
    lastName!: string;

    @IsDefined({ message: 'Email is required' })
    @IsString({ message: 'Email is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email!: string;

    @OptionalField()
    @IsString({ message: 'Username must be a string' })
    @NormalizeString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(30, { message: 'Username must not exceed 30 characters' })
    @Matches(usernameRegex, {
        message: 'Username can contain only letters, numbers, dots, underscores, and hyphens',
    })
    username?: string;

    @IsDefined({ message: 'Password is required' })
    @IsString({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    password!: string;

    @OptionalField()
    @IsString({ message: 'Phone number must be a string' })
    @NormalizeString()
    @MaxLength(30, { message: 'Phone number must not exceed 30 characters' })
    phoneNumber?: string;

    @OptionalField()
    @IsBoolean({ message: 'emailConfirmed must be a boolean' })
    emailConfirmed?: boolean;

    @OptionalField()
    @IsBoolean({ message: 'lockoutEnabled must be a boolean' })
    lockoutEnabled?: boolean;

    @OptionalField()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;
}

export class UpdateUserDto {
    @OptionalField()
    @IsString({ message: 'First name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    @MaxLength(100, { message: 'First name must not exceed 100 characters' })
    firstName?: string;

    @OptionalField()
    @IsString({ message: 'Last name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
    lastName?: string;

    @OptionalField()
    @IsString({ message: 'Email is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email?: string;

    @OptionalField()
    @IsString({ message: 'Username must be a string' })
    @NormalizeString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(30, { message: 'Username must not exceed 30 characters' })
    @Matches(usernameRegex, {
        message: 'Username can contain only letters, numbers, dots, underscores, and hyphens',
    })
    username?: string;

    @OptionalField()
    @IsString({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    password?: string;

    @OptionalNullableField()
    @IsString({ message: 'Phone number must be a string' })
    @NormalizeNullableString()
    @MaxLength(30, { message: 'Phone number must not exceed 30 characters' })
    phoneNumber?: string | null;

    @OptionalField()
    @IsBoolean({ message: 'emailConfirmed must be a boolean' })
    emailConfirmed?: boolean;

    @OptionalField()
    @IsBoolean({ message: 'lockoutEnabled must be a boolean' })
    lockoutEnabled?: boolean;

    @OptionalField()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;

    @OptionalField()
    @IsArray({ message: 'roleIds must be an array' })
    @IsString({ each: true, message: 'Role id is required' })
    @IsNotEmpty({ each: true, message: 'Role id is required' })
    roleIds?: string[];
}

export class SetUserStatusDto {
    @IsDefined({ message: 'isActive is required' })
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive!: boolean;
}

export class ChangePasswordDto {
    @IsDefined({ message: 'Current password is required' })
    @IsString({ message: 'Current password is required' })
    @MinLength(1, { message: 'Current password is required' })
    @MaxLength(255, { message: 'Current password must not exceed 255 characters' })
    currentPassword!: string;

    @IsDefined({ message: 'New password is required' })
    @IsString({ message: 'New password is required' })
    @MinLength(6, { message: 'New password must be at least 6 characters' })
    @MaxLength(255, { message: 'New password must not exceed 255 characters' })
    newPassword!: string;
}

export class SetUserPasswordDto {
    @IsDefined({ message: 'Password is required' })
    @IsString({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    password!: string;
}

export class ConfirmEmailDto {
    @IsDefined({ message: 'Token is required' })
    @IsString({ message: 'Token is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Token is required' })
    token!: string;
}

export class ResendConfirmationEmailDto {
    @IsDefined({ message: 'Email is required' })
    @IsString({ message: 'Email is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email!: string;
}

export class CreateRoleDto {
    @IsDefined({ message: 'Name is required' })
    @IsString({ message: 'Name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name!: string;

    @OptionalField()
    @IsString({ message: 'Description must be a string' })
    @NormalizeString()
    @MaxLength(255, { message: 'Description must not exceed 255 characters' })
    description?: string;

    @OptionalField()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;
}

export class UpdateRoleDto {
    @OptionalField()
    @IsString({ message: 'Name is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name?: string;

    @OptionalNullableField()
    @IsString({ message: 'Description must be a string' })
    @NormalizeNullableString()
    @MaxLength(255, { message: 'Description must not exceed 255 characters' })
    description?: string | null;

    @OptionalField()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;
}

export class AssignRoleDto {
    @IsDefined({ message: 'Role id is required' })
    @IsString({ message: 'Role id is required' })
    @NormalizeString()
    @IsNotEmpty({ message: 'Role id is required' })
    roleId!: string;
}

export class ReplaceRolesDto {
    @IsDefined({ message: 'roleIds is required' })
    @IsArray({ message: 'roleIds must be an array' })
    @ArrayNotEmpty({ message: 'roleIds must contain at least one role id' })
    @IsString({ each: true, message: 'Role id is required' })
    @IsNotEmpty({ each: true, message: 'Role id is required' })
    roleIds!: string[];
}

export function validateRegisterDto(input: unknown) {
    return validateDto(RegisterDto, input);
}

export function validateLoginDto(input: unknown) {
    const dto = validateDto(LoginDto, input);

    assertAtLeastOneField(dto, ['identifier', 'email'], 'identifier or email is required');

    return dto;
}

export function validateRefreshDto(input: unknown) {
    return validateDto(RefreshDto, input);
}

export function validateCreateUserDto(input: unknown) {
    return validateDto(CreateUserDto, input);
}

export function validateCreateReceptionistDto(input: unknown) {
    return validateDto(CreateReceptionistDto, input);
}

export function validateUpdateUserDto(input: unknown) {
    const dto = validateDto(UpdateUserDto, input);

    assertAtLeastOneField(
        dto,
        [
            'firstName',
            'lastName',
            'email',
            'username',
            'password',
            'phoneNumber',
            'emailConfirmed',
            'lockoutEnabled',
            'isActive',
            'roleIds',
        ],
    );

    return dto;
}

export function validateSetUserStatusDto(input: unknown) {
    return validateDto(SetUserStatusDto, input);
}

export function validateChangePasswordDto(input: unknown) {
    return validateDto(ChangePasswordDto, input);
}

export function validateSetUserPasswordDto(input: unknown) {
    return validateDto(SetUserPasswordDto, input);
}

export function validateConfirmEmailDto(input: unknown) {
    return validateDto(ConfirmEmailDto, input);
}

export function validateResendConfirmationEmailDto(input: unknown) {
    return validateDto(ResendConfirmationEmailDto, input);
}

export function validateCreateRoleDto(input: unknown) {
    return validateDto(CreateRoleDto, input);
}

export function validateUpdateRoleDto(input: unknown) {
    const dto = validateDto(UpdateRoleDto, input);

    assertAtLeastOneField(dto, ['name', 'description', 'isActive']);

    return dto;
}

export function validateAssignRoleDto(input: unknown) {
    return validateDto(AssignRoleDto, input);
}

export function validateReplaceRolesDto(input: unknown) {
    return validateDto(ReplaceRolesDto, input);
}
