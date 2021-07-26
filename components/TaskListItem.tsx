import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Task,
  TaskStatus,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '../generated/graphql-frontend';
import { Reference } from '@apollo/client';
import { isTaskStatus } from '../pages/[[...status]]';
import { useRouter } from 'next/router';
import { isArray } from 'lodash';

interface Props {
  task: Task;
}

const TaskListItem: React.FC<Props> = function ({ task }) {
  const router = useRouter();
  const statusQueryParam =
    isArray(router.query.status) && router.query.status.length
      ? router.query.status[0]
      : undefined;
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

  const [updateTask, { loading: loadingStatus, error: errorStatus }] =
    useUpdateTaskMutation({
      errorPolicy: 'all',
      update: (cache, result) => {
        const updateTask = result.data?.updateTask;
        if (updateTask && statusQueryParam !== undefined) {
          cache.modify({
            fields: {
              tasks(TaskRefs: Reference[], { readField }) {
                console.log(TaskRefs);
                return TaskRefs.filter((TaskRef) => {
                  return readField('id', TaskRef) !== updateTask.id;
                });
              },
            },
          });
        }
      },
    });

  const handleStatusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const status = e.target.checked ? 'completed' : 'active';
    if (isTaskStatus(status)) {
      try {
        await updateTask({ variables: { input: { id: task.id, status } } });
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    if (errorStatus) {
      alert('An error occurred during updating task !');
    }
  }, [errorStatus]);

  return (
    <li className='task-list-item'>
      <label className='checkbox'>
        <input
          type='checkbox'
          onChange={handleStatusChange}
          checked={task.status === TaskStatus.Completed}
          disabled={loadingStatus}
        />
        <span className='checkbox-mark'>&#10003;</span>
      </label>
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
