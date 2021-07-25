import Head from 'next/head';
import CreateTaskForm from '../components/CreateTaskForm';
import TaskList from '../components/TaskList';
import {
  TasksDocument,
  TasksQuery,
  useTasksQuery,
} from '../generated/graphql-frontend';
import { initializeApollo } from '../lib/client';

export default function Home() {
  const result = useTasksQuery();
  const tasks = result.data?.tasks;
  return (
    <div>
      <Head>
        <title>Tasks</title>
        <meta name='description' content='Generated Tasks' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='padding-class'>
        <CreateTaskForm onSuccess={result.refetch} />
        {result.loading ? (
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

export const getStaticProps = async () => {
  const apolloClient = initializeApollo();
  await apolloClient.query<TasksQuery>({
    query: TasksDocument,
  });
  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
};
