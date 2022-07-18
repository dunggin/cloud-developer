import * as uuid from 'uuid';

import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoAccess} from "../dataLayer/todoAcess";
import { createAttachmentUrl } from '../helpers/attachmentUtils';

const toDoAccess = new TodoAccess();

export async function getTodosForUser(userId: string) {
    return await toDoAccess.getUserTodos(userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string) {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()

    return await toDoAccess.createTodo({
        todoId: todoId,
        userId: userId,
        createdAt: createdAt,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string) {
    const createdAt = new Date().toISOString()

    return await toDoAccess.updateTodo(
        {
            name: updateTodoRequest.name,
            dueDate: updateTodoRequest.dueDate,
            done: updateTodoRequest.done
        }, 
        userId, 
        todoId
    )
}

export async function updatePresignedUrlForTodoItem(userId: string, todoId: string, attachmentId: string) {
    const todoItem = await toDoAccess.getTodoByIdForUser(userId, todoId)
    const attachmentUrl = await createAttachmentUrl(attachmentId)
    return await toDoAccess.updatePresignedUrlForTodoItem(
        {
            name: todoItem.name,
            dueDate: todoItem.dueDate,
            done: todoItem.done,
            attachmentUrl: attachmentUrl
        }, 
        userId, 
        todoId
    )
}

export async function deleteTodo(todoId: string, userId: string) {
    return await toDoAccess.deleteTodo(todoId, userId)
}