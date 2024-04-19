import React from 'react';

const MyButton = (props) => {
  const { onClick, className, children, id } = props;

  return (
    <button id={id} onClick={onClick} className={className}>
      {children}
    </button>
  );
};

export default MyButton;
