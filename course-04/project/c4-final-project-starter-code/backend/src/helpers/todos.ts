import { TodoAccess } from '../dataLayer/todoAcess'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

import { createAttachmentUrl } from './attachmentUtils'
const todosAcess = new TodoAccess()

export async function getTodosForUser(userId: string) {
    return await todosAcess.getUserTodos(userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string) {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()

    return await todosAcess.createTodo({
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

    // TODO need to update
    return await todosAcess.updateTodo(
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
    const todoItem = await todosAcess.getTodoByIdForUser(userId, todoId)
    const attachmentUrl = await createAttachmentUrl(attachmentId)
    return await todosAcess.updatePresignedUrlForTodoItem(
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
    return await todosAcess.deleteTodo(todoId, userId)
}
