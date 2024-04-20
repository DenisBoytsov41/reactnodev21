import React from 'react';

const InputField = ({ label, id, type, name, value, onChange, required, minLength, maxLength }) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}:</label>
      <input 
        type={type} 
        autoComplete="off" 
        className="form-control" 
        id={id} 
        name={name} 
        value={value} 
        onChange={onChange}
        required={required} 
        minLength={minLength} 
        maxLength={maxLength} 
      />
    </div>
  );
};


const CheckboxField = ({ label, id, name, value, checked, onChange, required }) => {
  return (
    <div className="form-group form-check">
      <input 
        type="checkbox" 
        autoComplete="off" 
        className="form-check-input" 
        id={id} 
        name={name} 
        value={value} 
        checked={checked} 
        onChange={onChange}
        required={required} 
      />
      <label className="form-check-label" htmlFor={id}>{label}</label>
    </div>
  );
};

const SelectField = ({ label, id, name, value, onChange, required, options }) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}:</label>
      <select 
        className="form-control" 
        autoComplete="off" 
        id={id} 
        name={name} 
        value={value} 
        onChange={onChange}
        required={required}
      >
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
};

const RadioButton = ({ id, name, value, label, checked, onChange, required }) => {
  return (
    <div className="form-check form-check-inline">
      <input 
        type="radio" 
        autoComplete="off" 
        className="form-check-input" 
        id={id} 
        name={name} 
        value={value} 
        checked={checked} 
        onChange={onChange}
        required={required} 
      />
      <label className="form-check-label" htmlFor={id}>{label}</label>
    </div>
  );
};

const SubmitButton = ({ label }) => {
  return (
    <div className="form-group">
      <button type="submit" className="btn btn-primary">{label}</button>
    </div>
  );
};


export { InputField, CheckboxField, SelectField, RadioButton, SubmitButton };
