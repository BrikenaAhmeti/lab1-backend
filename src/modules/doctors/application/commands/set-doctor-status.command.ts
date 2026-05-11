export class SetDoctorStatusCommand {
    constructor(
        public readonly id: string,
        public readonly isActive: boolean,
    ) { }
}
