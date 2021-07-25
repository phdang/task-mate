import { useRouter } from 'next/dist/client/router';
import React, { useState } from 'react';
import {
  TaskStatus,
  useUpdateTaskMutation,
} from '../generated/graphql-frontend';

interface Values {
  title: string;
  status: TaskStatus;
}

interface Props {
  id: number;
  initialValues: Values;
}

const UpdateTaskForm: React.FC<Props> = function ({ id, initialValues }) {
  const [values, setValues] = useState<Values>(initialValues);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const [updateTask, { loading, error }] = useUpdateTaskMutation();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await updateTask({
      variables: { input: { id, title: values.title, status: values.status } },
    });
    if (result.data?.updateTask) {
      router.push('/');
    }
  };

  let errorMessage: string = '';

  if (error) {
    if (error.networkError) {
      errorMessage = 'Please check your internet connection';
    } else if (error.graphQLErrors) {
      errorMessage = 'Sorry, an error occurred!';
    } else {
      errorMessage = error.message;
    }
  }

  return (
    <form className='padding-class' onSubmit={handleSubmit}>
      {errorMessage ? <p className='alert-error'>{errorMessage}</p> : null}
      <p>
        <label className='field-label'>Title</label>
        <input
          type='text'
          name='title'
          className='text-input'
          value={values.title}
          onChange={handleChange}
        />
        <select
          onChange={handleChange}
          value={values.status}
          name='status'
          className='select-input'
        >
          <option value={TaskStatus.Active}>Active</option>
          <option value={TaskStatus.Completed}>Completed</option>
        </select>
      </p>
      <p>
        <button className='button' disabled={loading}>
          {loading ? 'Loading...' : 'Save'}
        </button>
      </p>
    </form>
  );
};
export default UpdateTaskForm;
