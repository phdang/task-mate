import { useRouter } from 'next/router';
import Error from 'next/error';
import Head from 'next/head';
import CreateTaskForm from '../components/CreateTaskForm';
import TaskFilter from '../components/TaskFilter';
import TaskList from '../components/TaskList';
import {
  TasksDocument,
  TasksQuery,
  TasksQueryVariables,
  TaskStatus,
  useTasksQuery,
} from '../generated/graphql-frontend';
import { initializeApollo } from '../lib/client';
import { GetServerSideProps } from 'next';
import { useEffect, useRef } from 'react';

export const isTaskStatus = (value: String): value is TaskStatus => {
  return Object.values(TaskStatus).includes(value as TaskStatus);
};

export default function Home() {
  const router = useRouter();
  const status =
    typeof router.query.status === 'string' ? router.query.status : undefined;
  const prevStatus = useRef(status);
  useEffect(() => {
    prevStatus.current = status;
  }, [status]);

  if (status !== undefined && !isTaskStatus(status)) {
    return <Error statusCode={404} />;
  }

  const result = useTasksQuery!({
    variables: { status },
    fetchPolicy:
      prevStatus.current === status ? 'cache-first' : 'cache-and-network',
  });
  const tasks = result.data?.tasks;
  return (
    <div>
      <Head>
        <title>Tasks</title>
        <meta name='description' content='Generated Tasks' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='padding-class'>
        <TaskFilter status={status} />
        <CreateTaskForm onSuccess={result.refetch} />
        {result.loading && !tasks ? (
          <p>Loading Tasks...</p>
        ) : result.error ? (
          <p>An Error Occurred</p>
        ) : tasks && tasks.length ? (
          <TaskList tasks={tasks} />
        ) : (
          <p className='no-tasks-message'>You have got no tasks</p>
        )}
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const status =
    typeof context.params?.status === 'string'
      ? context.params.status
      : undefined;
  if (status === undefined || isTaskStatus(status)) {
    const apolloClient = initializeApollo();
    await apolloClient.query<TasksQuery, TasksQueryVariables>({
      query: TasksDocument,
      variables: { status },
    });
    return {
      props: {
        initialApolloState: apolloClient.cache.extract(),
      },
    };
  }
  return { props: {} };
};
