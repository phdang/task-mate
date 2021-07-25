import React, { useEffect } from 'react';
import Link from 'next/link';
import { Task, useDeleteTaskMutation } from '../generated/graphql-frontend';
import { Reference } from '@apollo/client';

interface Props {
  task: Task;
}

const TaskListItem: React.FC<Props> = function ({ task }) {
  const [deleteTask, { loading, error }] = useDeleteTaskMutation({
    variables: { id: task.id },
    errorPolicy: 'all',
    update: (cache, result) => {
      const deletedTask = result.data?.deleteTask;
      if (deletedTask) {
        cache.modify({
          fields: {
            tasks(TaskRefs: Reference[], { readField }) {
              return TaskRefs.filter((TaskRef) => {
                return readField('id', TaskRef) !== deletedTask.id;
              });
            },
          },
        });
      }
    },
  });

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    deleteTask();
  };

  useEffect(() => {
    if (error) {
      alert('An error occurred !');
    }
  }, [error]);

  return (
    <li className='task-list-item'>
      <Link href='/update/[id]' as={`/update/${task.id}`}>
        <a className='task-list-item-title'>
          {task.title} - {task.status}
        </a>
      </Link>
      {!loading ? (
        <button className='task-list-item-delete' onClick={handleClick}>
          &times;
        </button>
      ) : null}
    </li>
  );
};

export default TaskListItem;
