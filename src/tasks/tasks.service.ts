import { InternalServerErrorException, Logger } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { GetTaskFilterDto } from './dto/get-tasks-filter.dto';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';

@Injectable()
export class TasksService {
    private logger = new Logger('TasksService',)
    constructor(
        @InjectRepository(TaskRepository)
        private tasksRepository: TaskRepository,
    ) { }


    async getTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
        const { status, search } = filterDto;

        const query = this.tasksRepository.createQueryBuilder('task');
        query.where({ user });

        if (status) {
            query.andWhere('task.status = :status', { status });
        }

        if (search) {
            query.andWhere('(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER( :search))', { search: `%${search}%` });
        }
        try {
            const tasks = await query.getMany();
            return tasks;
        } catch (error) {
            this.logger.error(`Failed to get tasks for user ${user.username}. Filters: ${JSON.stringify(filterDto)}`, error.stack);
            throw new InternalServerErrorException();
        }
    }


    async getTaskById(id: string,
        @GetUser() user: User,): Promise<Task> {
        const found = await this.tasksRepository.findOne({ where: { id, user } });

        if (!found) {
            throw new NotFoundException(`Task With ID ${id} not found`);
        }
        return found;
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;
        const task = this.tasksRepository.create({
            title,
            description,
            status: TaskStatus.OPEN,
            user,
        })
        await this.tasksRepository.save(task);
        return task;
    }

    async deleteTask(id: string,
        @GetUser() user: User): Promise<void> {
        const result = await this.tasksRepository.delete({ id, user });

        if (result.affected === 0) {
            throw new NotFoundException(`Task With ID ${id} not found`);
        }
    }

    async updateTaskStatus(id: string, status: TaskStatus,
        @GetUser() user: User,
    ): Promise<Task> {
        // const task = await this.tasksRepository.getTaskById(id);
        const task = await this.getTaskById(id, user);

        task.status = status;
        await this.tasksRepository.save(task)
        return task;
    }
}
