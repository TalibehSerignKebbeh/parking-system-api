function validateEmail(email) {
    // Add your email validation logic here
    return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);
};
function validatePassword(password) {
    // Add your password validation logic here
    // Example: At least 6 characters, with at least one letter and one number
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
};


module.exports = {validateEmail, validatePassword}