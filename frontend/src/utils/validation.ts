
import { AddAssetFormData, ChangePasswordFormData, LoginFormData, SignUpFormData } from '../interfaces/authInterface'
import { Fields, FormErrors } from '../interfaces/formInterface';

export const validateForm = (field: keyof Fields | string, value: string) => {
  switch (field) {
    case 'name':
      if (!value.trim()) {
        return { error: 'Name is required!' };
      } else if (!(/^[a-zA-Z ]{2,30}$/.test(value))) {
        return { error: 'Enter a valid name!' };
      } else {
        return { error: '' };
      }
    case 'age':
      if (!value.trim()) {
        return { error: 'Age is required!' };
      } else if (isNaN(Number(value))) {
        return { error: 'Enter a valid age!' };
      } else if (Number(value) < 0 || Number(value) > 100) {
        return { error: 'Enter a valid age!' };
      } else {
        return { error: '' };
      }
    case 'gender':
      if (!value.trim()) {
        return { error: 'Gender is required!' };
      }
      return { error: '' };

    case 'phone':
      if (!value.trim()) {
        return { error: 'Phone is required!' };
      } else if (!(/^[0-9]{10}$/.test(value))) {
        return { error: 'Enter a valid phone number!' };
      }
      return { error: '' };

    case 'email':
      if (!value.trim()) {
        return { error: 'Email is required!' };
      } else if (!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))) {
        return { error: 'Enter a valid email!' };
      }
      return { error: '' };

    case 'password':
      if (!value.trim()) {
        return { error: 'Password is required!' };
      } else if (value.length < 8) {
        return { error: 'Password must be atleast 8 characters!' };
      } else if (!(/^(?!.*\s)(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,64}$/).test(value)
      ) {
        return { error: 'Password must include atleast one letter, number and special character!' }
      }
      return { error: '' };

    case 'fname':
    case 'lname':
      if (!value.trim()) {
        return { error: `${field === 'fname' ? 'First' : 'Last'} name is required!` };
      } else if (!(/^[a-zA-Z ]{2,30}$/.test(value))) {
        return { error: `Enter a valid ${field === 'fname' ? 'first' : 'last'} name!` };
      }
      return { error: '' };

    case 'street':
    case 'city':
    case 'state':
    case 'country':
      if (!value.trim()) {
        return { error: `${field} is required!` };
      }
      return { error: '' };

    case 'pincode':
      if (!value.trim()) {
        return { error: 'Pincode is required!' };
      } else if (isNaN(Number(value))) {
        return { error: 'Enter a valid pincode!' };
      } else if (value.length !== 6) {
        return { error: 'Pincode must be 6 characters!' };
      }
      return { error: '' };

    case 'type':
      if (!value) return { isValid: false, error: 'Please select assistance type' };
      if (!['volunteer', 'ambulance'].includes(value)) {
        return { isValid: false, error: 'Invalid assistance type' };
      }
      return { isValid: true };

    case 'volunteerType':
      if (value === 'volunteer' && !['medical', 'eldercare', 'maintenance', 'transportation', 'general'].includes(value)) {
        return { isValid: false, error: 'Please select volunteer type' };
      }
      return { isValid: true };

    case 'priority':
      if (!['urgent', 'normal'].includes(value)) {
        return { isValid: false, error: 'Please select priority level' };
      }
      return { isValid: true };

    case 'requestedDate':
      if (!value) return { isValid: false, error: 'Please select a date' };
      if (new Date(value) < new Date()) {
        return { isValid: false, error: 'Date cannot be in the past' };
      }
      return { isValid: true };

    case 'requestedTime':
      if (!value) return { isValid: false, error: 'Please select a time' };
      if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
        return { isValid: false, error: 'Invalid time format' };
      }
      return { isValid: true };

    case 'description':
      if (!value?.trim()) return { isValid: false, error: 'Please provide a description' };
      if (value.length > 500) return { isValid: false, error: 'Description too long (max 500 characters)' };
      return { isValid: true };

    case 'selectedAddressId':
      if (!value?.trim()) return { isValid: false, error: 'Please select an address' };
      return { isValid: true };

    default:
      return { isValid: true };
  }
}



export const validateForm1 = (formData: SignUpFormData) => {
  const errors: FormErrors = { name: '', email: '', password: '' };
  let isValid = true

  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  } else if (!/^[a-zA-Z ]{2,30}$/.test(formData.name)) {
    errors.name = 'Please enter a valid name'
    isValid = false
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }

  if (!formData.password.trim()) {
    errors.password = 'Password is required'
    isValid = false
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
    errors.password = 'Password must include a number and special character'
    isValid = false
  }

  return { isValid, errors }
}

export const validateLoginForm = (formData: LoginFormData) => {
  const errors = { email: '', password: '' };
  let isValid = true

  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }

  if (!formData.password.trim()) {
    errors.password = 'Password is required'
    isValid = false
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
    errors.password = 'Password must include a number and special character'
    isValid = false
  }

  return { isValid, errors }
}

export const validateEmail = (email: string) => {
  let error = '';
  let isValid = true

  if (!email.trim()) {
    error = 'Email is required'
    isValid = false
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    error = 'Please enter a valid email'
    isValid = false
  }

  return { isValid, error }
}

export const validateChangePassword = (formData: ChangePasswordFormData) => {
  const errors = { currentPassword: '', newPassword: '', confirmPassword: '' };
  let isValid = true

  if (!formData.currentPassword.trim()) {
    errors.currentPassword = 'Current password required'
    isValid = false
  }

  if (!formData.newPassword.trim()) {
    errors.newPassword = 'New password required'
    isValid = false
  } else if (formData.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters'
    isValid = false
  } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.newPassword)) {
    errors.newPassword = 'Password must include a number and special character'
    isValid = false
  }

  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = 'Confirm password required'
    isValid = false
  } else if (formData.confirmPassword.length < 8) {
    errors.confirmPassword = 'Password must be at least 8 characters'
    isValid = false
  } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.confirmPassword)) {
    errors.confirmPassword = 'Password must include a number and special character'
    isValid = false
  }

  if (formData.confirmPassword.trim() !== formData.newPassword.trim()) {
    errors.confirmPassword = 'Password do not match!'
    isValid = false
  }

  return { isValid, errors }
}

export const validateAddAsset = (formData: AddAssetFormData) => {
  const errors: any = { name: '', category: '', description: '', stocks: '', image: '' };
  let isValid = true

  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  } else if (!/^[a-zA-Z ]{2,30}$/.test(formData.name)) {
    errors.name = 'Please enter a valid name'
    isValid = false
  }

  if (!formData.category.trim()) {
    errors.category = 'Category is required'
    isValid = false
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required'
    isValid = false
  }

  if (formData.stocks === null || formData.stocks === undefined || formData.stocks === '') {
    errors.stocks = 'Stock is required'
    isValid = false
  } else if (Number(formData.stocks) < 0) {
    errors.stocks = ' Please add a valid stock!'
    isValid = false
  } else if (Number(formData.stocks) > 50) {
    errors.stocks = 'Maximum 50 stocks are allowed!'
    isValid = false
  }

  return { isValid, errors }
}
