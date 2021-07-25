import React, { useState } from 'react';
import { useCreateTaskMutation } from '../generated/graphql-frontend';

interface Props {
  onSuccess: () => void;
}

const CreateTaskForm: React.FC<Props> = function ({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [createTask, { loading, error }] = useCreateTaskMutation({
    onCompleted: () => {
      setTitle('');
      return onSuccess();
    },
  });
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loading) {
      try {
        await createTask({
          variables: {
            input: {
              title,
            },
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
  };
  return (
    <form className='form' onSubmit={handleFormSubmit}>
      {error ? <p className='alert-error'>An error occurred.</p> : null}
      <input
        type='text'
        name='title'
        placeholder='What would you like to get done?'
        autoComplete='off'
        className='text-input new-task-text-input'
        value={title}
        onChange={handleTitleChange}
      />
    </form>
  );
};

export default CreateTaskForm;
