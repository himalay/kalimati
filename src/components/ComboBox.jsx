import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'

export default function ComboBox({ label, options, value, onChange }) {
  return (
    <Autocomplete
      options={options}
      style={{ width: 500 }}
      value={value}
      renderInput={(params) => <TextField {...params} variant="outlined" label={label} />}
      onChange={onChange}
    />
  )
}

ComboBox.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
}
