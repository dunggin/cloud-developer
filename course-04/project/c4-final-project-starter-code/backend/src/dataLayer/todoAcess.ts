
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import {createLogger} from '../utils/logger'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('todos-access');

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getUserTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting list todos for user ${userId}`)
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        logger.info(`Got list todos for user ${userId} success.`)

        const items = result.Items
        return items as TodoItem[]
    }

    async getTodoByIdForUser(userId: string, todoId: string): Promise<TodoItem> {
        logger.info(`Getting todo item with id ${todoId} for user ${userId}.`)
        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()

        logger.info(`Got todo item with id ${todoId} for user ${userId} success.`)

        const items = result.Items
        return items[0] as TodoItem
    }
    
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info(`Creating new todo item with id ${todoItem.todoId} for user ${todoItem.userId}.`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        logger.info(`Created new todo item with id ${todoItem.todoId} for user ${todoItem.userId} success.`)

        return todoItem
    }

    async updateTodo(todoItem: TodoUpdate, userId: string, todoId: string) {
        const currentTodoItem = this.getTodoByIdForUser(userId, todoId)

        if (!currentTodoItem) {
            logger.error(`Not found todo item with id ${todoId} for user ${userId}.`)
            throw new Error(`Todo item not found with id ${todoId}`)
        }

        logger.info(`Updating data of todo item with id ${todoId} for user ${userId}.`)

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

        logger.info(`Updated data of todo item with id ${todoId} for user ${userId} success.`)
    }

    async updatePresignedUrlForTodoItem(todoItem: TodoUpdate, userId: string, todoId: string) {
        const currentTodoItem = this.getTodoByIdForUser(userId, todoId)
        
        if (!currentTodoItem) {
            logger.error(`Not found todo item with id ${todoId} for user ${userId}.`)
            throw new Error(`Todo item not found with id ${todoId}`)
        }

        logger.info(`Updating attachmentUrl of todo item with id ${todoId} for user ${userId}.`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {':attachmentUrl': todoItem.attachmentUrl}
        }).promise()

        logger.info(`Updated attachmentUrl of todo item with id ${todoId} for user ${userId} success.`)
    }

    async deleteTodo(todoId: string, userId: string) {
        logger.info(`Deleting todo item with id ${todoId} for user ${userId}.`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise()
    }
   
}