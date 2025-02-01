export function SingupValidation(values){
    let error={}
    const email_pattern= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const password_pattern= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(values.name===""){
        error.name="Name should not be empty"
    }else{
        error.name=""
    }
    if(values.email===""){
        error.email="Email should not be empty"
    }else if(email_pattern.test(values.email)){
        error.email="Email Did't Match"
    }else{
        error.email=""
    }
    if(values.password===""){
        error.password="Password should not be empty"
    }else if(password_pattern.test(values.password)){
        error.password="Password Did't Match"
    }else{
        error.password=""
    }
    return error;
    }

export default SingupValidation;