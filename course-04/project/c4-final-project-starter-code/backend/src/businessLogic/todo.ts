import {TodoItem} from "../models/TodoItem";
import {ToDoAccess} from "../dataLayer/toDoAccess";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";

const uuidv4 = require('uuid/v4');
const toDoAccess = new ToDoAccess();

export async function getAllToDo(userId: string): Promise<TodoItem[]> {
    return toDoAccess.getAllToDo(userId);
}

export function createToDo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    return toDoAccess.createToDo({
        userId: userId,
        todoId: uuidv4(),
        createdAt: new Date().getTime().toString(),
        done: false,
        createTodoRequest,
    });
}

export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<TodoUpdate> {
    return toDoAccess.updateToDo(updateTodoRequest, todoId, userId);
}

export function deleteToDo(todoId: string, userId: string): Promise<string> {
    return toDoAccess.deleteToDo(todoId, userId);
}

export function generateUploadUrl(todoId: string,userId: string): Promise<string> {
    return toDoAccess.generateUploadUrl(todoId,userId);
}