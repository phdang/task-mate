import {
  ApolloServer,
  gql,
  IResolvers,
  UserInputError,
} from 'apollo-server-micro';
import mysql from 'serverless-mysql';
import { OkPacket } from 'mysql';

const typeDefs = gql`
  enum TaskStatus {
    active
    completed
  }

  type Task {
    id: Int!
    title: String!
    status: TaskStatus!
  }

  type Query {
    tasks(status: TaskStatus): [Task!]!
    task(id: Int!): Task
  }

  input CreateTaskInput {
    title: String!
  }

  input UpdateTaskInput {
    id: Int!
    title: String
    status: TaskStatus
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task
    updateTask(input: UpdateTaskInput): Task
    deleteTask(id: Int!): Task
  }
`;

interface ApolloContext {
  db: mysql.ServerlessMysql;
}

enum TaskStatus {
  active = 'active',
  completed = 'completed',
}

interface TaskDbRow {
  id: number;
  title: string;
  task_status: TaskStatus;
}

type TasksDbQueryResult = TaskDbRow[];
type TaskDbQueryResult = TaskDbRow[];

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

const getTaskById = async (id: number, db: mysql.ServerlessMysql) => {
  let query = 'SELECT `id`, title, task_status FROM tasks WHERE id = ?';
  const tasks = await db.query<TaskDbQueryResult>(query, [id]);
  const task = tasks.length ? tasks[0] : null;
  await db.end();
  return task
    ? { id: task.id, title: task.title, status: task.task_status }
    : null;
};

const resolvers: IResolvers<any, ApolloContext> = {
  Query: {
    async tasks(
      parent,
      args: { status?: TaskStatus },
      context
    ): Promise<Task[]> {
      const { status } = args;
      const queryParams: string[] = [];
      let query = 'SELECT `id`, title, task_status FROM tasks';
      if (status) {
        query = query + ' WHERE task_status = ?';
        queryParams.push(status);
      }

      const tasks = await context.db.query<TasksDbQueryResult>(
        query,
        queryParams
      );
      await context.db.end();
      return tasks.map(({ id, title, task_status }) => ({
        id,
        title,
        status: task_status,
      }));
    },
    async task(parent, args: { id: number }, context): Promise<Task | null> {
      const { id } = args;
      return await getTaskById(id, context.db);
    },
  },
  Mutation: {
    async createTask(
      parent,
      args: { input: { title: string } },
      context
    ): Promise<Task> {
      const result = await context.db.query<OkPacket>(
        'INSERT INTO tasks (title, task_status) VALUES (?, ?)',
        [args.input.title, TaskStatus.active]
      );
      await context.db.end();
      return {
        id: result.insertId,
        title: args.input.title,
        status: TaskStatus.active,
      };
    },
    async updateTask(
      parent,
      args: { input: { title: string; status: TaskStatus; id: number } },
      context
    ) {
      const columns: string[] = [];
      const sqlParams: any[] = [];

      if (args.input.title) {
        columns.push('title = ?');
        sqlParams.push(args.input.title);
      }

      if (args.input.status) {
        columns.push('task_status = ?');
        sqlParams.push(args.input.status);
      }

      sqlParams.push(args.input.id);

      const result = await context.db.query<OkPacket>(
        `UPDATE tasks SET ${columns.join(',')} WHERE id = ?`,
        sqlParams
      );

      const updatedTask = await getTaskById(args.input.id, context.db);

      return updatedTask;
    },
    async deleteTask(parent, args: { id: number }, context) {
      const deletedTask = await getTaskById(args.id, context.db);

      if (!deletedTask) {
        throw new UserInputError('Could not find task!');
      }

      const result = await context.db.query<OkPacket>(
        `DELETE FROM tasks WHERE id = ?`,
        [args.id]
      );

      return deletedTask;
    },
  },
};

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
  },
});

const apolloServer = new ApolloServer({ typeDefs, resolvers, context: { db } });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
