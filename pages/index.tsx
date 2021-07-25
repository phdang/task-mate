import Head from 'next/head';
import { TasksDocument, TasksQuery, useTasksQuery } from '../generated/graphql-frontend';
import { initializeApollo } from '../lib/client';
import styles from '../styles/Home.module.css';

export default function Home() {
  const result = useTasksQuery();
  const tasks = result.data?.tasks;
  return (
    <div className={styles.container}>
      <Head>
        <title>Tasks</title>
        <meta name='description' content='Generated Tasks' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Tasks
        </h1>
        {tasks &&
          tasks.length &&
          tasks.map((task) => {
            return (
              <div key={task.id}>
                {task.title} - {task.status}
              </div>
            );
          })}
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
