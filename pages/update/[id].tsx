import { GetServerSideProps } from 'next';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import {
  TaskDocument,
  TaskQuery,
  TaskQueryVariables,
  useTaskQuery,
} from '../../generated/graphql-frontend';
import { initializeApollo } from '../../lib/client';
import Error from 'next/error';
import UpdateTaskForm from '../../components/UpdateTaskForm';
interface Props {}

const UpdateTask: React.FC<Props> = function () {
  const router = useRouter();
  const id =
    typeof router.query?.id === 'string'
      ? parseInt(router.query.id)
      : undefined;
  if (!id) {
    return <Error statusCode={404}></Error>;
  }
  const { data, loading, error } = useTaskQuery!({ variables: { id } });
  const task = data?.task;
  return loading ? (
    <p>Loading...</p>
  ) : error ? (
    <p className='alert-error'>An error occurred</p>
  ) : task ? (
    <UpdateTaskForm
      id={task.id}
      initialValues={{ title: task.title, status: task.status }}
    />
  ) : (
    <Error statusCode={404} />
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id =
    typeof context.params?.id === 'string'
      ? parseInt(context.params.id)
      : undefined;
  if (id) {
    const apolloClient = initializeApollo();
    await apolloClient.query<TaskQuery, TaskQueryVariables>({
      query: TaskDocument,
      variables: { id },
    });
    return { props: { initialApolloState: apolloClient.cache.extract() } };
  }
  return { props: {} };
};

export default UpdateTask;
