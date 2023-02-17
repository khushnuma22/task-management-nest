import { IsEnum } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class UpdateTaskStatusDto {
    // @isEnum(TaskStatus)
    @IsEnum(TaskStatus)
    status: TaskStatus;
}