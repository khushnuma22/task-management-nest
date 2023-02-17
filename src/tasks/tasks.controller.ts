import { Logger } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { GetTaskFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('TaskController');
    constructor(private tasksService: TasksService) { } 

    @Get()
    getTasks(
        @Query() filterDto: GetTaskFilterDto,
        @GetUser() user: User
    ): Promise<Task[]> {
        this.logger.verbose(`User ${user.username} retrieving all task. FIlters ${JSON.stringify(filterDto)}`)
        return this.tasksService.getTasks(filterDto, user);
    }
    @Get('/:id')
    getTaskById(
        @Param('id') id: string,
        @GetUser() user: User,): Promise<Task> {
        return this.tasksService.getTaskById(id, user);
    }

    @Post()
    createTask(
        @Body() createTaskDto: CreateTaskDto,
        @GetUser() user: User,
    ): Promise<Task> {
        this.logger.verbose(`User ${user.username} creating a task. Data ${JSON.stringify(createTaskDto)}`)
        return this.tasksService.createTask(createTaskDto, user);
    }

    @Delete('/:id')
    deleteTask(@Param('id') id: string,
    @GetUser() user: User): Promise<void> {
        return this.tasksService.deleteTask(id,user);
    }

    @Patch('/:id/status')
    updateTaskStatus(
        @Param('id') id: string,
        @GetUser() user: User,
        @Body() updateStatusDto: UpdateTaskStatusDto,
    ): Promise<Task> {
        const { status } = updateStatusDto
        return this.tasksService.updateTaskStatus(id, status,user);
    }
}
