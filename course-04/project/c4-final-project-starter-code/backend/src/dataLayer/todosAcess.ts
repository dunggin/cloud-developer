import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import {createLogger} from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly logger = createLogger('todos-access')) {
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        this.logger.info(`Getting list todos for user ${userId}`)
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        this.logger.info(`Get list todos for user ${userId} success.`)

        const items = result.Items
        return items as TodoItem[]
    }

    async getTodoByIdForUser(userId: string, todoId: string): Promise<TodoItem> {
        this.logger.info(`Getting todo item with id ${todoId} for user ${userId}.`)
        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()

        this.logger.info(`Get todo item with id ${todoId} for user ${userId} success.`)

        const items = result.Items
        return items[0] as TodoItem
    }
    
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        this.logger.info(`Creating new todo item with id ${todoItem.todoId} for user ${todoItem.userId}.`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        this.logger.info(`Creat new todo item with id ${todoItem.todoId} for user ${todoItem.userId} success.`)

        return todoItem
    }

    async updateTodo(todoItem: TodoUpdate, userId: string, todoId: string) {
        const currentTodoItem = this.getTodoByIdForUser(userId, todoId)

        if (!currentTodoItem) {
            this.logger.error(`Not found todo item with id ${todoId} for user ${userId}.`)
            throw new Error(`Todo item not found with id ${todoId}`)
        }

        this.logger.info(`Updating data of todo item with id ${todoId} for user ${userId}.`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET #username = :username, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#username': 'name'
            },
            ExpressionAttributeValues: {
                ':username': todoItem.name,
                ':dueDate': todoItem.dueDate,
                ':done': todoItem.done
            }
        }).promise()

        this.logger.info(`Update data of todo item with id ${todoId} for user ${userId} success.`)
    }

    async updatePresignedUrlForTodoItem(todoItem: TodoUpdate, userId: string, todoId: string) {
        const currentTodoItem = this.getTodoByIdForUser(userId, todoId)
        
        if (!currentTodoItem) {
            this.logger.error(`Not found todo item with id ${todoId} for user ${userId}.`)
            throw new Error(`Todo item not found with id ${todoId}`)
        }

        this.logger.info(`Updating attachmentUrl of todo item with id ${todoId} for user ${userId}.`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': todoItem.attachmentUrl
            }
        }).promise()

        this.logger.info(`Update attachmentUrl of todo item with id ${todoId} for user ${userId} success.`)
    }

    async deleteTodo(todoId: string, userId: string) {
        this.logger.info(`Deleting todo item with id ${todoId} for user ${userId}.`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise()
    }

   
}