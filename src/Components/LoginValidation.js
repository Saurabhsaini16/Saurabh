
export function LoginValidation(values) {
    let error = {};

    // Email validation pattern
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Password validation pattern
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    // Email validation
    if (values.email === "") {
        error.email = "Email should not be empty";
    } else if (!email_pattern.test(values.email)) {
        error.email = "Email format is incorrect";
    } else {
        error.email = "";
    }

    // Password validation
    if (values.password === "") {
        error.password = "Password should not be empty";
    } else if (!password_pattern.test(values.password)) {
        error.password = "Password should contain at least 8 characters, one uppercase letter, one lowercase letter, and one number";
    } else {
        error.password = "";
    }

    return error;
}

export default LoginValidation;
